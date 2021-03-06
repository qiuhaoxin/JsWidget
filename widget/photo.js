/**
 * Created by haoxin_qiu on 2016/8/12.
 */
(function(win,doc){
    win.k3wisePhoto=win.k3wisePhoto||{};
    //判断数组是否为空
    Array.prototype.isEmpty=Array.prototype.isEmpty||function(){
         return this.length==0?true:false;
    };
    //获取（n,m）区间的随机数
    Object.prototype.GetRandom=function(n,m){
         return (Math.ceil(Math.random() * (m - n)) + n);
    }
    //得出数组的最大值
    Array.prototype.Max=function(name){
        var max=-99;
        if(this.length>0){
            this.map(function(value,key,item){
                if(value[name]>max)
                    max=value[name];
            })
        }else{
            max=-1;
        }

        return max;
    };
    //从数组中根据key值找相应对象key为name的value sName:SourceName tName:targetName
    //用例 ：key:10002 sName:Name tName:FItemID
    Array.prototype.getItem = function (key, sName, tName) {
        var value = '';
        this.map(function (value, key, item) {
            if (value[sName].indexOf(key)>-1) {
                value = value[tName];
                return value;
            }
        })
    };
    //重新排序  该处name 应为index ,otherName 为bigIndex
    Array.prototype.reduce=function(name,otherName,index){
        for(var i= 0,len=this.length;i<len;i++){
            if(this[i][name]>index){
                this[i][name]=parseInt(this[i][name])-1;
                this[i][otherName]=parseInt(this[i][otherName])-1;
            }
        }
        this.splice(index,1);
    }
    var M=Math,emptyArr=[],slice=emptyArr.slice,findIndex=emptyArr.indexOf,
        dummyStyle=doc.createElement('DIV').style,
        vendor=(function(){
            var vendors="webkitT,t,MozT,msT,OT".split(','), t, l,i;
            for(i=0,l=vendors.length;i<l;i++){
                t=vendors[i]+'ransform';
                if(t in dummyStyle){
                    return vendors[i].substr(0,vendors[i].length-1);
                }
            }
            return false;
        })(),
        cssVendor=vendor==false?'':'-'+vendor+'-',
        hasTouch='ontouchstart' in win,
        hasTransform=vendor!==false,

        appVension=win.navigator.appVersion,
        isAndroid=/android/gi.test(appVension),
        isIOS=/iphone|ipad/gi.test(appVension),
        isTouchPad=/hp-tablet/gi.test(appVension),

        hasTransition=prefixStyle('transition') in dummyStyle,
        Transform=hasTransform?prefixStyle('transform'):'left:0;top:0';
        TransitionTimingFunction=prefixStyle('transitionTimingFunction'),
        TransitionDuration=prefixStyle('transitionDuration'),
        TransitionDelay=prefixStyle('transitionDelay'),
        TOUCHSTART=hasTouch&&!isTouchPad ? 'touchstart' : 'mousedown',
        TOUCHMOVE=hasTouch && !isTouchPad ? 'touchmove' : 'mouseover',
        TOUCHEND=hasTouch &&!isTouchPad ? 'touchend' : 'mouseup',
        TOUCHCANCEL=hasTouch && !isTouchPad ? 'touchend' : 'mouseup',
        RESIZE='onorientationchange' in win?'onorientationchange':'resize',
        TRN_END=(function(){
            var t={
                '':'transitionend',
                'webkit':'webkitTransitionEnd',
                'Moz':'transitionend',
                'O':'transitionend',
                'ms':'MSTansitionEnd'
            }
            return t[vendor];
        })()
        ;
        k3wisePhoto = function (container, cfgs) {
        if(container)
            this.container=typeof container=='string'?doc.getElementById(container):container;
        else{
            alert("父容器不能为空！");
            return;
        }
        this.cfgs={
            needNew:true,//是否需要加图片
            needDel:true,//是否需要删除按钮
            data:[],//[{Name:'444.png',ReducePic:'',Pic:'',index:0,bigIndex:0}]  附件的数据集
            //事件
            onAddItem:null,//点击添加图片前
            onReduceClick:null,//点击缩略图
            onReady:null,
            onBeforeRemoveItem:null,//点击删除前
            onRemoveItem:null//删除事件
        }
        //cfgs["view"]='jsjs'; 
        for(var key in cfgs){
            this.cfgs[key]=cfgs[key];
        }
        this._initBody();
        this._initFooter();

        this._bind(TRN_END,win);

    }
    k3wisePhoto.prototype={
        initP:{x:0,y:0},
        imgArr:[],
        tap:true,
        moving:false,
        ctnW:0,
        ctnH:0,
        startTime:0,offsetX:0,
        handleEvent:function(e){
            switch(e.type){
                case TOUCHSTART:
                    this.start(e);
                    break;
                case TOUCHMOVE:
                    this.move(e);
                    break;
                case TOUCHEND:
                case TOUCHCANCEL:
                    this.end(e);
                    break;
                case RESIZE:
                    this.resize(e);
                    break;
                case TRN_END:
                    this.tan_end(e);
                    break;
            }
        },
        start: function (e) {
            var that=this,point= hasTouch? e.touches[0]:e;
            that.initP.x=point.pageX,that.initP.y=point.pageY;
            that.startTime= e.timeStamp||new Date();
            that._bind(TOUCHMOVE, e.target);
            that._bind(TOUCHEND, e.target);
        },
        move:function(e){
            e.preventDefault();
           var that=this,point=hasTouch ? e.touches[0] : e,
                distanceX=point.pageX - that.initP.x,
                distanceY=point.pageY - that.initP.y;
            that.offsetX=distanceX * 4 / 5;
            if(M.abs(distanceX)<6 && M.abs(distanceY)<6){
                //点击事件 其实如果是点击事件并不会触发到这里只是预防万一
                that.tap=true;
                that.moving=false;

            } else {
                //滑动
                that.tap=false;
                that.moving=true;
                id=e.target.getAttribute('data-id')|| e.target.parentNode.getAttribute('data-id');
                if(id=='reduce'&& M.abs(distanceX)>(M.abs(distanceY)+10)){
                    var data=that.get('data');
                   for(var i= 0,len=data.length;i<len;i++){
                       var item=data[i],id='lar-'+item.Name.split('.')[0],obj=that.getObjById(id);
                       obj.style[Transform]="translate("+(item.bigIndex * that.ctnW + distanceX * 4 / 5)+"px,0)";
                   }
                }
            }
        },
        end: function (e) {
            e.preventDefault();
            var that=this,endTime= e.timeStamp||new Date(),boundary=that.ctnW / 3,curId=-99;
            if (that.tap) {
                //如果是点击事件则到相应的处理方法去处理
                that._dealTap(e);
            } else {
               
                curId = e.target.getAttribute('id') || e.target.parentNode.getAttribute('id');
                 curId=  curId.split('-')[1];
                 if(endTime-that.startTime<300){//快速滑动
                     if(that.offsetX>60){
                         //pre  上一页
                         that._changePage(1,curId);
                     }else if(that.offsetX<-60){
                         //next 下一月
                         that._changePage(-1,curId);
                     }else{
                         //stay away 保留
                         that._changePage(0,curId);
                     }
                 }else{
                     if(that.offsetX>boundary){
                         //pre  上一页
                         that._changePage(1,curId);
                     }else if(that.offsetX<-boundary){
                         //next 下一月
                         that._changePage(-1,curId);
                     }else{
                         //stay away 保留
                         that._changePage(0,curId);
                     }
                 }
            }
            //重置状态
            that.tap=true;
            that.moving=false;
        },
        //滑页
        _changePage:function(dir,curId){
            var that = this, data = that.get('data'), idx = -99;
             data.forEach(function(item,index,array){
                  if(item.Name.split('.')[0]==curId)
                      idx = item.index;
             })
             if(idx==0&&dir==1){
                 //是否左超出
                 dir=0;
             }else if(idx==(data.length-1)&&dir==-1){
                 //是否右超出
                 dir=0;
             }
          
             that.curIdx += parseInt(-dir);
             that.getObjById('leftTip').innerHTML = that.curIdx;
             for(var i= 0,len=data.length;i<len;i++){
                 var item=data[i],id='lar-'+item.Name.split('.')[0],obj=that.getObjById(id);
                 item.bigIndex += dir;
                 if (obj) {
                     obj.style[Transform] = "translate(" + (item.bigIndex * that.ctnW) + "px,0)";
                     obj.style[TransitionTimingFunction] = "cubic-bezier(0.33,0.66,0.66,1)";
                     obj.style[TransitionDuration] = "400ms";
                 } 
             }
        },
        //点击缩小时，隐藏大图wraper，显示小图wraper
        _showReduce:function(){
            var that=this,parentWraper=that.getObjById('pht-wraper'),data=that.get('data');
            parentWraper.style.cssText='display:block;';
            //退出大图时记得重置bigIndex
            for(var i= 0,len=data.length;i<len;i++){
                data[i].bigIndex=data[i].index;
            }
            doc.body.removeChild(that.largeDiv);
        },
        //处理点击事件
        _dealTap: function (e) {
            e.preventDefault();
            if(!e)
            return;
            var that=this,
                 id=e.target.getAttribute('data-id')|| e.target.parentNode.getAttribute('data-id');
            switch (id){
                case 'addPic'://添加附件
                    if(that.get('onAddItem'))
                        that.get('onAddItem').call(null,0);
                    break;
                case 'delPic':
                   //删除节点
                    var beforeEvent=that.get('onBeforeRemoveItem'),
                         onRemoveItem=that.get('onRemoveItem');
                    if(beforeEvent)
                       beforeEvent.call();
                    if (onRemoveItem) {
                        var id = e.target.parentNode.getAttribute('id');
                        onRemoveItem.call(null, id,that.get('data')[0].FItemID);
                    }    
                    break;
                case 'check':
                    var picId=e.target.parentNode.getAttribute('id');//获取当前点击缩略图的id
                    that._checkPic(picId);
                    break;
                case 'reduce'://缩小事件
                    that._showReduce();
                    break;
            }
        },
        //获取窗口的宽度和高度
        _getWinWandH:function(){
            var that=this,
                 h=that.largeDiv.clientHeight,
                 w = that.largeDiv.clientWidth;
            this.ctnH=h;
            this.ctnW=w;
            return {
                Width:w,
                Height:h
            }
        },
        //根据图片的宽高比与窗口的宽高比来计算图片的真实高度
        _getRealShape:function(objShape){
             var that=this,
                 cRate=that.ctnW / that.ctnH,//图片真实宽高之比
                 rRate=objShape.w / objShape.h,//窗口的宽高之比
                 rObj={};
            if(rRate>cRate){
                rObj.w=that.ctnW;
                rObj.h=parseInt(rObj.w/(rRate));
                rObj.t=parseInt((that.ctnH - rObj.h) / 2);

            }else if(cRate==rRate){
               rObj.w=that.ctnW;
               rObj.h=that.ctnH;
               rObj.t=0;
            }else{
              rObj.h=that.ctnH;
              rObj.w=parseInt(rObj.h * rRate);
              rObj.l=parseInt((that.ctnW - rObj.w) / 2);
              rObj.t=0;
            }
            return rObj;
        },
        //查看大图
        _checkPic:function(id){
            var that=this,parentWraper=that.getObjById('pht-wraper');
            //隐藏缩略图部分
            parentWraper.style["display"]="none";

            that.largeDiv=doc.createElement('DIV');
            that.largeDiv.className = 'pht-large';
            that.largeDiv.setAttribute('id', 'largePic');
           
            doc.body.appendChild(that.largeDiv);
            that._getWinWandH();//
            //先排序
            that._RangeBigIdx(id);
            that._loadLagPic(that.largeDiv,id);
        },
        curIdx:0,//当前页数
        //根据点击选择大图的下标对bigIndex排序
        _RangeBigIdx:function(id){
            var that=this,data=this.get('data'),idx=0;
            data.forEach(function(item,index,array){
                if(item.Name.split('.')[0]==id){
                    idx = item.index;
                    that.curIdx = parseInt(idx) + 1;
                }
            })
            that.getObjById("leftTip").innerHTML = that.curIdx;
            that.getObjById("rightTip").innerHTML = that.get('data').length;
            for(var i= 0,len=data.length;i<len;i++){
                 data[i].bigIndex-=idx;
            }
        },
        //加载大图
        _loadLagPic:function(obj,curId){
             var that=this,imgData=that.get('data'),containerW=0;
            for(var i= 0,len=imgData.length;i<len;i++){
                var data = imgData[i];

                var imgSpan=doc.createElement('SPAN');
                imgSpan.className='large-img';
                imgSpan.style["height"]=that.ctnH+"px";
                imgSpan.setAttribute('id','lar-'+data.Name.split('.')[0]);
                imgSpan.setAttribute('data-id','reduce');
                imgSpan.style[TransitionDuration]=0+'ms';
                //调整图片位置
                that._trfRP(imgSpan,data.bigIndex);
                //为大图绑定监听事件
                that._bind(TOUCHSTART,imgSpan);

                obj.appendChild(imgSpan);
                var img = new Image();
                //DOM1 事件监听图片下载到浏览器完毕
                img.onload=function(){
                     var srcStr=this.src,index=0;
                     index=srcStr.split('=')[1];
                     var imgObj=doc.createElement('IMG');
                     imgObj.src=srcStr;
                    console.log("width is "+this.width+" and height is "+this.height);
                    var realS= that._getRealShape({w:this.width,h:this.height});
                    imgObj.style.height=realS.h+"px";
                    imgObj.style.width=realS.w+"px";
                    imgObj.style["left"]=realS.l+"px";
                    imgObj.style["top"]=realS.t+"px";
                    var iSpan=that.getObjById('lar-'+index);
                    if(iSpan){
                        iSpan.appendChild(imgObj);
                    }
                };
                img.src=data.Pic+"?name="+data.Name.split('.')[0];
                img.bigIndex=data.bigIndex;
            }
        },
        //根据点击的图片下标将图片移动到相应的位置
        _trfRP:function(obj,bigIndex){
           var that=this;
           obj.style[Transform]="translate("+(bigIndex * that.ctnW) +"px,0)";
        },
        //删除图片
        //在回调中调用
        _removePic:function(obj){
            var that=this,parentWraper=that.getObjById('pht-wraper'),data=that.get('data'),index=-1;
            var fildId=typeof obj=='object'?obj.getAttribute('id'):obj;
            //维护data
            for(var i= 0,len=data.length;i<len;i++){
                if(data[i].Name.split('.')[0]==fildId){
                    index=i;
                    break;
                }
            }
            if(index>-1){
                //维护data 关键是要维护index和bigIndex
                data.reduce('index','bigIndex',index);
            }
            obj=typeof obj=='object'?obj:that.getObjById(obj);
            parentWraper.removeChild(obj);
            //返回data数据， 方便控件之外去同步数据
            return data;
        },
        //添加缩略图
        _addNewReduce:function(obj){
            var that=this,parentWraper=that.getObjById('pht-wraper'),data=that.get('data'),max=-1;
            try{
                var img=new Image();
                img.onload=function(){
                    var index= 0,srcStr=this.src;
                    index=srcStr.substring(srcStr.indexOf('?')+1).split('=')[1];
                    var imgSpan=doc.createElement('SPAN');
                    imgSpan.setAttribute('id',index);
                    imgSpan.className='img-span';
                    var img=doc.createElement('IMG');
                    img.src=this.src;
                  //  img.style.cssText="width:50px;height:50px;";
                    img.setAttribute("data-id", "check");
                    img.className = "reduce-img";
                    var delIcon = null;
                    if (that.get("needDel")) {
                        delIcon = doc.createElement('IMG')
                        delIcon.className = 'icon-delete';
                        delIcon.src = '../demo/img/dealReject.png';
                        delIcon.setAttribute('data-id', 'delPic');
                    }
                    //若删除按钮存在则绑定事件
                    if(delIcon)
                       that._bind(TOUCHSTART,delIcon);
                    that._bind(TOUCHSTART,img);
                    imgSpan.appendChild(img);
                    if(delIcon)
                       imgSpan.appendChild(delIcon);
                    parentWraper.appendChild(imgSpan);
                };
                img.src=obj.ReducePic+"?name="+obj.Name.split('.')[0];
                //维护data
                max=data.Max('index')
               //对新加的附件的index和bigIndex进行设置
                obj["index"]= obj["bigIndex"]=parseInt(max)+1;
                data.splice(data.length, 0, obj);//加到data
                //重新绑定一下addPic的绑定事件
                that._unbind(TOUCHSTART, doc.getElementById('addPic'));
                //setTimeout(function () {
                //    that._bind(TOUCHSTART,doc.getElementById('addPic'));
                //}, 100);
               
            }catch(ex){
                throw ex;
            }
            //返回整个 data的数据方便控件之外去同步数据
            return data;
        },
        resize:function(e){
            var that=this;
        },
        tan_end:function(e){
            var that=this;
        },
        //初始化
        _initBody:function(){
            var that=this,spanAdd=null,reduceArr;
            var rowDiv=doc.createElement('DIV');
            rowDiv.setAttribute('id','pht-wraper');
            //生成addItem图标字体的
            if(that.get('needNew')){
                spanAdd=doc.createElement('SPAN'),i=doc.createElement('i'),img=doc.createElement('IMG');
                spanAdd.className='img-span';
                spanAdd.setAttribute('data-id','addPic');
                spanAdd.setAttribute('id','addPic');
                img.src='../demo/img/addpic.png';
                img.style.cssText="width:50px;height:50px;";
                spanAdd.appendChild(img);
                rowDiv.appendChild(spanAdd);
            }
            //生成缩略图
            reduceArr = that.get('data');
            if(reduceArr&&reduceArr.length>0){
                if(!that.imgArr.isEmpty){
                    that.imgArr=[];
                }
                for(var i= 0,len=reduceArr.length;i<len;i++){
                    var image=new Image();
                    var data=reduceArr[i];
                    var imgSpan = doc.createElement('SPAN');
                    imgSpan.setAttribute('id',data.Name.split('.')[0]);
                    imgSpan.className='img-span';

                    rowDiv.appendChild(imgSpan);
                    image.onload=function(){
                        var index= 0,srcStr=this.src;
                        var img=doc.createElement('IMG'),delIcon;
                        img.src=this.src;
                        img.className='reduce-img'
                        img.setAttribute("data-id", "check");
                        if (that.get("needDel")) {
                            delIcon=doc.createElement('IMG')
                            delIcon.src = '../demo/img/dealReject.png';
                            delIcon.className = "icon-delete";
                            delIcon.setAttribute('data-id', 'delPic');
                        }
                      //若删除按钮存在则绑定
                        if(delIcon)
                           that._bind(TOUCHSTART,delIcon);
                        that._bind(TOUCHSTART,img);
                        index=srcStr.substring(srcStr.indexOf('?')+1).split('=')[1];
                        var obj=that.getObjById(index);
                        if(obj){
                            obj.appendChild(img);
                            if(delIcon)
                              obj.appendChild(delIcon);
                        }
                    };
                    image.src=data.ReducePic+"?name="+data.Name.split('.')[0];
                }
            }
            this.container.appendChild(rowDiv);

            //初始化完毕可以触发onReady事件
            if(that.get('ready'))
               that.get('ready').call();
            that._initEvent();
        },
        //初始化按钮的绑定事件
        _initEvent:function(){
            var that=this,
                 addObj=that.getObjById('addPic');
            //为添加图标绑定事件
            if(addObj)
                that._bind(TOUCHSTART,addObj);
        },

        _initFooter:function(){
            var that = this;
            that.footerDiv = doc.createElement("DIV");
            that.footerDiv.className = "footer";
            var leftSpan = doc.createElement('SPAN');
            leftSpan.setAttribute('id', 'leftTip');
            var splitSpan = doc.createElement('SPAN');
            splitSpan.innerHTML = " / ";
            var rightSpan = doc.createElement('SPAN');
            rightSpan.setAttribute('id', 'rightTip');
            rightSpan.innerHTML = that.get('data').length;
            that.footerDiv.appendChild(leftSpan);
            that.footerDiv.appendChild(splitSpan);
            that.footerDiv.appendChild(rightSpan);
            that.container.appendChild(that.footerDiv);
        },
        /*
        *utility
        * */
        getObjById:function(id){
            return doc.getElementById(id);
        },
        //设置cfgs的值
        set:function(obj){
            var that=this;
            for(var key in obj){
                that.cfgs[key]=obj[key];
            }
        },
        get:function(key){
            return this.cfgs[key];
        },
        //绑定事件
        _bind:function(type,el,buddle){
            var that=this;
            (el||that.container).addEventListener(type,this,!!buddle);
        },
        //解除绑定事件
        _unbind: function (type, el, buddle) {
            var that = this;
            (el||that.container).removeEventListener(type,this,!!buddle);
        }
    }
    //拼装样式
    function prefixStyle(proName){
         if(vendor==false) return proName;
         return vendor+proName.charAt(0).toUpperCase()+proName.substr(1,proName.length);
    }
    dummyStyle=null;
})(window,document);
