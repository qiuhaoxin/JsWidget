(function (win, doc) {
    var m = Math, dummyStyle = doc.createElement('div').style,
        vendor = (function () {
            var vendors = 't,webkitT,MozT,msT,OT'.split(','), t, i = 0, len = vendors.length;
            for (; i < len; i++) {
                t = vendors[i] + "ransform";
                if (t in dummyStyle) {
                    return vendors[i].substring(0, vendors[i].length - 1);
                }
            }
            return false;
        })(),
        cssVendor = vendor ? "-" + vendor.toLowerCase() + "-" : '',
        transform = prefixStyle('transform'),
        transitionProperty = prefixStyle('transitionProperty'),
        transitionDuration = prefixStyle('transitionDuration'),
        transformOrigin = prefixStyle('transformOrigin'),
	    transitionTimingFunction = prefixStyle('transitionTimingFunction'),
	    transitionDelay = prefixStyle('transitionDelay')

    isAndroid = (/android/gi).test(navigator.appVersion),
    isIDevice = (/iphone|ipad/gi).test(navigator.appVersion),
    isTouchPad = (/hp-tablet/gi).test(navigator.appVersion),
    has3d = prefixStyle('perspective') in dummyStyle,

     hasTouch = 'ontouchstart' in window && !isTouchPad,
     hasTransform = vendor !== false,
     hasTransitionEnd = prefixStyle('transition') in dummyStyle,
     RESIZE_EV = 'onorientationchange' in window ? 'orientationchange' : 'resize',
     START_EV = hasTouch ? 'touchstart' : 'mousedown',
     MOVE_EV = hasTouch ? 'touchmove' : 'mousemove',
     END_EV = hasTouch ? 'touchend' : 'mouseup',
     CANCEL_EV = hasTouch ? 'touchcancel' : 'mouseup',
     TRNEND_EV = (function () {
         if (vendor === false) return false;

         var transitionEnd = {
             '': 'transitionend',
             'webkit': 'webkitTransitionEnd',
             'Moz': 'transitionend',
             'O': 'otransitionend',
             'ms': 'MSTransitionEnd'
         };

         return transitionEnd[vendor];
     })(),
    //
       nextFrame = (function () {
           return window.requestAnimationFrame ||
               window.webkitRequestAnimationFrame ||
               window.mozRequestAnimationFrame ||
               window.oRequestAnimationFrame ||
               window.msRequestAnimationFrame ||
               function (callback) { return setTimeout(callback, 1); };
       })(),
      cancelFrame = (function () {
          return window.cancelRequestAnimationFrame ||
              window.webkitCancelAnimationFrame ||
              window.webkitCancelRequestAnimationFrame ||
              window.mozCancelRequestAnimationFrame ||
              window.oCancelRequestAnimationFrame ||
              window.msCancelRequestAnimationFrame ||
              clearTimeout;
      })(),
     LOCKED_PORT = 1, LOCKED_VERTICAL = 2, NOLOCKED = 0;
    win.K3WISEMobile = win.K3WISEMobile || {};
    win.K3WISEMobile.scroller = win.K3WISEMobile.scroller || {};
    //触摸滑动的对象和对对象的配置
    K3WISEMobile.scroller = function (target, opts) {
        //document.body.style['backgroundColor'] = "#fff";
      //  document.getElementById('k3mbchartwraper').style['backgroundColor']="#fff";
        var initX = initY = 0;
        if (arguments.length < 1) return;

        target = typeof target == 'string' ? doc.getElementById(target) : target;
        this.target = target;
        this.cfgs = {
            isLocked: 1,//0：不做锁定控制， 1：锁定控制
            Locked: NOLOCKED,//默认不做锁定
            Boundry: true,
            Fixed: 1,   // 
            hScroll: true,
            vScroll: true,
            momentum: true,//是否允许惯性动能 
            useTransition: true,
            options: null,
        }
        if (this.get('useTransition')) this.target.style[transitionTimingFunction] = 'cubic-bezier(0.33,0.66,0.66,1)';
    }
    K3WISEMobile.scroller.prototype = {
        touchTarget: null,//可触摸区域
        startPos: { x: 0, y: 0 },
        startX: 0,//记录手指按下x轴位置
        startY: 0,//记录手指按下的y轴位置
        direction: '',
        titleArr: [],//存放title
        cssObj: null,
        COLUMN_WIDTH: 80,//默认列宽

        ScrollX: { min: 0, max: 0 },
        ScrollY: { min: 0, max: 0 },

        WraperW: 0,//屏幕宽
        WraperH: 0,//屏幕高
        ContaienrH: 0,//容器高度
        ContainerW: 0,//容器宽度

        moving: false,
        Animating: false,

        touchStartTime: 0,
        toucheEndTime: 0,
        //滑动method
        handleEvent: function (e) {
            var that = this;
            switch (e.type) {
                case START_EV:
                    that.start(e);
                    break;
                case MOVE_EV:
                    that.move(e);
                    break;
                case END_EV:
                    CANCEL_EV:
                        that.end(e);
                    break;
                case TRNEND_EV:
                    that.transitionEnd(e);
                    break;
            }
        },
        start: function (e) {
            e.preventDefault();
            var that = this;
            var touche = hasTouch ? e.touches[0] : touches;
            this.initX = touche.pageX, this.initY = touche.pageY, this.touchStartTime = new Date() * 1;
            that.distX = 0;
            that.distY = 0;
            that.absDistX = 0;
            that.absDistY = 0;

            that.startX = that.startPos.x;
            that.startY = that.startPos.y;

            that._bind(MOVE_EV, that.touchTarget);
            that._bind(END_EV, that.touchTarget);
            that._bind(TRNEND_EV, that.touchTarget);


        },
        move: function (e) {
            e.preventDefault();
            e.stopPropagation();
            var that = this;
            var point = hasTouch ? e.touches[0] : touches,
                touchX = point.pageX, touchY = point.pageY,
                deltaX = touchX - that.initX,
                deltaY = touchY - that.initY,
                newX = that.startPos.x + deltaX,
                newY = that.startPos.y + deltaY;

            that.distX += deltaX;
            that.distY += deltaY;
            that.absDistX = m.abs(that.distX);
            that.absDistY = m.abs(that.distY);
            if (that.absDistX < 6 && that.absDistY < 6) {
                return;
            }
            that.moving = true;

            if (that.get('isLocked')) {
                if ((that.absDistX > that.absDistY + 10) && (that.get('Locked') == 0 || that.get('Locked') == 2)) {
                    if (that.direction == 'h') return;
                    that.direction = 'v';
                    that.set('Locked', LOCKED_VERTICAL);//x 滑动  y 锁定 2
                    newY = that.startPos.y;
                    if (that.touchTarget != that.ActiveWraper) {
                        that._unbind(START_EV, that.touchTarget);
                        that._unbind(MOVE_EV, that.touchTarget);
                        that._unbind(END_EV, that.touchTarget);
                        that.touchTarget = that.ActiveWraper;
                        that._bind(START_EV, that.touchTarget);
                    }
                } else if ((that.absDistY > that.absDistX + 10) && (that.get('Locked') == 0 || that.get('Locked') == 1)) {
                    if (that.direction == 'v') return;
                    that.direction = 'h';
                    that.set('Locked', LOCKED_PORT);
                    newX = that.startPos.x == 0 ? that.startPos.x : 0;
                    if (that.touchTarget != that.target) {
                        that.touchTarget = that.target;
                        that._bind(START_EV, that.touchTarget);
                    }
                } else {
                    that.set('Locked', 0);
                }
            }
            if (that.get('Locked') != 0) {
                that._pos(newX, newY);
                that.initX = touchX;
                that.initY = touchY;
            }

        },
        end: function (e) {
            e.preventDefault();
            e.stopPropagation();
            var that = this;
            this.toucheEndTime = new Date() * 1;
            var duration = this.toucheEndTime - this.touchStartTime,//duration between touchstart and touchend
                touches = hasTouch ? e.touches[0] : e,
                momentumX = { dist: 0, time: 0 }, momentumY = { dist: 0, time: 0 },
                newPosX = that.startPos.x,
                newPosY = that.startPos.y;
            that._unbind(MOVE_EV, that.touchTarget);
            that._unbind(END_EV, that.touchTarget);
            //快速滑动的效果处理
            if (duration < 300 && (that.absDistX > 20 || that.absDistY > 20) && that.get('momentum')) {
                //  momentumX = newPosX ? that._momentum(newPosX - that.startX, duration, -that.startPos.x, that.ContainerW - that.WraperW + that.startPos.x, that.get('Boundry') ? 375 : 0) : 0;
                momentumX = newPosX ? that._momentum(newPosX - that.startX, duration, -that.startPos.x + that.ScrollX.min, that.touchTarget.offsetWidth - (that.WraperW - that.getWidth('freeze', 1)) + that.startPos.x, that.get('Boundry') ? 375 : 0) : 0;
                momentumY = newPosY ? that._momentum(newPosY - that.startY, duration, -that.startPos.y + that.ScrollY.min, that.touchTarget.offsetHeight - (that.WraperH - 60) + that.startPos.y, 600) : 0;
                newPosX = that.startPos.x + momentumX.dist;
                newPosY = that.startPos.y + momentumY.dist;
                //if((newPosX>0&&newPosX>that.ScrollX.min)||(that.startPos.x<that.ScrollX.max&&newPosX<that.ScrollX.max)){
                //    momentumX.dist = 0;
                //    momentumX.time = 0;
                //}
            }
            if (momentumX.dist || momentumY.dist) {
                newDuration = m.max(m.max(momentumX.time, momentumY.time), 10);
                that._startAnim(newPosX, newPosY, newDuration);
            }
            if (that.moving) {
                var locked = that.get('Locked');
                if (that.startPos.x > that.ScrollX.min) {
                    that.startPos.x = that.ScrollX.min;
                    // that.startPos.y = 0;
                } else if (that.startPos.x < that.ScrollX.max) {
                    that.startPos.x = that.ScrollX.max;
                    //that.startPos.y = 0;
                }
                if (that.startPos.y > that.ScrollY.min) {
                    that.startPos.y = that.ScrollY.min;
                } else if (that.startPos.y < that.ScrollY.max) {
                    that.startPos.y = that.ScrollY.max;
                }


                that._transitionTime(200);
                that.touchTarget.style[transform] = "translate(" + (that.get('Locked') == 2 ? that.startPos.x : 0) + "px," + (that.get('Locked') == 1 ? that.startPos.y : 0) + "px)";
                that._transitionTime(200);
                setTimeout(function () {
                    that._transitionTime(0);
                }, 400);
            }
            that.moving = false;

            that.set('Locked', 0);
            that.direction = '';
        },
        _startAnim: function (newPosX, newPosY, duration) {
            var that = this, animate;
            if (that.Animating) return;
            that.Animating = true;

            if (that.get('useTransition')) {
                that._transitionTime(duration);
                that._pos(m.round(newPosX), m.round(newPosY));
                that.Animating = false;
                setTimeout(function () {
                    that._transitionTime(0);
                }, duration + 200)
            }
        },
        _transitionTime: function (time) {
            time = time + "ms";
            this.touchTarget.style[transitionDuration] = time;
        },
        _removeAttribute: function (attributeName) {
            var cssStr = this.target.style.cssText,
                regExpStr = "transition-duration" + ":";
            if (cssStr.indexOf(regExpStr) > -1) {
                cssStr = cssStr.replace(regExpStr, "");
            }
        },
        //move3.js
        _resetScroll: function (offsetObj) {
            var that = this;
            var targetW = that.touchTarget ? that.touchTarget.clientWidth : 0,
                targetH = that.touchTarget ? that.touchTarget.clientHeight : 0,
            winW = doc.body.clientWidth;
            that.ContaienrH = that.target.offsetHeight;
            that.ContainerW = that.target.offsetWidth;
            if (that.get('hScroll')) {
                that.ScrollX.min = offsetObj && offsetObj.offsetX;//////////////////////////////
                that.ScrollX.max = winW - targetW - 10;
            }
            if (that.get('vScroll')) {
                var pos = getAbsulotePosition(that.target);
                that.ScrollY.min = 0;
                that.ScrollY.max = (that.WraperH - pos.top - that.ContaienrH);
            }
        },
        //动势 
        _momentum: function (dist, time, maxDistUpper, maxDistLower, size) {
            var deceleration = 0.0006,
            speed = m.abs(dist) / time,
            newDist = (speed * speed) / (2 * deceleration),
            newTime = 0, outsideDist = 0;
            // Proportinally reduce speed if we are outside of the boundaries
            if (dist > 0 && newDist > maxDistUpper) {
                outsideDist = size / (12 / (newDist / speed * deceleration));
                maxDistUpper = maxDistUpper + outsideDist;
                speed = speed * maxDistUpper / newDist;
                newDist = maxDistUpper;
            } else if (dist < 0 && newDist > maxDistLower) {
                outsideDist = size / (6 / (newDist / speed * deceleration));
                maxDistLower = maxDistLower + outsideDist;
                speed = speed * maxDistLower / newDist;
                newDist = maxDistLower;
            }
            newDist = newDist * (dist < 0 ? -1 : 1);
            newTime = speed / deceleration;

            return { dist: newDist, time: m.round(newTime) };
        },
        //移动
        _pos: function (posX, posY) {
            var that = this;
            posX = that.get('hScroll') && that.get('Locked') == 2 ? posX : 0;
            posY = that.get('vScroll') && that.get('Locked') == 1 ? posY : 0;
            if (that.target) {
                that.touchTarget.style[transform] = "translate(" + posX + "px," + posY + "px)";
            }
            that.startPos.x = that.get('Locked') == 1 ? that.startPos.x : posX;
            that.startPos.y = that.get('Locked') == 2 ? that.startPos.y : posY;
        },
        transitionEnd: function (e) {
            var that = this;
        },
        init: function () {
            var that = this;
            that._bind(START_EV, that.touchTarget);
            if (this.get('useTransition')) this.touchTarget.style[transitionTimingFunction] = 'cubic-bezier(0.33,0.66,0.66,1)';

        },
        _bind: function (eventName, target, buddle) {
            var that = this;
            target.addEventListener(eventName, this, !!buddle);
        },
        _unbind: function (eventName, target, buddle) {
            var that = this;
            target.removeEventListener(eventName, this, !!buddle);
        },
        get: function (cfgName) {
            if (cfgName in this.cfgs) {
                return this.cfgs[cfgName];
            }
        },
        set: function (name, value) {
            this.cfgs[name] = value;
        },
        //绑定数据源  如果该方法传入的数据不为空则把容器的数据全部清空，只允许容器的内容为绑定的数据
        //也在这里完成对列宽的设置和冻结
        bindData: function (data, options) {
            var that = this;
            that.WraperH = window.screen.height;//
            that.WraperW = document.body.clientWidth;
            if (options != null || options != undefined) {
                that.set("options", options);
            }
            if (that.target && that.target.hasChildNodes()) {
                var child = that.target.children,
                    len = child && child.length;
                if (len > 0)
                    that.removeChild(that.target, child);
            }
            //如果要冻结列则对原数据进行划分：冻结和可滑动
            if (!options.Freeze) options.Freeze = '0';
            if (options.Freeze) {
                var freeze = options.Freeze;
                that.createArr(data, freeze);
                that.createActiveAndFreezeWraper();
            }

            var freezeDomStr = that.buildFreezeHTMLStr();
            var freezeDom = that.transformStrToDom(freezeDomStr);
            that.FreezeWraper.appendChild(freezeDom);
            if (that.FreezeWraper && that.target) that.target.appendChild(that.FreezeWraper);
            //用目标数据填充
            var domStr = that.buildActiveHTMLStr(that.ActiveArr);
            var dom = that.transformStrToDom(domStr);
            that.ActiveWraper.appendChild(dom);
            if (dom && that.target) that.target.appendChild(that.ActiveWraper);
            that.touchTarget = that.ActiveWraper;
            that.setColumnWidth();//对具体列宽设置
            that.setStyle();//对大的面板设置
            //初始化完毕，设置可触摸区域并绑定相应事件
            that.init();
        },

        transformStrToDom: function (domStr) {
            var that = this; 
            var DivContainer = doc.createElement("div");
            DivContainer.innerHTML = domStr;
            return DivContainer;
        },

        //当bindData 的Freeze参数不为空时，根据原数据构建冻结和活动数组
        createArr: function (data, freeze) {
            var that = this,
                freezeArr = [], activeArr = [];
            for (var i = 0, len = data.length; i < len; i++) {
                var freezeObj = {}, activeObj = {}, dataItem = data[i], t = 1;
                for (var key in dataItem) {
                    if (t <= freeze) {
                        freezeObj[key] = dataItem[key];
                    } else {
                        activeObj[key] = dataItem[key];
                    }
                    t++;
                }
                freezeArr.push(freezeObj);
                activeArr.push(activeObj);
            }
            that.ActiveLen = (t - 1 - freeze);//能活动的列数
            that.FreezeLen = freeze;//冻结的列数

            that.ActiveArr = activeArr;
            that.FreezeArr = freezeArr;
        },
        createActiveAndFreezeWraper: function () {
            var that = this;
            if (that.ActiveArr.length > 0) {
                that.ActiveWraper = doc.createElement('div');
                that.ActiveWraper.className = "k3wisebos-active-wraper";
            }
            if (that.FreezeArr.length > 0) {
                that.FreezeWraper = doc.createElement('div');
                that.FreezeWraper.className = "k3wisebos-freeze-wraper";

            }
        },
        _getValueFromObj: function (name, obj) {
            if (obj == null || obj == undefined) return;
            for (var key in obj) {
                if (key == name) return obj[key];
            }
            return null;
        },
        //
        createStyle: function (cssObj) {
            var headEle = doc.getElementsByTagName('head')[0];
            var styleEle = doc.getElementsByTagName("style");
            if (styleEle.length == 0) {
                if (doc.createStyleSheet)
                    styleEle = doc.createStyleSheet();//兼容IE
                else {
                    styleEle = doc.createElement("style");//w3c
                    styleEle.setAttribute("type", "text/css");
                    headEle.appendChild(styleEle);
                }
            }
            styleEle = styleEle[0];
            var addStyle = "";
            for (var key in cssObj) {
                addStyle += "." + key + "{width:" + cssObj[key] + "px;}\n\r";
            }
            styleEle.appendChild(doc.createTextNode(addStyle));
        },

        //根据配置来设置列宽
        setColumnWidth: function () {
            var that = this, options = that.get('options'),
                columnsWidth = options && options.ColumnsWidth,
                cssObj = {};
            for (var i = 0, len = that.titleArr.length; i < len; i++) {
                var item = that.titleArr[i];
                for (var key in item) {
                    var value = columnsWidth[key] || columnsWidth[key.toUpperCase()] || that.COLUMN_WIDTH;
                    cssObj[item[key]] = value;
                }
            }
            that.cssObj = cssObj;
            if (cssObj != null) that.createStyle(cssObj);
        },
        //offset 取一个偏移
        getWidth: function (flag, offset) {
            var cssObj = this.cssObj, start = 1, len = 0, totalWidth = 0;
            switch (flag) {
                case 'freeze':
                    len = this.FreezeLen;
                    break;
                case 'active':
                    start = parseInt(this.FreezeLen) + 1
                    len = this.titleArr.length;
                    break;
                case 'all':
                    start = 1;
                    len = this.titleArr.length;
                    break;
            }
            if (arguments.length == 2 && flag == 'freeze') {
                len = parseInt(this.FreezeLen) - offset;
            }
            for (var key in cssObj) {
                var num = parseInt(key.split('_')[1]);
                    if (num >= start && num <= len) {
                        totalWidth += parseInt(cssObj[key]);
                    }
            }
            return totalWidth;
        },
        //move3.js  设置当冻结的列的总宽度超过屏幕宽度的一半时，左移直至只剩一个列的宽度
        setStyle: function () {
            var that = this;
            that.ActiveWraper.style.cssText = "overflow:hidden";
            var activeWidth = that.getWidth('active');
            that.target.style["width"] = (that.getWidth('all')) + "px";
            that.ActiveWraper.style["width"] = activeWidth + "px";
            that.ActiveWraper.style["color"] = "#909ba6";
            that.FreezeWraper.style["position"] = "absolute";
            that.FreezeWraper.style["z-index"] = "100";
            that.FreezeWraper.style["background-color"] = "#f5f5f5";
            that.FreezeWraper.style['top'] = "0px";
            var width = that.getWidth('freeze');
            that.FreezeWraper.style["width"] = width + "px";
            if (that.ActiveWraper.offsetHeight)
                that.target.style.height = (parseInt(that.ActiveWraper.offsetHeight)+30) + "px";
            if (width > (that.WraperW)) {
                var offsetWidth = that.getWidth('freeze', 1);
                that.FreezeWraper.style["left"] = -offsetWidth + "px";
                that.ActiveWraper.style[transform] = "translate(" + (width - offsetWidth + 16) + "px,0px)";//设置可滑动的偏移值
                that._resetScroll({ offsetX: (width - offsetWidth + 10), offsetY: 0 });//重新设置各个方向可滑动的距离
                that.startPos.x = (width - offsetWidth + 10);
            } else {
                that.ActiveWraper.style[transform] = "translate(" + (width + 10) + "px,0px)";//设置可滑动的偏移值
                that._resetScroll({ offsetX: (width + 10), offsetY: 0 });//重新设置各个方向可滑动的距离
                that.startPos.x = (width + 10);
            }
        },
        //构建冻结列的DOM结构
        //考虑列宽的长度，当冻结的总宽度超过移动端的宽度的一半的时候，要左移一下冻结的列以便让能活动的列有足够的空间来滑动
        buildFreezeHTMLStr: function () {
            var that = this, titleObj = that.FreezeArr[0];
            var titleArr = [], titleStr = "<div class='k3wisebos-freezelist-title'>", columnNum = 1, contentStr = "<div class='k3wisebos-freezelist-content'>";
            for (var key in titleObj) {

                if (key != 'GetRandom') {
                    titleArr.push(key);
                    var className = "column_" + columnNum;
                    var tempObj = {};
                    tempObj[key] = className;
                    that.titleArr.push(tempObj);
                    var temp = "<div class='k3wisebos-list-title-item " + className + "'>" + key + "</div>";
                    titleStr += temp;
                    columnNum++;
                }
            }
            titleStr += "</div>";
            var rowNum = 1;
            for (var i = 0, len = that.FreezeArr.length; i < len; i++) {
                var dataItem = that.FreezeArr[i], classNameAs = "row_" + rowNum, itemStr = "<div class='k3wisebos-list-item " + classNameAs + "' style='" + (columnNum > 1 ? "clear:both" : '') + "'>";
                var columnNum = 1;
                var subtotalFlag = false;//标识是否是小计
                var sumtotalFlag = false;//标识是否合计
                var sumallFlag = false;//标识是否总计
                for (var key in dataItem) {
                    if (key != 'GetRandom') {
                        var columnClassName = "column_" + columnNum;
                        //后台取数到前台，有些日期格式展示为/Date(1199980800000)/  这时候要做转换
                        if (/\/Date\((-*\d+)\)/.test(dataItem[key])) {
                            var date1 = new Date(parseInt(RegExp.$1));
                            dataItem[key] = date1 && (date1.getFullYear() + "-" + ((date1.getMonth() + 1) < 10 ? '0' + (date1.getMonth() + 1) : (date1.getMonth() + 1)) + "-" + (date1.getDate() < 10 ? '0' + date1.getDate() : date1.getDate()));
                        }
                        //后台约定日期若为空，则匹配为''
                        if (/(1900-1-1)|(1900-01-01)/.test(dataItem[key])||String(dataItem[key]).toLowerCase()=='null') {
                            dataItem[key] = '';
                        }
                        var tempItem = "<div class='k3wisebos-list-column-item " + columnClassName + "'>" + dataItem[key] + "</div>"
                        itemStr += tempItem;
                        columnNum++;
                        if(dataItem[key]!=null){
                            if(dataItem[key].toString().indexOf('小计')!=-1){
                            subtotalFlag = true;
                        }
                        if(dataItem[key].toString().indexOf('合计')!=-1){
                            sumtotalFlag = true;
                        }
                        if(dataItem[key].toString().indexOf('总计')!=-1){
                            sumallFlag = true;
                        }

                        }
                        
                    }

                }
                if(subtotalFlag){
                     subclassName=classNameAs +"  subtotal";   
                    itemStr = itemStr.replace(classNameAs,subclassName);                    

                }
                if(sumtotalFlag){
                    sumclassName=classNameAs+"  sumtotal";   
                    itemStr = itemStr.replace(classNameAs,sumclassName);                    

                }
                if(sumallFlag){
                    sumclassName=classNameAs+"  sumalltotal";   
                    itemStr = itemStr.replace(classNameAs,sumclassName);                    

                }
                itemStr += "</div>";
                contentStr += itemStr;
                rowNum++;
            }
            contentStr += "</div>";
            return titleStr + contentStr;
        },
        //构建能活动的Dom 结构
        buildActiveHTMLStr: function (targetArr) {
            var that = this;
            var titleObj = targetArr && targetArr[0],
                columnNum = parseInt(that.FreezeLen) + 1;//

            var titleArr = [], titleStr = "<div class='k3wisebos-activelist-title'>", contentStr = "<div class='k3wisebos-activelist-content'>";
            for (var key in titleObj) {
                if (key != 'GetRandom') {
                    titleArr.push(key);

                    var className = "column_" + columnNum;
                    var tempObj = {};
                    tempObj[key] = className;
                    that.titleArr.push(tempObj);                    
                    var temp = "<div class='k3wisebos-list-title-item " + className + "'>" + key + "</div>";
                    titleStr += temp;
                    columnNum++;
                }

            }
            titleStr += "</div>";
            var rowNum = 1;
            for (var i = 0, len = targetArr.length; i < len; i++) {
                var classNameAs = "row_" + rowNum, itemStr = "<div class='k3wisebos-list-item " + classNameAs + "'>";
                var subclassName = "";
                var sumclassName="";
                var item = targetArr[i], columnNum = parseInt(that.FreezeLen) + 1;
                var subtotalFlag = false;//标识是否是小计
                var sumtotalFlag = false;//标识是否合计
                var sumallFlag = false;//标识是否总计
                for (var key in item) {
                    if (key != 'GetRandom') {
                        var columnClassName = "column_" + columnNum;
                        //后台取数到前台，有些日期格式展示为/Date(1199980800000)/  这时候要做转换
                        if (/\/Date\((-*\d+)\)/.test(item[key])) {
                            var date1 = new Date(parseInt(RegExp.$1));
                            item[key] = date1 && (date1.getFullYear() + "-" + ((date1.getMonth() + 1) < 10 ? '0' + (date1.getMonth() + 1) : (date1.getMonth() + 1)) + "-" + (date1.getDate() < 10 ? '0' + date1.getDate() : date1.getDate()));
                         
                        }
                        //后台约定日期若为空，则匹配为''
                        if (/^\s*(1900-1-1)|(1900-01-01)\s*$/.test(item[key]) || String(item[key]).toLowerCase() == 'null') {
                            item[key] = '';
                        }
                        var tempItem = "<div class='k3wisebos-list-column-item " + columnClassName + "'>" + item[key] + "</div>"
                        itemStr += tempItem;
                        columnNum++;  
                        if(item[key]!=null){
                                 if(item[key].toString().indexOf('小计')!=-1){
                                subtotalFlag = true;
                            }
                            if(item[key].toString().indexOf('合计')!=-1){
                                sumtotalFlag = true;
                            }
                            if(item[key].toString().indexOf('总计')!=-1){
                            sumallFlag = true;
                        }
                        }                      
                       
                    }


                }
                if(subtotalFlag){
                     subclassName=classNameAs +"  subtotal";   
                    itemStr = itemStr.replace(classNameAs,subclassName);                    

                }
                if(sumtotalFlag){
                    sumclassName=classNameAs+"  sumtotal";   
                    itemStr = itemStr.replace(classNameAs,sumclassName);                    

                }
                if(sumallFlag){
                    sumclassName=classNameAs+"  sumalltotal";   
                    itemStr = itemStr.replace(classNameAs,sumclassName);                    

                }
                itemStr += "</div>";
                contentStr += itemStr;
                rowNum++;
            }
            contentStr += "</div>";
            return titleStr + contentStr;
        },
        removeChild: function (target, childNodes) {
            // return;
            if (target) {
                for (var i = 0, len = childNodes.length; i < len; i++) {
                    target.removeChild(childNodes[0]);
                }
            }
        }

    }
    function prefixStyle(styleName) {
        if (!vendor) return styleName;
        styleName = styleName.charAt(0).toUpperCase() + styleName.subStr(1);
        return vendor + styleName;
    }
    function getAbsulotePosition(obj) {
        var obj1 = obj;
        var position = { "left": obj1.offsetLeft, "top": obj1.offsetTop };

        while (obj1.offsetParent) {
            obj1 = obj1.offsetParent;
            position.left += obj1.offsetLeft;
            position.top += obj1.offsetTop;
        }
        while (obj.parentNode != document.body) {
            obj = obj.parentNode;
            position.left -= obj.scrollLeft;
            position.top -= obj.scrollTop;
        }
        return position;
    }
})(window, document)
;
//tabs选项卡
(function (doc, win) {
    win.K3WISEMobile = win.K3WISEMobile || {};
    win.K3WISEMobile.Tabs = win.K3WISEMobile.Tabs || {};
    K3WISEMobile.Tabs = function (container, options) {
        if (arguments.length < 1) return;
        this.container = typeof container == 'string' ? doc.getElementById(container) : container;
        this.cfgs = {
            tabArr: null,
            tabStyle: '',
        }
        if (options != undefined) {
            for (var key in options) {
                this.set(key, options[key]);
            }
        }
        this.init();
    }
    K3WISEMobile.Tabs.prototype = {
        handleEvent: function (e) {
            var that = this;
            switch (e.type) {
                case "touchstart":
                    that._start(e);
                    break;
                case "touchmove":
                    that._move(e);
                    break;
                case "touchend":
                case "touchcancel":
                    that._end(e);
                    break;
                case "transitionend":

                    break;

            }
        },
        _start: function (e) {
            var that = this, touches = e.touches[0];
            that._bind("touchmove", that.container);
            that._bind("touchend", that.container);
        },
        _move: function (e) {
            var that = this;

        },
        _end: function (e) {
            var that = this,
                target = e.target || e.target.parentNode, tabsData = that.get('tabArr'),
                tabStyle = that.get('tabStyle'),
                normalStr = "",
                selectedStr = "";
            var id = target.getAttribute('id');
            if (tabStyle) {
                normalStr = that.getStyle(tabStyle, 'NormalStatus');
                selectedStr = that.getStyle(tabStyle, 'SelectedStatus');
            }

            var parentNodes = that._getParentNode(target);
            var childs = that._getChilds(parentNodes);
            if (childs && childs.length > 1) {
                for (var i = 0, len = childs.length; i < len; i++) {
                    var child = childs[i];
                    that._EditClassName(child, 'remove', 'chart-type-select');
                    that._EditClassName(child, 'add', 'chart-type-normal');
                    child.style.cssText = ";" + normalStr;
                }
            }
            for (var i = 0, len = tabsData.length; i < len; i++) {
                var item = tabsData[i];
                if (item.id == id) {
                    if (item.CallBack && that.get(item.CallBack)) {
                        that.get(item.CallBack)();
                    }
                    target.style.cssText = ";" + selectedStr;
                }
            }

        },
        _hasClass: function (ele, className) {
            var regExp = new RegExp("(\\s*|^)" + className + "(\\s*|$)");
            return ele.className.match(regExp);
        },
        //添加或删除样式className
        _EditClassName: function (obj, action, name) {
            if (!obj || !action || !name) return;
            switch (action) {
                case 'add':
                    if (!this._hasClass(obj, name)) {
                        obj.classList.add(name);
                    }
                    break;
                case 'remove':
                    if (this._hasClass(obj, name))
                        obj.classList.remove(name);
                    break;
                default:

                    break;
            }
        },
        getStyle: function (dataSource, name) {
            if (!dataSource || !name) return;
            var str = "";
            var style = dataSource[name];
            for (var key in style) {
                str += key + ":" + style[key] + ";";
            }
            return str.substring(0, str.length - 1);
        },
        _getChilds: function (target) {
            if (target)
                return target.children;
        },
        //获取目标的父节点
        _getParentNode: function (target) {
            if (!target) return;
            return target.parentNode;
        },
        init: function () {
            var that = this;
            var domStr = that.buildHTML();
            that.domObj = that.transformStrToDom(domStr);
            if (that.domObj) that.container.appendChild(that.domObj);
            that._addPaddingWraper();
            that._bind("touchstart", that.container);
        },
        transformStrToDom: function (domStr) {
            var that = this;
            var DivContainer = doc.createElement("div");
            DivContainer.innerHTML = domStr;
            return DivContainer.firstChild;
        },
        buildHTML: function () {
            var that = this, tabArr = that.get('tabArr'), domStr = "";
            if (tabArr) {
                domStr = "<span class='chart-type-tabs'>";
                for (var i = 0, len = tabArr.length; i < len; i++) {
                    var item = tabArr[i];
                    domStr += "<span class='chart-type-tab " + (item.IsSelected ? 'chart-type-select' : 'chart-type-normal') + "' id='" + item.id + "'>" + item.Name + "</span>";
                }
                domStr += "</span>";
            }
            return domStr;
        },
        get: function (cfgName) {
            if (cfgName in this.cfgs) {
                return this.cfgs[cfgName];
            }
        },
        set: function (name, value) {
            this.cfgs[name] = value;
        },
        //在tab容器上下加上padding 隔离
        _addPaddingWraper: function () {
            var that = this;
            if (that.get('paddingWraper')["need"]) {
                var spanWraperTop = doc.createElement('SPAN');
                var spanWraperBottom = doc.createElement('SPAN');
                spanWraperTop.style.cssText = spanWraperBottom.style.cssText = that.get('paddingWraper')['style'];
                that.container.insertBefore(spanWraperTop, that.domObj);
                that.container.appendChild(spanWraperBottom);
            }

        },
        _bind: function (eventName, target, buddle) {
            var that = this;
            target.addEventListener(eventName, this, !!buddle);
        },
        _unbind: function (eventName, target, buddle) {
            var that = this;
            target.removeEventListener(eventName, this, !!buddle);
        },
    }
})(document, window);
//数字加减
(function () {

})(document, window);