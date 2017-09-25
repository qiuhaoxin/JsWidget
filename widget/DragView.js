/**
 * Created by haoxin_qiu on 2017/8/11.
 * 图标拖拽控件
 * 要点：1.响应手指长按应用，有抖动效果，和显示删除按钮
 * 2.
 * 3�������򻬶�������Ļʱ������ҳ���������Ӧ����
 * config:{
 *    WidgetName:'',
 *    container:'',
 *    Data:{
 *
 *    }
 * }
 */
define(['utils','baseWidget'],function(utils,baseClass) {
    function Widget(config) {
        var _this = this;
        Widget.baseConstructor.call(_this, config);
        this.config = config;
        this.init();
    }

    utils.extends(Widget, baseClass);
    Widget.prototype.Pos={
        x:0,
        y:0
    }
    Widget.prototype.startY=0
    Widget.prototype.startX=0
    Widget.prototype.dragPOS={}
    Widget.prototype.initWrapper = function () {
        this.outerWrapper=this.get('container');
        this.target=document.createElement('DIV');
        this.target.className="kw-dragview-container";
        this.outerWrapper.append(this.target);
        this._initWrapWAndH();
        this.createDom();
    }
    Widget.prototype._initWrapWAndH = function () {
        var that = this;
        this.wraperH = document.body.clientHeight;
        this.wraperW = document.body.clientWidth;
    },
        //只调用一次
     Widget.prototype.createDom = function () {

            var that = this, data = that.get('Data'),columnCount=parseInt(data['columnCount']),
                itemWidth = Math.floor(that.wraperW / columnCount);
            data=data['data'];
            for (var i = 0, len = data.length; i < len; i++) {
                var item = data[i], pos = {row: 0, column: 0};
                var itemView = document.createElement('SPAN');
                itemView.style['width'] = itemWidth + "px";
                itemView.style['height'] = itemWidth + "px";
                itemView.setAttribute('id', i < 10 ? ('0' + i) : i);
                itemView.className = "item";
                var img = document.createElement('IMG');
                img.src = "img/" + item.ImageName;
                img.className="kw-dragview-img";
                var nameDiv = document.createElement('DIV');
                nameDiv.className = "appName";
                nameDiv.innerHTML = item.AppName;
                data[i]['id'] = i < 10 ? ('0' + i) : i;

                itemView.appendChild(img);
                itemView.appendChild(nameDiv);
                pos.row = Math.floor(i / columnCount);
                pos.column = i % columnCount;
                data[i]['POS'] = pos;
                data[i]['Element'] = itemView;
                that.registerEvent(itemView,this.touchEvents.START,false);
                this.target.appendChild(itemView);
            }
            //装载DOM节点完毕后得到Item宽高
            this.Rect = this.Rect || {};
            this.Rect['width'] = itemWidth;
            this.Rect['height'] = itemWidth;
            this.addRect();
     }
    //根据每个Item的POS['row','column']属性填充Rect，每次item的动画完成后也进行这一步
    Widget.prototype.addRect=function(){
        var transform="transform";
        var that=this,data=that.get('Data'),columnCount=data['columnCount'],data=data['data'];
        for(var i=0,len=data.length;i<len;i++){
            var rect={},pos=data[i]['POS'];
            rect['left']=pos.column * this.Rect['width'];
            rect['top']=pos.row * this.Rect['height'];
            data[i]['Rect']=rect;
            data[i].Element.style[transform]="translate("+rect['left']+"px,"+rect['top']+"px)";
        }
        //设置容器的高度和overflow属性
        that.target.style['height']="500px";
        that.target.style['overflow']="hidden";
    }
    Widget.prototype.startEvent=function(e){
        e.preventDefault();
        var that = this,touche = baseClass.mobileAttrs.hasTouch ? e.touches[0] : e,id=0;
        if(e.target.nodeName=='IMG'|| e.target.nodeName=='DIV'){
            that.target= e.target.parentNode;
            id=that.target.getAttribute('id');
        }
        that.dataObj=that.getObjByTag('id',id);
        that.dataObj.Element.style["z-index"]="32";
        that.dragPOS=that.dataObj['POS'];
        that.dragRect={left:that.dragPOS.column * this['Rect'].width,top:that.dragPOS.row * this.Rect['height']};
        this.initX =this.StartToucheX= touche.pageX, this.initY=this.StartToucheY = touche.pageY, this.touchStartTime = e.timestamp || new Date() * 1;
        that.Pos.x=that.dataObj['Rect'].left;
        that.Pos.y=that.dataObj['Rect'].top;
        that.startX =that.dataObj ? ( that.dataObj['POS'].column * that.target.clientWidth) : -1;
        that.startY = that.dataObj ? ( that.dataObj['POS'].row * that.target.clientHeight) : -1;
        if(that.startX==-1||that.startY==-1)return;
        //绑定一个定时器，但手指按下1.5s后不移动则进入删除模式
        this.mTimeout=window.setTimeout(function(){
            console.log("timeout");
            //
        },1500);
        that.registerEvent(that.dataObj.Element,that.touchEvents.MOVE,false);
        that.registerEvent(that.dataObj.Element,that.touchEvents.END,false);
    }
    Widget.prototype.moveEvent=function(e){
        var that=this;
        var touches=  baseClass.mobileAttrs.hasTouch ? e.touches[0]:e;
        var newPosX=touches.pageX,newPosY=touches.pageY,
            distanceX=newPosX - this.initX,distanceY=newPosY-this.initY,
            endTimeStamp= e.timestamp|| new Date() * 1;
        if(Math.abs(distanceX)>6||Math.abs(distanceY)>6){
              window.clearTimeout(this.mTimeout);
        }
        this._pos(this.dataObj.Element,{'DistanceX':distanceX,'DistanceY':distanceY});
        //判断手指移到的地方是那个item  (只有在目标item移动的X轴或Y轴的距离超过 二分之一的长度是才开始判断（性能优化）)
        that.distanceObj={DistanceX:(that.Pos.x - that.dragRect.left) ,DistanceY:(that.Pos.y - that.dragRect.top )};
        that.moveObj={moveX:newPosX,moveY:newPosY};
        if(Math.abs(distanceX)<1&&Math.abs(distanceY)<1){
            return;
        }
        if(Math.abs(that.Pos.x - that.dragRect.left) >(that.Rect['width'] / 2) ||
            Math.abs(that.Pos.y - that.dragRect.top ) > (that.Rect['height'] / 2)){
            //启动监听
            that.startInterval();
        }
    }
    //滑动
    Widget.prototype._pos=function(target,distancePos){
        if(target==undefined||target==null)return;
        target.style[baseClass.mobileAttrs.transform]="translate("+(this.Pos.x+distancePos.DistanceX)+"px,"+(this.Pos.y+distancePos.DistanceY)+"px)";
        this.Pos.x=this.Pos.x + distancePos.DistanceX;
        this.Pos.y=this.Pos.y + distancePos.DistanceY;
        this.initX+=distancePos.DistanceX;
        this.initY+=distancePos.DistanceY;

    },
    Widget.prototype.startInterval=function(moveObj,distanceObj){
        var that=this;
        if(!that.dataObj)return;
        if(that.dataObj['Ticker'])return;
        that.dataObj['Ticker']=setInterval(function(){
            that.onDragItem(that.moveObj,that.distanceObj);
        },100);
    },
    Widget.prototype.endEvent=function(e){
        var that=this,dataSource=that.get('Data')['data'],endTimeStamp= e.timestamp|| new Date() * 1;


        if(this.dataObj['Ticker']!=null){
            clearInterval(this.dataObj.Ticker);
            delete this.dataObj.Ticker;
        }
        this.dataObj.Element && (this.dataObj.Element.style[baseClass.mobileAttrs.transform]="translate("+(this.dataObj.Rect.left)+"px,"+(this.dataObj.Rect.top)+"px)");
        this.dataObj.Element && (this.dataObj.Element.style[baseClass.mobileAttrs.transitionDuration]=100+"ms");
        var timer=setTimeout(function(){
            //解除绑定
            that.unRegisterEvent(that.dataObj.Element,that.touchEvents.MOVE,false);
            that.unRegisterEvent(that.dataObj.Element,that.touchEvents.END,false);
            that.dragPOS=null;
            that.dataObj=null;
            that.dragRect=null;
        },50);
        for(var i= 0,len=dataSource.length;i<len;i++){
            dataSource[i].Element.style[baseClass.mobileAttrs.transitionDuration]="0ms";
        }
    }
    //手指移动到的item position
    Widget.prototype.onDragItem=function(moveObj,distanceObj){
        if(moveObj==undefined||distanceObj==undefined)return;
        var dirX=distanceObj.DistanceX > 0 ? 1 : -1,
            dirY=distanceObj.DistanceY >0 ? 1 : -1;//当移动的距离 DistanceX > 0 表示向X轴的正方向移动 < 0表示想负方向移动
        if(!this.dataObj){
            return;
        }
        var curPos=this.dataObj && this.dataObj.POS;
        var curRow=curPos && curPos.row,curColumn=curPos && curPos.column;
        this.calcTouchItem(distanceObj);
    },
        //计算当拖住的Item与目标Item重叠的面积超过1/2，为目标Item添加动画
     Widget.prototype.calcTouchItem=function(distanceObj){
        var that=this,targetArr=[],row=that.dataObj.POS.row,column=that.dataObj.POS.column,data=this.get('Data')['data'],columnCount=parseInt(this.get('Data')['columnCount']);
        //找到拖住Item周围的Item 避免对这个数据循环
        for(var rowIndex=(row - 1);rowIndex<=(row + 1);rowIndex ++){
            if(rowIndex >= 0 && rowIndex < Math.ceil(data.length/columnCount)){
                for(var columnIndex=(column - 1);columnIndex<=(column + 1);columnIndex++){
                    if(rowIndex==row && columnIndex==column)continue;
                    if(columnIndex<columnCount&&columnIndex >=0)
                        targetArr.push({'row':rowIndex,'column':columnIndex});
                }
            }
        }
        for(var i= 0,len=targetArr.length;i<len;i++){
            var targetObj=targetArr[i];
            if(targetObj.row==row && targetObj.column==column)continue;
            if(targetObj.row >= 0 && targetObj.column >= 0){
                for(var j= 0,l=data.length;j<l;j++){
                    var dataItem=data[j];
                    if(dataItem['POS'].row==targetObj.row && dataItem['POS'].column==targetObj.column){
                        var centerP= this.getCenterPoint(that.dragRect,distanceObj);
                        var item = this.containPoint(centerP,dataItem);
                        if(item!=null){
                            this.setTransform(this.dataObj,item);
                            return ;
                        }

                    }
                }
            }
        }
    },
        //获取Item的中心点
    Widget.prototype.getCenterPoint=function(Rect,distanceObj){
        if(!Rect)return {X:0,Y:0};
        var x=(Rect.left + this.Rect.width / 2 ) +  distanceObj.DistanceX,
            y=(Rect.top + this.Rect.height / 2) + distanceObj.DistanceY;
        return {X:x,Y:y};
    },
    Widget.prototype.containPoint=function(centerP,dataItem){
        if(!centerP||!dataItem)return null;
        var Rect=dataItem['Rect'],top=Rect['top'],
            left=Rect['left'];
        if(centerP.X > left && centerP.X < (left +this.Rect.width) && centerP.Y > top && centerP.Y < (top + this.Rect.height)){
            return dataItem;
        }
        return null;
    },
        //sourItem(拖住的item) destItem(拖住的item要移动到的Item)
     Widget.prototype.setTransform=function(sourItem,destItem){
        var that=this,dataSource=that.get('Data'),columnCount=dataSource['columnCount'],dataSource=dataSource['data'];
        var sourId=sourItem.id,destId=destItem.id;
        var sourItemRow=sourItem['POS'].row,sourItemColumn=sourItem['POS'].column,
            destItemRow=destItem['POS'].row,destItemColumn=destItem['POS'].column;
        var sourPos=(sourItemRow * columnCount + sourItemColumn ),destPos=(destItemRow * columnCount + destItemColumn);
        var dir=sourPos - destPos;
        dir=parseInt(dir> 0 ? -1 : 1);
        var index=parseInt(sourPos + parseInt(dir));
        for(;(dir==1?(index <=parseInt(destPos) && index >=0):(index >= parseInt(destPos) && index >=0));){
            var targetPos= this.pos2obj(index);
            var moveToPos=this.pos2obj(index +(-dir));
            for(var i= 0,len=dataSource.length;i<len;i++){
                var item=dataSource[i];
                if(item['POS'].row==targetPos['row']&&item['POS'].column==targetPos['column']){
                    //item.Element && (item.Element.style[transform]="translate("+( moveToPos.column * this['Rect'].width - item['Rect'].left)+"px,"+( moveToPos.row * this['Rect'].height - item['Rect'].top)+"px)");
                    item.Element && (item.Element.style[baseClass.mobileAttrs.transform]="translate("+(moveToPos.column * this['Rect'].width)+"px,"+(moveToPos.row * this['Rect'].height)+"px)");
                    item.Element && (item.Element.style[baseClass.mobileAttrs.transitionDuration]=80+"ms");
                    //改变targetItem 的位置
                    item['POS']=moveToPos;
                    item['Rect'].left=item['POS'].column * this['Rect'].width;
                    item['Rect'].top=item['POS'].row * this['Rect'].height;
                    break;
                }
            }
            index+=dir;
        }
        that.dataObj['POS'].row=destItemRow;
        that.dataObj['POS'].column=destItemColumn;
        that.dataObj['Rect'].left=destItemColumn * this['Rect'].width;
        that.dataObj['Rect'].top=destItemRow * this['Rect'].height;
        that.resetDragItem();
    },
        //位置转换为{row:0,column:0}的对象
     Widget.prototype.pos2obj=function(position){
        var columnCount=parseInt(this.get('Data')['columnCount']);
        if(position==0)return {row:0,column:0};
        if(!position)return;
        return {row:Math.floor(position/columnCount),'column':(position % columnCount)}
    },
        //用that.dataObj 的数据重置数据源的数据\
    Widget.prototype.resetDragItem=function(){
        var dataSource=this.get('Data')['data'];
        for(var i= 0,len=dataSource.length;i<len;i++){
            if(dataSource[i].id==this.dataObj.id){
                dataSource[i].Rect.left=this.dataObj.Rect.left;
                dataSource[i].Rect.top=this.dataObj.Rect.top;
                dataSource[i].POS.row=this.dataObj.POS.row;
                dataSource[i].POS.column=this.dataObj.POS.column;
                break;
            }
        }
    },
    //根据指定的TagName和TagValue从菜单数据获取相应的数据对象
    Widget.prototype.getObjByTag=function(tagName,tagValue){
        if(arguments.length<2)return;
        if(typeof tagName!='string'||tagValue==null||tagValue==undefined)return;
        var data=this.get('Data')['data'];
        for(var i= 0,len=data.length;i<len;i++){
            if(data[i][tagName]==tagValue)
                return data[i];
        }
        return null;
    }
     return Widget;
})
