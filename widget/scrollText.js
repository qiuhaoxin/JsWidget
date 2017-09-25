/**
 * Created by haoxin_qiu on 2017/3/31.
 * config 格式:
 * {
 *    WidgetName:'',
 *    container:'',
 *    Data:{
 *
 *    }
 * }
 */
define(['baseWidget','utils'],function(baseClass,utils){
      function Widget(config){
           var _this=this;
           Widget.baseConstructor.call(_this,config);
           try{
               console.log("config is "+JSON.stringify(this.config));
           }catch(e){

           }
           this.init();
      }
      utils.extends(Widget,baseClass);
      Widget.prototype.initWrapper=function(){
            var _this=this,container=this.get('container');
            this.outerWrapper=container.get(0);
            this.setOpts('hScroll',true);
            this.setOpts('vScroll',false);
            this.minScrollX=0;
            this.maxScrollX=(300 - 700);
            this.registerEvent(this.outerWrapper,this.touchEvents.START,false);

      }
      //Widget.prototype.startEvent=function(e){
      //      console.log("startEvent");
      //}
      //Widget.prototype.moveEvent=function(){
      //      console.log("moveEvent");
      //}
      Widget.prototype._pos=function(x,y){
            x=this.opts.hScroll ? x : 0;
            y=this.opts.vScroll ? y : 0;
            this.outerWrapper.style['-webkit-transform']="translate3d("+x+"px,"+y+"px,0px)";
            this.x=x;
            this.y=y;
      }
      Widget.prototype.endEvent=function(e){
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
            this.unRegisterEvent(this.outerWrapper,this.touchEvents.MOVE);
            this.unRegisterEvent(this.outerWrapper,this.touchEvents.END);
            this.unRegisterEvent(this.outerWrapper,this.touchEvents.CANCEL);
            if(duration<300&&this.opts.momentum){//快速滑动
                  momentumX=newPosX?this._momentum(newPosX-this.startX,duration,-this.x,-this.maxScrollX + this.x,this.opts.bounce?300:0):momentumX;
                  momentumY=newPosY?this._momentum(newPosY - this.startY,duration,-this.y, (this.maxScrollY < 0 ? this.scrollerH - this.wrapperH + this.y - this.minScrollY : 0),this.opts.bounce?this.wrapper.wrapperH:0):momentumY;
                  newPosX=this.x+momentumX.dist;
                  newPosY=this.y+momentumY.dist;
                  if ((this.y > this.minScrollY && newPosY > this.minScrollY) || (this.y < this.maxScrollY && newPosY < this.maxScrollY)) momentumY = { dist:0, time:0 };
                  if((this.x > this.minScrollX&&newPosX > this.minScrollX)||(this.x < this.maxScrollX && newPosX < this.maxScrollX))momentumX={dist:0,time:0};
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
      Widget.prototype._transitionTime=function (time) {
            time += 'ms';
            this.outerWrapper.style['-webkit-transitionDuration'] = time;
            this.outerWrapper.style['transitionDuration'] = time;
            //if (this.hScrollbar) this.hScrollbarIndicator.style[transitionDuration] = time;
            //if (this.vScrollbar) this.vScrollbarIndicator.style[transitionDuration] = time;
      },
      Widget.prototype.show=function(){

      }
      Widget.prototype.hide=function(){

      }
      return Widget;
})