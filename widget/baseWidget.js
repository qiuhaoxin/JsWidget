/**
 * Created by haoxin_qiu on 2017/3/29.
 * 所有控件的基类，所有的子类控件需要继承并实现基类方法
 */
define(['utils','tips'],function(utils,Tips){
      ///config 对应控件的参数格式{WidgetName:'列表',container:'标签id或者是节点对象，以上都没有默认为document.body',Data:{}}
      function Widget(config){
          var _this=this;
          _this.Tips=null;
          _this.startPos={
              startX:0,
              startY:0
          };
          _this.config=config;
           try{
               if(utils.isEmptyObj(config)){
                   if(_this.Tips==null){
                       _this.Tips=new Tips();
                   }

               }
               if(!config.WidgetName){
                   alert("控件必须在配置参数加上控件名称!");
                   return;
               }
               //若container 为id则调用getDomByID获取DOM节点，如果已经是节点对象则不作处理，如果为空或异常类型默认赋值document.body
               config.container=typeof config.container=='string'?this.getDomByID(config.container):(typeof config.container=='object'?config.container:document.body);

               if(!config.container){
                   config.container=document.body;
               }
               _this.initEventName();
               //重构参数包
               _this.cfgs={
                   widget:config.WidgetName,
                   container:config.container,
                   Data:config.Data
               }
              // this.init();
           }catch(e){
               alert(" 控件发生异常，异常信息："+e);
               return;
           }
      }
      Widget.prototype={
          x:0,
          y:0,
          scroller:{
             scrollX:0,
             scrollY:0
          },
          wrapper:{
             wrapperW:0,
             wrapperH:0
          },
          moved:false,
          animating:false,
          opts:{
              //针对列表的一些可选项
              lockDirection:true,
              vScroll:true,
              hScroll:false,
              momentum:true,
              bounce:true,
              canMaskerClick:true,
              maskClickCB:null
          },
          masterID:'masterID',
          outerWrapper:null,
          //根据浏览器类型初始化事件类型
          initEventName:function(){
              this.touch='ontouchstart' in window || window.DocumentTouch && document instanceof DocumentTouch;
              this.touchEvents={
                  START:this.touch?'touchstart':'mousedown',
                  MOVE:this.touch?'touchmove':'mousemove',
                  END:this.touch?'touchend':'mouseup',
                  TRNEND_EV:Widget.mobileAttrs.TRNEND_EV,
                  CANCEL:this.touch?'touchcancel':'mouseup'
              }
          },
          setOpts:function(key,value){
              this.opts[key]=value;
          },
          //
          handleEvent:function(e){
               var _this=this;
               switch (e.type){
                   case _this.touchEvents.START:
                       _this.startEvent(e);
                       break;
                   case _this.touchEvents.MOVE:
                       _this.moveEvent(e);
                       break;
                   case _this.touchEvents.END:
                   case _this.touchEvents.CANCEL:
                       _this.endEvent(e);
                       break;
                   case Widget.mobileAttrs.TRNEND_EV:
                       _this._transitionEnd(e);
                       break;
               }
          },
          _transitionEnd:function(e){
              var _this = this;
              if (e.target != _this.listWrapper) return;
              this.unRegisterEvent(this.listWrapper,'transitionend');
              this._startAni();
          },
          //可在子类重写该类事件
          startEvent:function(e){
              e.preventDefault();
               var point=this.touch? e.touches[0]:e;
               this.startPos.startX=point.pageX;
               this.startPos.startY=point.pageY;

               this.startX=this.x;
               this.startY=this.y;
               this.pointX=point.pageX;
               this.pointY=point.pageY;
               this.startTime= e.timeStamp || Date.now;

               this.registerEvent(e.target,this.touchEvents.MOVE);
               this.registerEvent(e.target,this.touchEvents.END);
               this.registerEvent(e.target,'transitionend');
          },
          moveEvent:function(e){
              e.preventDefault();
              var _this=this,
                  point=this.touch? e.touches[0]: e,
                  deltaX=point.pageX - this.pointX,
                  deltaY=point.pageY - this.pointY,
                  newX=this.x + deltaX,
                  newY=this.y + deltaY,
                  timestamp= e.timeStamp||Date.now;
              this.pointX=point.pageX;
              this.pointY=point.pageY;

              this.distX+=deltaX;
              this.distY+=deltaY;
              this.absDistX=Math.abs(this.distX);
              this.absDistY=Math.abs(this.distY);
              if(this.absDistX<6&&this.absDistY<6){
                  return;
              }
              if(this.opts.lockDirection){
                  if(this.absDistX>this.absDistY + 5){
                      newY=this.y;
                      deltaY=0
                  }else if(this.absDistY>this.absDistX + 5){
                      newX=this.x;
                      deltaX=0;
                  }
              }
              this.moved=true;
              this._pos(newX,newY);
              if(timestamp-this.startTime>300){
                  this.startTime=timestamp;
                  this.startX=this.x;
                  this.startY=this.y;
              }
          },
          endEvent:function(e){
              e.preventDefault();
              var _this=this;
              if(this.touch&& e.touches.length!==0)return;
              var point= this.touch? e.touches[0]: e,
                  newPosX=this.x,
                  newPosY=this.y,
                  momentumX={dist:0,time:0},
                  momentumY={dist:0,time:0},
                  duration=(e.timeStamp||Date.now) - this.startTime,
                  distX=0,
                  distY= 0,
                  newDuration=0;
              this.unRegisterEvent(this.listWrapper,this.touchEvents.MOVE);
              this.unRegisterEvent(this.listWrapper,this.touchEvents.END);
              this.unRegisterEvent(this.listWrapper,this.touchEvents.CANCEL);
              if(duration<300&&this.opts.momentum){//快速滑动
                  momentumX=newPosX?this._momentum(newPosX-this.startX,duration,-this.x,this.scroller.scrollX - this.wrapper.wrapperW + this.x,this.opts.bounce?this.wrapper.wrapperW:0):momentumX;
                  momentumY=newPosY?this._momentum(newPosY - this.startY,duration,-this.y, (this.maxScrollY < 0 ? this.scrollerH - this.wrapperH + this.y - this.minScrollY : 0),this.opts.bounce?this.wrapper.wrapperH:0):momentumY;
                  newPosX=this.x+momentumX.dist;
                  newPosY=this.y+momentumY.dist;

                  if ((this.y > this.minScrollY && newPosY > this.minScrollY) || (this.y < this.maxScrollY && newPosY < this.maxScrollY)) momentumY = { dist:0, time:0 };
                  if(newPosY<(this.maxScrollY-this.wrapper.wrapperH)){
                      //避免惯性太大，页面向上滚动太多，做一下限制
                        newPosY=(this.maxScrollY - this.wrapper.wrapperH +100);
                        momentumY.time=700;
                  }
              }
              if(momentumX.dist||momentumY.dist){
                 newDuration=Math.max(Math.max(momentumX.time,momentumY.time),10);
                  this.scrollTo(Math.round(newPosX), Math.round(newPosY), newDuration);
                  return;
              }
              this._resetPos(200);

          },
          _pos:function(x,y){
                x=this.opts.hScroll ? x : 0;
                y=this.opts.vScroll ? y : 0;
                this.listWrapper.style['-webkit-transform']="translate3d("+x+"px,"+y+"px,0px)";
                this.x=x;
                this.y=y;
          },
          scrollTo:function(x,y,duration,relative){
               var _this=this,
                   step= x,
                   i,l;
               this.stop();
               if(!step.length)step=[{x:x,y:y,time:duration,relative:relative}];
               for (i=0, l=step.length; i<l; i++) {
                   if (step[i].relative) { step[i].x = this.x - step[i].x; step[i].y = this.y - step[i].y; }
                   this.steps.push({ x: step[i].x, y: step[i].y, time: step[i].time || 0 });
               }
               this._startAni();
          },
          stop:function(){
               this.steps=[];
               this.moved=false;
               this.animating=false;
          },
          _startAni:function(){
              var that = this,
                  startX = that.x, startY = that.y,
                  startTime = Date.now(),
                  step, easeOut,
                  animate;
              if (that.animating) return;
              if (!that.steps.length) {
                  that._resetPos(400);
                  return;
              }
              step = that.steps.shift();
              if (step.x == startX && step.y == startY) step.time = 0;
              that.animating = true;
              that.moved = true;
              that._transitionTime(step.time);
              that._pos(step.x, step.y);
              that.animating = false;
              if (step.time) that.registerEvent(this.listWrapper,'transitionend');
              else that._resetPos(0);
              return;
          },
          _resetPos: function (time) {
              var _this = this,
                  resetX = _this.x >= 0 ? 0 : _this.x < _this.maxScrollX ? _this.maxScrollX : _this.x,
                  resetY = _this.y >= _this.minScrollY || _this.maxScrollY > 0 ? _this.minScrollY : _this.y < _this.maxScrollY ? _this.maxScrollY : _this.y;
              if (resetX == _this.x && resetY == _this.y) {
                  if (_this.moved) {
                      _this.moved = false;
                  }

                  //if (_this.hScrollbar && that.options.hideScrollbar) {
                  //
                  //    if (vendor == 'webkit') that.hScrollbarWrapper.style[transitionDelay] = '300ms';
                  //    that.hScrollbarWrapper.style.opacity = '0';
                  //}
                  //if (that.vScrollbar && that.options.hideScrollbar) {
                  //    if (vendor == 'webkit') that.vScrollbarWrapper.style[transitionDelay] = '300ms';
                  //    that.vScrollbarWrapper.style.opacity = '0';
                  //}
                  return;
              }
              _this.scrollTo(resetX, resetY, time || 0);
          },
          _transitionTime: function (time) {
              time += 'ms';
              this.listWrapper.style['-webkit-transitionDuration'] = time;
              this.listWrapper.style['transitionDuration'] = time;
              //if (this.hScrollbar) this.hScrollbarIndicator.style[transitionDuration] = time;
              //if (this.vScrollbar) this.vScrollbarIndicator.style[transitionDuration] = time;
          },
          //惯性滑动 算法参照 iscroll
          _momentum: function (dist, time, maxDistUpper, maxDistLower, size) {
              var deceleration = 0.0006,
                  speed = Math.abs(dist) / time,
                  newDist = (speed * speed) / (2 * deceleration),
                  newTime = 0, outsideDist = 0;

              // Proportinally reduce speed if we are outside of the boundaries
              if (dist > 0 && newDist > maxDistUpper) {
                  outsideDist = size / (6 / (newDist / speed * deceleration));
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
              return { dist: newDist, time: Math.abs(Math.round(newTime)) };
          },
          cancelEvent:function(e){

          },
          //根据当前页面id检索是否有该id的dom节点
          getDomByID:function(id){
               if(!id)return null;
               try{
                   return document.getElementById(id);
               }catch(e){
                   console.log("Exception in baseWidget is "+e);
                   return null;
               }
          },
          //创建遮罩层（）；
          createMask:function(){
               var _this=this;
               //所有控件类型共享一个遮罩层
               if(this.maskerDiv){
                   _this.maskerDiv.style['display']='block';
                   return;
               }

               _this.maskerDiv=document.createElement('DIV');
               _this.maskerDiv.className="kw-basewidget-masker";
               _this.maskerDiv.style['display']='block';
               _this.maskerDiv.setAttribute("id","masterID");
               _this.get('container').appendChild(_this.maskerDiv);
               if(this.opts.canMaskerClick){
                   this.maskerDiv.addEventListener('click',function(e){
                       if(_this.opts['maskClickCB']){
                            _this.opts['maskClickCB']();
                           _this.hideMask();
                       }
                   })
               }
               //禁止遮罩响应滑动事件
               this.maskerDiv.addEventListener(this.touchEvents.MOVE,function(e){
                   e.preventDefault();
                   e.stopPropagation();
               })
          },
          hideMask:function(){
              this.maskerDiv.style['display']='none';
          },
          showMask:function(){
              this.maskerDiv.style['display']="block";
          },
          init:function(){
               this.prefixStyle={
                   transform:'transform',
                   transitionDuration:'transitionDuration',
                   transitionTimingFunction:'transitionTimingFunction',
                   transitionDelay:'transitionDelay'
               }
               this.prefixStyle=utils.getPrefixStyle(this.prefixStyle);
               this.initWrapper(this.get('container'));
          },
          initWrapper:function(container){

          },
          initData:function(){

          },
          //kw-widget-toptodown
          show:function(animClass){
              //设置最外层的动画类
              //this.animClass="kw-widget-toptodown";
              this.animClass=animClass;
              if(this.outerWrapper){
                  this.outerWrapper.classList.add(this.animClass);
              }
              return this;
          },
          hide:function(removeClass,callBack){
              if(this.outerWrapper){
                  this.outerWrapper.classList.remove(this.animClass);
                  this.outerWrapper.classList.add(removeClass);
              }
              window.setTimeout(function(){
                  callBack && callBack();
              },200);
          },
          _destroy:function(){
              //
          },
          _hasClass:function(obj,className){
                var classList=obj.classList;
                if(classList.indexOf(className)>-1){
                    return true;
                }
              return false;
          },
          lockBody:function(e){
              e.preventDefault();
          },
          //设置遮罩层样式
          setMaskerStyle:function(styleObj){
              var _this=this;
              if(!styleObj||typeof styleObj!=='object')return;
              for(var key in styleObj){
                  if(this.maskerDiv){
                      this.maskerDiv.style[key]=styleObj[key];
                  }
              }
          },
          //获取遮罩的样式
          getMaskerStyle:function(){
               var _this=this;
               if(this.maskerDiv){
                   return this.maskerDiv.style;
               }
          },
          getMaskerZIndex:function(){
               var _this=this;
              var index=this.maskerDiv&&this.maskerDiv.style['zIndex']||999;
               return index;
          },
          //设置遮罩的层次，当一个页面里有两个控件，都需要遮罩的时候
          setMaskerZIndex:function(zIndex){
               var _this=this;
               if(this.maskerDiv){
                   this.maskerDiv.style['z-index']=zIndex;
               }
          },
          //先从this.cfgs基层取属性的值，如果没有发现该属性，则循环查找基层属性的值里面找
          get:function(attrName){
              var _this=this;
              if(attrName in _this.cfgs){
                  return _this.cfgs[attrName];
              }
              for(var key in _this.cfgs){

              }
          },
          _set:function(attrName,attrValue){
              if(arguments.length==2)
                  this.cfgs[attrName]=attrValue;
              else{
                  var obj=arguments[0];
                  for(var key in obj){
                      this.cfgs[key]=obj[key];
                  }
              }
              return this;
          },
          //设置应用的配置信息
          setConfig:function(options){
              try{
                  if(arguments.length>=2){
                      this._set(arguments[0],arguments[1]);
                  }else{
                      //如果配置信息是对象
                      this._set(options);
                  }
              }catch(e){
                  console.log("Exception is "+e);
              }
              return this;
          },
          eventList:[],
          //事件队列保存事件列表 如果该对象已绑定同一个事件类型，则覆盖同事返回false，否则返回true,同时事件入队列
          _unShiftEventList:function(obj,eventName,fn){
               this.eventList=this.eventList||[];
               var temp={};
               temp["obj"]=obj;
               temp["callBack"]=fn;
               temp["eventName"]=eventName;
               var hasTheSameEvent=false,oldCallBack=null;
               this.eventList.forEach(function(item,index,array){
                      //该对象已有同类型的事件，覆盖
                     if(item['obj']==obj&&item['eventName']==eventName){
                          oldCallBack=item['callBack'];
                          item['callBack']=fn;
                          hasTheSameEvent=true;

                     }
               })
               //已存在同对象的同类型事件对象，返回旧的事件回调方法来取消对旧事件的监听
               if(hasTheSameEvent){
                   return oldCallBack;
               }
               this.eventList.push(temp);
               return true;
          },

          //从事件列表中删除指定的事件对象
          _shiftEventList:function(obj,eventName){

          },
          //事件列表是否已有同对象同类型对象
          _hadTheSameEvent:function(obj,eventName){
              if(!obj)return false;
              if(this.eventList.length==0){
                  return false;
              }
              var result= this.eventList.some(function(item,index,array){
                  return (item['obj']==obj && item['eventName']==eventName);
              })
              return result;
          },
          bindEvent:function(obj,eventName,fn){
              if(arguments.length!=3){
                  console.log("bindEvent 缺少实现参数!");
                  return;
              }
              if(typeof obj=='string'){
                  obj=this.getDomByID(obj);
              }
              if(!obj){
                  console.log("请确保obj为dom的ID或dom元素!");
                  return;
              }
              var result=this._unShiftEventList(obj,eventName,fn);
              if(result===true){
                  obj.addEventListener(eventName,fn,false);

              }else if(result instanceof Function){
                  //有重复类型的事件，先解除之前的事件监听，重现绑定最新的事件回调方法
                  this.unBindEvent(obj,eventName,result);
                  obj.addEventListener(eventName,fn,false);
              }
              return this;
          },
          unBindEvent:function(obj,eventName,fn){
              if(typeof obj=='string'){
                  obj=this.getDomByID(obj);
              }
              if(!obj){
                  console.log("请确保obj为dom的ID或dom元素!");
                  return;
              }
              var argsL=arguments.length;
              switch (argsL){
                  case 1://1一个参数为dom对象
                  case 2://两个参数为dom对象和事件类型
                      //只有一个参数（自动解析为dom对象） 解绑该对象的所有事件类型
                      if(this.eventList.length>0){
                          this.eventList.forEach(function(item,index,array){
                              if(item['obj']==obj&&item['eventName']==eventName){
                                  var callBack=item['callBack'];
                                  if(callBack)
                                      obj.removeEventListener(eventName,callBack,false);
                              }
                          });
                      }else{
                          console.log("事件队列没有任何事件!");
                          return;
                      }
                      break;
                  case 3://三个参数为dom对象，事件类型和回调
                      //console.log("eventName is "+eventName+" and fn is "+fn);
                      obj.removeEventListener(eventName,fn,false);
                      break;
              }
              return this;
          },
          //设置对象样式
          setStyle:function(obj,cssObj){
              if(!obj||!cssObj)return;
              var Re={};
              if(typeof cssObj=='string'){
                  var cssObjArr=cssObj.split(';');
                  for(var i= 0,len=cssObjArr.length;i<len;i++){
                      var cssStyle=cssObjArr[i].split('=');
                      var cssName=cssStyle[0];
                      var cssVal=cssStyle[1];
                      Re[cssName]=cssVal;
                  }
              }else if(typeof cssObj=='object'){
                 Re= utils.copy(cssObj,Re);
              }
              for(var key in Re){
                  obj.style[key]=Re[key];
              }
          },
          //字符串转换dom节点
          transformStrToDom:function(html){
              if(/^\s*$/.test(html))return;
              var tempDom=document.createElement('DIV');
              tempDom.innerHTML=html;
              return tempDom.firstElementChild;
          },
          //注册事件
          registerEvent:function(obj,eventName,buddle){
               if(!obj)return;
               obj.addEventListener(eventName,this,!!buddle);
          },
          //取消注册事件
          unRegisterEvent:function(obj,eventName,buddle){
              if(!obj)return;
              obj.removeEventListener(eventName,this,!!buddle);
          },
          //为类动态扩展方法
          method:function(methodName,method){
               if(this[methodName]){
                   return "类方法已存在!"
               }
               this[methodName]=method;
          }
      }
      Widget.prefixStyle=function prefixStyle(styleName) {
            if (!Widget.vendor) return styleName;
            styleName = styleName.charAt(0).toUpperCase() + styleName.subStr(1);
            return Widget.vendor + styleName;
       }
      Widget.vendor = (function () {
        var dummyStyle = document.createElement('div').style;
        var vendors = 't,webkitT,MozT,msT,OT'.split(','), t, i = 0, len = vendors.length;
        for (; i < len; i++) {
            t = vendors[i] + "ransform";
            if (t in dummyStyle) {
                return vendors[i].substring(0, vendors[i].length - 1);
            }
        }
        return false;
    })(),
          //方法用来测量一段文字的长度，不折行
      Widget.measureWidth=function(content,font){
        var obj = document.createElement("div"), width = 0;
        obj.innerHTML = content;
        obj.style.cssText = "position:absolute;float:left;white-space:nowrap;font:" + font;
        document.body.appendChild(obj);
        width = obj.offsetWidth;
        document.body.removeChild(obj);
        delete obj;
        obj = null;
        return width;
      },
      Widget.mobileAttrs={
          transform : Widget.prefixStyle('transform'),
          transition:Widget.prefixStyle('transition'),
          transitionProperty : Widget.prefixStyle('transitionProperty'),
          transitionDuration:Widget.prefixStyle('transitionDuration'),
          transformOrigin : Widget.prefixStyle('transformOrigin'),
          transitionTimingFunction :Widget.prefixStyle('transitionTimingFunction'),
          transitionDelay :Widget.prefixStyle('transitionDelay'),
          isAndroid : (/android/gi).test(navigator.appVersion),
          isIDevice : (/iphone|ipad/gi).test(navigator.appVersion),
          isTouchPad : (/hp-tablet/gi).test(navigator.appVersion),
          hasTouch : 'ontouchstart' in window && !this.isTouchPad,
          RESIZE_EV : 'onorientationchange' in window ? 'orientationchange' : 'resize',
          START_EV : this.hasTouch ? 'touchstart' : 'mousedown',
          MOVE_EV : this.hasTouch ? 'touchmove' : 'mousemove',
          END_EV : this.hasTouch ? 'touchend' : 'mouseup',
          CANCEL_EV : this.hasTouch ? 'touchcancel' : 'mouseup',
          TRNEND_EV : (function () {
            if (Widget.vendor === false) return false;
            var transitionEnd = {
                '': 'transitionend',
                'webkit': 'webkitTransitionEnd',
                'Moz': 'transitionend',
                'O': 'otransitionend',
                'ms': 'MSTransitionEnd'
            };
            return transitionEnd[Widget.vendor];
          })(),
          nextFrame : (function () {
                return window.requestAnimationFrame ||
                    window.webkitRequestAnimationFrame ||
                    window.mozRequestAnimationFrame ||
                    window.oRequestAnimationFrame ||
                    window.msRequestAnimationFrame ||
                    function (callback) { return setTimeout(callback, 1); };
          })(),
          cancelFrame : (function () {
                return window.cancelRequestAnimationFrame ||
                    window.webkitCancelAnimationFrame ||
                    window.webkitCancelRequestAnimationFrame ||
                    window.mozCancelRequestAnimationFrame ||
                    window.oCancelRequestAnimationFrame ||
                    window.msCancelRequestAnimationFrame ||
                    clearTimeout;
          })()
      }


    return Widget;
});
