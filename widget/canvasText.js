/**
 * Created by haoxin_qiu on 2017/7/30.
 * canvas API
 */
define(['utils','baseWidget'],function(utils,baseClass){
     function Widget(config){
         var _this=this;
         Widget.baseConstructor.call(this,config);
         _this.DataArr=[
             ['职场','老司机'],
             ['中二少年'],
             ['八九点','的太阳'],
             ['玉树','临风']
         ];
         _this.init();
     }
     utils.extends(Widget,baseClass);
     Widget.prototype.initWrapper=function(){
         console.log("sdfsdf");
         var _this=this;
         this.Data=this.get('Data');
         this.outerWrapper = document.createElement('DIV');
         this.outerWrapper.style.cssText=";width:100%;min-height:500px;";
         this.outerWrapper.className = "kw-dtp-outer";
         this.get('container').append(this.outerWrapper);
         this.draw();
     }
     Widget.prototype.draw=function(){
         var _this=this;
         if (!this.canvas){
             this.canvas = document.createElement('CANVAS');
             this.canvas.setAttribute('id','myCanvas');
             //为了提高canvas的清晰度
             this.canvas.width="670";
             this.canvas.height="1000";
             this.outerWrapper.appendChild(this.canvas);
         }
         if (!this.canvas.getContext) {
             return "该浏览器不支持canvas!";
         }
         this.canvasContext = this.canvas.getContext('2d');
         this.canvasContext.beginPath();
         this.canvasContext.strokeStyle='black';
         this.canvasContext.lineWidth=2;
         this.canvasContext.arc(100,100,40,0,2 * Math.PI,false);
         this.canvasContext.stroke();

         this.canvasContext.font="20px Georgia";
         var result=this.canvasContext.measureText(this.DataArr[0][0]);
         console.log("result width is "+result.width);

         this.canvasContext.fillText(this.DataArr[0][0],80,90);
         var result=this.canvasContext.measureText(this.DataArr[0][1]);
         console.log("result width is "+result.width);
         this.canvasContext.fillText(this.DataArr[0][1],70,120);
         console.log("result is "+result);


         var image=new Image();
         image.onload=function(){
             _this.canvasContext.drawImage(image,150,120);
         }
         image.onerror=function(){
             console.log("error!");
         }
         image.src="./img/haoxin.jpg";

         this.canvasContext.beginPath();
         this.canvasContext.lineWidth=2;
         this.canvasContext.arc(300,100,40,0,2 * Math.PI,false);
         this.canvasContext.stroke();

         this.canvasContext.font="20px Georgia";
         var result=this.canvasContext.measureText(this.DataArr[3][0]);
         console.log("result width is "+result.width);

         this.canvasContext.fillText(this.DataArr[3][0],280,90);
         var result=this.canvasContext.measureText(this.DataArr[3][1]);

         this.canvasContext.fillText(this.DataArr[3][1],280,120);
         console.log("result is "+result);
     }
    return Widget;
})
