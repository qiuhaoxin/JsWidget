/**
 * Created by haoxin_qiu on 2017/3/29.
 * config {
 *    WidgetName:'',
 *    container:'',
 *    Data:{
 *      title:'',
 *      ListData:[
 *        {},
 *        {FItemID:'',FItemName:''}
 *      ]
 *    }
 * }
 */

define(['utils','baseWidget'],function(utils,baseClass){
     function Widget(config){
         var _this=this;
         Widget.baseConstructor.call(this,config);
         this.init();
     }
     utils.extends(Widget,baseClass);
     Widget.prototype.init=function(){
         this.initData();
         this.createMask();
         this.initWrapper();
     }
     //对列表数据
     Widget.prototype.initData=function(){
          var _this=this;
          this.Data=this.get('Data');
          if(!this.Data){
              alert("列表控件的数据源不能为空!");
              return;
          }
          this.listData=this.Data.ListData;
     }

     Widget.prototype.initWrapper=function(){
          var _this=this;
         _this.Wrapper=document.createElement('DIV');
         _this.Wrapper.setAttribute('id',"listPageWrapper");
         _this.Wrapper.className="kw-listPage-wrapper";
         var maskerIndex= _this.getMaskerZIndex();
         _this.Wrapper.style['z-index']=parseInt(maskerIndex)+1;
         _this.Wrapper.style["display"]="block";
         this.setOpts('vScroll',true);
         this.setOpts('hScroll',false);
         this.setOpts('maskClickCB',function(){
             console.log("hei click");
             _this._hide();
         })
         this.get('container')&&this.get('container').appendChild(_this.Wrapper);
         this.initTitle(this.Data['title']);
         this.initList();
         this.initScrollBar();
         //初始化容器和内容完毕后，计算列表的高度和宽度
         this.caculateScroller();

         //设置整个容器的高度和宽度
         this.wrapper.wrapperH=(242-44);
         this.wrapper.wrapperW=217;

         this.minScrollY=0;
         this.maxScrollY=(this.wrapper.wrapperH - this.scroller.scrollY + this.minScrollY);
         console.log("maxScrollY is "+this.maxScrollY);
         this.minScrollX=0;
         this.maxScrollX=(this.wrapper.wrapperW - this.scroller.scrollX +this.minScrollX);
         //
         this.listWrapper.style['transitionTimingFunction']="cubic-bezier(.33,.66,.66,1)";
     }

     //计算真实列表高度和宽度
     Widget.prototype.caculateScroller=function(){
         this.scroller.scrollX=this.UL&&this.UL.scrollWidth||0;
         this.scroller.scrollY=this.UL&&this.UL.scrollHeight||0;
     },
     Widget.prototype.initTitle=function(titleName){
         var _this=this;
         var titleDiv=document.createElement('DIV');
         titleDiv.setAttribute('id','listPageTitle');
         titleDiv.className="kw-listPage-title";
         titleDiv.innerHTML=titleName;
         _this.Wrapper.appendChild(titleDiv);
         if(this.Data['titleStyle']){
             utils.css($(titleDiv),this.Data['titleStyle']);
         }
     }
     Widget.prototype.initList=function(){
         var _this=this;
         this.listWrapper=document.createElement('DIV');
         this.listWrapper.className="kw-listPage-listwrapper";

         this.UL=document.createElement('UL');
         this.UL.setAttribute('id','listPageUl');
         this.UL.style['backgroundColor']='#fff';
         for(var i= 0,len=this.listData.length;i<len;i++){
             var LI=document.createElement('LI');
             var itemData=this.listData[i];
             LI.setAttribute('id','li'+itemData['FItemID']);
             LI.className="kw-listPage-li displayflex";
             LI.innerHTML=itemData['FItemName'];
            // var aLink=document.createElement('a');
             //aLink.innerHTML=itemData['FItemName'];

             //LI.appendChild(aLink);
             if(this.Data['itemStyle']){
                 utils.css($(LI),this.Data['itemStyle']);
             }
             this.UL.appendChild(LI);
         }
         this.listWrapper.appendChild(this.UL);
         this.Wrapper.appendChild(this.listWrapper);
         this.registerEvent(this.listWrapper,this.touchEvents.START);
     }
     Widget.prototype.initScrollBar=function(){
         var _this=this;
         _this.scrollBar=document.createElement('DIV');
         _this.scrollBar.className="kw-listPage-scrollbar";
         var scrollBarStyle={
             position:'absolute',
             zIndex:'100',
             right:'1px',
             top:'1px',
             bottom:'2px',
             width:'7px',
             'pointer-events':'none',
             overflow:'hidden',
             transitionDelay:'300ms',

         }
         utils.css($(this.scrollBar),scrollBarStyle);
         this.listWrapper.appendChild(this.scrollBar);
     }
     Widget.prototype.bind=function(eventName,callBack){

     }
     Widget.prototype.show=function(){
         //
          if(this.Wrapper.style['display']=='none'){
              this.Wrapper.style['display']="block";
          }
         if(this.Data['IsShowMask']&&this.maskerDiv.style['display']=='none'){
             this.maskerDiv.style['display']="block";
         }

     }
     Widget.prototype._hide=function(){
         if(this.Wrapper.style['display']=='block'){
             console.log("hei");
             this.Wrapper.style['display']="none";
         }
     }

     return Widget;
})
