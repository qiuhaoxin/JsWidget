/**
 * Created by haoxin_qiu on 2017/4/1.
 * 图片切换config:
 * {
 *  WidgetName:'',
 *  container:'',
 *  Data:{
 *     needAdd:true,//是否需要显示 add
 *     beforeAddCallBack:null,//添加附件前的回调
 *     afterAddCallBack:null,添加附件后的回调
 *     addCallBack:null,//添加附件的回调
 *     needDel:true,//是否需要显示 delete
 *     delCallBack:null,//删除附件的回调
 *     photoArr:[
 *        {},
 *        {}
 *     ]
 *  }
 * }
 */
define(['utils','baseWidget'],function(utils,baseClass){
       function Widget(config){
           var _this=this;
           Widget.baseConstructor.call(this,config);
           try{
               this.Data=this.get('Data');
               this.needAdd=this.Data.needAdd||false;
               this.mode='reduce';//该控件有三种模式：reduce(默认为当前显示的是缩略图模式)，original(原图，即放大模式)

               //常量设置
               this.conf={
                     PAGE_FORWARD: 1,//页面前进
                     PAGE_BACK:-1,//页面回滚
                     BOUNDARY:0,//页面前进，回滚的边界条件
                     MINTIME:300,//快速滑动条件--最小时间值
                     MINSCREEN:0,//快速滑动条件--滑动最小距离
                     TRANSITION_TIMING_FUNCTION_VALUE:"cubic-bezier(0.33,.66,.66,1)",//平滑效果
                     TRANSITION_DURACTION_VALUE:'200ms',//平滑效果时间
                     ZERO_VALUE:0,// 0值
                   }
           }catch(e){
               alert("控件 "+this.get('WidgetName')+" 异常，异常信息："+e);
               return;
           }

           this.init();
       }
       utils.extends(Widget,baseClass);
       Widget.prototype.initWrapper=function(container){
           document.body.addEventListener("touchmove",function(e){
               e.preventDefault();
               e.stopPropagation();
           },false)
           var _this=this;
           _this.container=container;
          this.initPhoto();
       }
       Widget.prototype.initPhoto=function(){
           var _this=this;
           //是否需要+
           this.photoDiv=document.createElement('DIV');
           this.photoDiv.className="displayflex";
           this.photoDiv.setAttribute('id','reudceContainer');
           this.photoDiv.style['width']="100%";
           this.photoDiv.style['flexWrap']="wrap";
           if(this.needAdd){
               var needAddObj=document.createElement('DIV');
               needAddObj.className="kw-mobile-photo-add";
               var imgObj=new Image();
               imgObj.onload=function(){
                    needAddObj.appendChild(imgObj);

               }
               imgObj.className="kw-mobile-photo-addPic";
               imgObj.onerror=function(e){
                   //出错
                   alert("error is ");
                   imgObj.src= "../img/addpic.png";
                   if(e.srcElement.nodeType==1&& e.srcElement.src.indexOf('png12')>-1){
                       //对资料找不到一定要对该对象的onerror赋值为null以避免一直循环执行下去
                       imgObj.onerror=null;
                       return;
                   }
               }
               imgObj.setAttribute('id','addPic');
               imgObj.src=this.Data.addPic;

               //添加点击事件
               this.registerEvent(imgObj,this.touchEvents.START,false);
               this.photoDiv.appendChild(needAddObj);
           }
           this.container.append(this.photoDiv);
           var needDel=this.Data.needDel;
           if(this.Data.photoArr){
               var listArr=this.Data.photoArr;
               this.divDict={};
               for(var i= 0,len=listArr.length;i<len;i++){
                   var itemData=listArr[i];
                   var reduceDiv=document.createElement("DIV");
                   reduceDiv.setAttribute("id","reducePic"+itemData['index']);
                   reduceDiv.className="kw-mobile-photo-reduce";
                   _this.divDict[i]=reduceDiv;
                   this.photoDiv.appendChild(reduceDiv);
                   this._addDelPic(reduceDiv,itemData['index'])
                   var img=new Image();
                   img.onload=function(e){
                       var pars= e.srcElement.src&& e.srcElement.src.split('?')[1];
                       if(pars){
                           pars=pars.split('=')[1];
                       }

                       _this.divDict[pars] && _this.divDict[pars].appendChild(e.srcElement);
                   }
                   img.onerror=function(e){
                        console.log("error is "+ e.srcElement.src);
                   }
                   img.src="Image/"+this.Data.photoFile+"/"+itemData["reducePic"]+"?index="+itemData["index"];
                   img.setAttribute('id','img-'+itemData['index']);
                   img.style['width']="60px";
                   img.style["height"]="60px";
                   this.registerEvent(img,this.touchEvents.START,false);
               }
           }
       }
       Widget.prototype._addDelPic=function(parentNode,id){
           var del=new Image();
           parentNode&&parentNode.appendChild(del);
           del.onload=function(e){

           }
           del.onerror=function(e){

           }
           del.setAttribute('id',"del_"+id);
           del.className="kw-mobile-photo-del";
           del.src="img/dealReject.png?id="+id;
           this.registerEvent(del,this.touchEvents.START,false);
       }
       //处理添加附件的逻辑
       Widget.prototype.addPic=function(){
           var result=null;
           if(this.Data.addCallBack){
               if(this.Data.beforeAddCallBack){
                   try{
                     result=this.Data.beforeAddCallBack();
                   }catch(e){
                     console.log("beforeAddCallBack Exception is "+e);
                   }
               }
               this.Data.addCallBack(result);
               if(this.Data.afterAddCallBack){
                   this.Data.afterAddCallBack();
               }
           }
           return;
       }
       //添加缩略图到组件中，并同步photoArr数组，这个方法公有
       Widget.prototype.addReducePic=function(imgData){
           var _this=this;

       }
       //处理删除附件的逻辑
       Widget.prototype.delPic=function(id){
            var _this=this;
            if(this.Data.delCallBack){
                this.Data.delCallBack(id);

            }else{
                _this.delReducePic(id);
            }
       }
    //删除附件的Dom节点，对外开放的接口
       Widget.prototype.delReducePic=function(id){
           if(!id&&isNaN(id)){
               console.log("附件id必须存在且为数字");
               return;
           }
           if(this.divDict[id]){
               try{
                   this.photoDiv.removeChild(this.divDict[id]);
               }catch(e){
                   console.error("delReducePic excption is "+e);
               }
               //
               this.Data.photoArr.splice(id,1);
               this._replaceArr();
           }
       }
       //点击放大
       Widget.prototype.showBigPic=function(id){
              this.curId=id;
              this.mode='original';
              var _this=this;
              document.body.children[0].style['display']="none";
              document.body.style.cssText=";position:absolute;left:0px;width:100%;top:0px;bottom:0px;z-index:1000;background:#000;";
              this.bigPicDiv=this.bigPicDiv||document.createElement('DIV');
              this.bigPicDiv.className="kw-mobile-photo-bigPicContainer";
              this.bigPicDiv.setAttribute('id','kw-bigPic');
              this.registerEvent(this.bigPicDiv,this.touchEvents.START,false);
              this.bigPicDict={};
              if(!utils.viewport.width){
                  utils._initScreenSize(document.body.offsetHeight);
                  //获取屏幕的大小后初始化常量
                  this.conf.BOUNDARY=utils.viewport.width / 3;
                  this.conf.MINSCREEN=utils.viewport.width / 4;
              }
              for(var i= 0,len=this.Data.photoArr.length;i<len;i++){
                    var itemData=this.Data.photoArr[i];
                    var bigDiv=document.createElement('DIV');
                    bigDiv.className="kw-mobile-photo-bigPic";
                    this.bigPicDict[itemData['index']]=bigDiv;
                    this.bigPicDiv.appendChild(bigDiv);
                    var deltaX=i < id ? ( -1 * utils.viewport.width):(utils.viewport.width);
                    if(i==id){
                        deltaX=0;
                    }
                    this.Data.photoArr[i]['posX']=deltaX;
                    this.bigPicDict[i].style['transform']="translate3d("+deltaX+"px,0px,0px)";
                    this.bigPicDict[i].style['-webkit-transform']="translate3d("+deltaX+"px,0px,0px)";
                    var img=new Image();
                    img.onload=function(e){
                        var target= e.srcElement;
                        var index=target.src && target.src.split('?')[1].substr(6);
                        var picObj={w:target.width,h:target.height,l:0,t:0};
                        picObj=_this._getRealPicWAndH(picObj);
                        var bigImage=document.createElement('IMG');
                        bigImage.style['position']="absolute";
                        bigImage.style['width']=picObj.w+"px";
                        bigImage.style['height']=picObj.h+"px";
                        bigImage.style['top']=picObj.t+"px";
                        bigImage.style['left']=picObj.l+"px";
                        bigImage.setAttribute('id','bigPic_'+index);
                        bigImage.src=target.src && target.src.split('?')[0];
                        _this.bigPicDict[index].appendChild(bigImage);
                    };
                    img.onerror=function(e){

                    }
                    img.src="Image/"+this.Data.photoFile+"/"+itemData["bigPic"]+"?index="+itemData["index"];
              }
              document.body.appendChild(this.bigPicDiv);
       }
       Widget.prototype._setImgStyle=function(obj,cssObj){
            if(!obj)return false;

       }
       //通过真实图片的宽高比和视窗的宽高比决定图片的大小和上下左右的偏移
       Widget.prototype._getRealPicWAndH=function(picObj){
             var vRate=utils.viewport.width / utils.viewport.height,
                  rRate=picObj.w / picObj.h;
             if(rRate > vRate){
                 picObj.w=utils.viewport.width;
                 picObj.h=parseInt(picObj.w / rRate);
                 picObj.t=parseInt((utils.viewport.height - picObj.h) / 2);
             }else if(vRate==rRate){
                  picObj.w=utils.viewport.width;
                  picObj.h=utils.viewport.height;
                  picObj.l=0;
                  picObj.t=0;
             }else{
                 picObj.h=utils.viewport.height;
                 picObj.w=parseInt(rRate * picObj.h);
                 picObj.l=parseInt(utils.viewport.width - picObj.w) / 2;
             }
             return picObj;
       }
       //对附件数组重现排序
       Widget.prototype._replaceArr=function(){
           for(var i= 0,len=this.Data.photoArr.length;i<len;i++){
               this.Data.photoArr[i].index=i;
           }
       }
       Widget.prototype.startEvent=function(e){
           this.startTime= e.timeStamp||(Date.now);
           var pointer= this.touch ? e.touches[0] : e;
           var _this=this,id= e.target && e.target.id;
           this.initX=pointer.pageX;this.initY=pointer.pageY;
           if(!id){
               throw EventException("如果添加了点击事件，改Dom必须有id");
           }
           //当前模式为大图
           if(this.mode=='original'){
               this.registerEvent(e.target,this.touchEvents.MOVE,false);
               this.registerEvent(e.target,this.touchEvents.END,false);
           }else{
               //缩略图的操作
               if(id.indexOf('img')>-1){
                   var id=id.split('-')[1];
                   this.showBigPic(id);
               }else if(id=='addPic'){
                   //添加附件
                   this.addPic();
               }else if(id.indexOf('del')>-1){
                   var id=id && id.split('_')[1];
                   this.delPic(id);
               }
           }
       }
       Widget.prototype.moveEvent=function(e){
            var pointer= this.touch? e.touches[0]:e;
            this.deltaX=pointer.pageX - this.initX,this.deltaY=pointer.pageY - this.initY;
            if(Math.abs(this.deltaX)<6&&Math.abs(this.deltaY)<6){
                return;
            }
            if(Math.abs(this.deltaX) + 6 < Math.abs(this.deltaY)){
                return;
            }
            this.dir=this.dir?this.dir:(this.deltaX > 0 ? 1 : -1);
            try{
                if(this.dir===this.conf.ZERO_VALUE)return;
            }catch(e){

            }
            this.touching=true;
            this.transform(this.deltaX ,0,this.dir);
       }
       /*
        * 移动
        * <params deltaX>水平方向的偏移值</params>
        * <params deltaX>竖直方向的偏移值</params>
        * <params deltaX>移动的方向</params>
        */
       Widget.prototype.transform=function(deltaX,deltaY,dir){

             var dirPar=dir > 0 ? (-1) : 1;
             //if(this.curId==0 && dir==-1||(this.curId==this.Data.photoArr.length - 1 && dir==1)){
             //    dirPar=0;
             //}
             if(dir > this.conf.ZERO_VALUE){
                 //右滑动
                 var prePage=parseInt(this.curId) + dirPar;
                 if(this.touching){
                     this.bigPicDict[this.curId] && (this.bigPicDict[this.curId].style[this.prefixStyle.transitionTimingFunction]="");
                     this.bigPicDict[this.curId] && (this.bigPicDict[this.curId].style[this.prefixStyle.transitionDuration]=this.conf.ZERO_VALUE+"ms");
                     this.bigPicDict[prePage] && (this.bigPicDict[prePage].style[this.prefixStyle.transitionTimingFunction]="");
                     this.bigPicDict[prePage] && (this.bigPicDict[prePage].style[this.prefixStyle.transitionDuration]=this.conf.ZERO_VALUE+"ms");
                 }else{
                     this.bigPicDict[this.curId] && (this.bigPicDict[this.curId].style[this.prefixStyle.transitionTimingFunction]=this.conf.TRANSITION_TIMING_FUNCTION_VALUE);
                     this.bigPicDict[this.curId] && (this.bigPicDict[this.curId].style[this.prefixStyle.transitionDuration]=this.conf.TRANSITION_DURACTION_VALUE);
                     this.bigPicDict[prePage] && (this.bigPicDict[prePage].style[this.prefixStyle.transitionTimingFunction]=this.conf.TRANSITION_TIMING_FUNCTION_VALUE);
                     this.bigPicDict[prePage] && (this.bigPicDict[prePage].style[this.prefixStyle.transitionDuration]=this.conf.TRANSITION_DURACTION_VALUE);
                 }
                 this.bigPicDict[this.curId] && (this.bigPicDict[this.curId].style[this.prefixStyle.transform]="translate3d("+(this.Data.photoArr[this.curId]['posX'] + deltaX)+"px,0px,0px)");
                 this.bigPicDict[prePage] && (this.bigPicDict[prePage].style[this.prefixStyle.transform]="translate3d("+(this.Data.photoArr[prePage]['posX'] + deltaX)+"px,0px,0px)");
             }else if(dir < this.conf.ZERO_VALUE){
                 //左滑动
                 var nextPage=parseInt(this.curId) + dirPar;
                 if(this.touching){
                     this.bigPicDict[this.curId] && (this.bigPicDict[this.curId].style[this.prefixStyle.transitionTimingFunction]="");
                     this.bigPicDict[this.curId] && (this.bigPicDict[this.curId].style[this.prefixStyle.transitionDuration]=this.conf.ZERO_VALUE+"ms");
                     this.bigPicDict[nextPage] && (this.bigPicDict[nextPage].style[this.prefixStyle.transitionTimingFunction]="");
                     this.bigPicDict[nextPage] && (this.bigPicDict[nextPage].style[this.prefixStyle.transitionDuration]=this.conf.ZERO_VALUE+"ms");
                 }else{
                     this.bigPicDict[this.curId] && (this.bigPicDict[this.curId].style[this.prefixStyle.transitionTimingFunction]=this.conf.TRANSITION_TIMING_FUNCTION_VALUE);
                     this.bigPicDict[this.curId] && (this.bigPicDict[this.curId].style[this.prefixStyle.transitionDuration]=this.conf.TRANSITION_DURACTION_VALUE);
                     this.bigPicDict[nextPage] && (this.bigPicDict[nextPage].style[this.prefixStyle.transitionTimingFunction]=this.conf.TRANSITION_TIMING_FUNCTION_VALUE);
                     this.bigPicDict[nextPage] && (this.bigPicDict[nextPage].style[this.prefixStyle.transitionDuration]=this.conf.TRANSITION_DURACTION_VALUE);
                 }
                 this.bigPicDict[this.curId] && (this.bigPicDict[this.curId].style[this.prefixStyle.transform]="translate3d("+(this.Data.photoArr[this.curId]['posX'] + deltaX)+"px,0px,0px)");
                 this.bigPicDict[nextPage] && (this.bigPicDict[nextPage].style[this.prefixStyle.transform]="translate3d("+(this.Data.photoArr[nextPage]['posX'] + deltaX)+"px,0px,0px)");
             }

       }
       //设置滑动属性
       Widget.prototype._setTransitionProp=function(objIndex,Props ){
             for(var val in objIndex){

             }
       }

       Widget.prototype.endEvent=function(e){
           var endTime= e.timeStamp||(Date.now),
                duration=endTime-this.startTime;
           this.touching=false;
           if(this.mode=='original' && (Math.abs(this.deltaX)<6 && Math.abs(this.deltaY)<6)||(isNaN(this.deltaX))){
               this.unRegisterEvent(e.target,this.touchEvents.START,false);
               this.unRegisterEvent(e.target,this.touchEvents.MOVE,false);
               this.unRegisterEvent(e.target,this.touchEvents.END,false);
               this.bigPicDiv.style['display']='none';
               document.getElementById('rooter').style['display']='block';
               document.body.removeChild(this.bigPicDiv);
               this.bigPicDiv=null;
               this.mode='reduce';
           }else if(!isNaN(this.deltaX)){
              this._upsetX(this.deltaX,1);
               //第一个图片的有滑动 || 最后一个图片的左滑动 均视为页面回滚
               if((this.curId==0 && this.dir>0)||(this.curId==this.Data.photoArr.length - 1 && this.dir < 0)){
                   this._changePage(this.dir,this.conf.PAGE_BACK);
               }else
               //快速滑动或者是普通滑动
              if(((duration < this.conf.MINTIME && Math.abs(this.deltaX) > this.conf.MINSCREEN)||(Math.abs(this.deltaX) > this.conf.BOUNDARY))){
                  this._changePage(this.dir,this.conf.PAGE_FORWARD);
              }else{
                  //回滚到原来的位置
                  this._changePage(this.dir,this.conf.PAGE_BACK);
              }
           }
           this.deltaX=0;this.deltaY=0;
           this.startTime=0;this.dir=0;
       }

       /*
        * 记录手指松开时图片移动到的位置
        */
       Widget.prototype._upsetX=function(deltaX,goOrBack){
           if(goOrBack==this.conf.PAGE_FORWARD){
               if(deltaX>this.conf.ZERO_VALUE){
                   this.Data.photoArr[this.curId] && (this.Data.photoArr[this.curId]['posX']+=deltaX);
                   this.Data.photoArr[parseInt(this.curId) - 1] && (this.Data.photoArr[parseInt(this.curId) - 1]['posX']+=deltaX);
               }else{
                   this.Data.photoArr[this.curId] && (this.Data.photoArr[this.curId]['posX']+=deltaX);
                   this.Data.photoArr[parseInt(this.curId) + 1] && (this.Data.photoArr[parseInt(this.curId) + 1]['posX']+=deltaX);
               }
           }else{
               if(deltaX<this.conf.ZERO_VALUE){
                   this.Data.photoArr[this.curId] && (this.Data.photoArr[this.curId]['posX']+=deltaX);
                   this.Data.photoArr[parseInt(this.curId) - 1] && (this.Data.photoArr[parseInt(this.curId) - 1]['posX']+=deltaX);
               }else{
                   this.Data.photoArr[this.curId] && (this.Data.photoArr[this.curId]['posX']+=deltaX);
                   this.Data.photoArr[parseInt(this.curId) + 1] && (this.Data.photoArr[parseInt(this.curId) + 1]['posX']+=deltaX);
               }
           }

       }
       /*
        * <params direction>左为-1 右为1</params>
        * <params goOrBack>切页为1，回滚为-1</params>
        */
       Widget.prototype._changePage=function(direction,goOrBack){
           var deltaX=0;
           if(goOrBack==this.conf.PAGE_BACK){  //回滚
               deltaX=goOrBack * this.deltaX;
               this.transform(deltaX,0,this.dir);
           }else{
               //切换页面
               deltaX=direction * (utils.viewport.width -  Math.abs(this.deltaX));
               this.transform(deltaX,0,this.dir);
           }
           this._upsetX(deltaX,goOrBack);
           if(goOrBack==this.conf.PAGE_FORWARD && this.deltaX > this.conf.ZERO_VALUE){
               this.curId-=1;
           }else if(goOrBack==this.conf.PAGE_FORWARD && this.deltaX < this.conf.ZERO_VALUE){
               this.curId=parseInt(this.curId)+1;
           }
       }
       Widget.prototype.show=function(){

       }
       Widget.prototype.hide=function(){

       }
    return Widget;
})
