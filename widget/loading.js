/**
 * Created by haoxin_qiu on 2017/7/30.
 * WigetName:loading
 * 加载loading
 *
 */
define(['utils','baseWidget'],function(utils,baseClass){
     function Widget(config){
         try{
             var _this=this;
             Widget.baseConstructor.call(this,config);
             this.init();
         }catch(ex){
             console.log("控件"+this.get('WidgetName')+"发生错误："+ex);
         }

     }
     utils.extends(Widget,baseClass);

     Widget.prototype.initWrapper=function(){
          var _this=this;
          this.Data=this.get('Data');
         this.setOpts('maskClickCB',function(){
             _this.hide();
         })
         this.outerWrapper = document.createElement('DIV');
         this.outerWrapper.className = "kw-dtp-outer";
         this.outerWrapper.style['display']="block";
         this.get('container').appendChild(this.outerWrapper);
          if(this.Data['IsShowMask']){
              this.createMask();
          }
         this.BGWrapper=document.createElement('DIV');
         this.BGWrapper.className="kw-loading-wrapper";
         if(this.Data['BGStyle']){

         }
         this.outerWrapper.appendChild(this.BGWrapper);
         var leafDIV=document.createElement('DIV');
         leafDIV.className="kw-loading";
         var html="";
         for(var i= 0,len=12;i<len;i++){
             html+="<div class='kw-loading-leaf loading-leaf-"+ i +"'></div>";
         }
         leafDIV.innerHTML=html;
         this.BGWrapper.appendChild(leafDIV);

          this.ContentTipP=document.createElement('P');
          this.ContentTipP.innerHTML=this.Data['ContentTips'];
          this.ContentTipP.className="kw-loading-tip";
          this.BGWrapper.appendChild(this.ContentTipP);
     }
    //重设提示加载提示语
     Widget.prototype.setContentTips=function(str){
          this.ContentTipP && (this.ContentTipP.innerHTML=str);
     }
    //隐藏
     Widget.prototype.show=function(){
         if(this.outerWrapper && this.outerWrapper.style['display']!='display'){
             this.outerWrapper.style['display']="block";
         }
         if(this.Data['IsShowMask']&&this.maskerDiv.style['display']=='none'){
             this.maskerDiv.style['display']="block";
         }
     }
     Widget.prototype.hide=function(){
         if(this.outerWrapper && this.outerWrapper.style['display']!='none'){
             this.outerWrapper.style['display']="none";
         }
     }

     return Widget;
})
