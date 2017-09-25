/**
 * Created by haoxin_qiu on 2017/4/25.
 * 预警控件
 * config:
 * {
 *    WidgetName:'AlarmWidget',
 *    container:'',
 *    Data:[
 *
 *    ]
 * }
 */
define(['utils','baseWidget'],function(utils,baseClass){
      function Widget(config){
          var _this=this;
          Widget.baseConstructor.call(this,config);
          try{
              console.log("WidgegName is "+this.get('WidgetName'));

          }catch(e){
              console.error("控件"+this.get('WidgetName')+"发生异常!");
          }
          this.ulObj=[];
          this.init();

      }
      utils.extends(Widget,baseClass);
      Widget.prototype.initWrapper=function(){
           var _this=this;
          this.Data=this.get('Data');
           this.container=this.get('container');
          if(this.Data['IsShowMask']){
              this.createMask();
          }
          this.setOpts('maskClickCB',function(){
              _this.hide();
          })
           _this.outerWrapper=document.createElement('DIV');
           _this.outerWrapper.className="kw-alarm-wrapper";
           this.container.appendChild(this.outerWrapper);
          this.initHead(_this.outerWrapper);

      }
      Widget.prototype.initHead=function(outerWrapper){
          var that=this;
          var wrapHeader = document.createElement("div");
          wrapHeader.className = "kw-wraper-head";

          var spanTitle = document.createElement("span");
          spanTitle.className = "alert-title";
          spanTitle.innerHTML = this.Data.wrapTitle;
          var divEl=document.createElement("div");
          divEl.appendChild(spanTitle);
          wrapHeader.appendChild(divEl);

          var saveBtn = document.createElement("span");
          saveBtn.className = "alert-save";
          saveBtn.innerHTML = "保存";
          saveBtn.addEventListener("click", function () {
              if (that.saveCallBack) {
                  var result = that._saveData();
                  that.saveCallBack.call(that,result);
              }

          }, false);
          var divEl1=document.createElement("div");
          divEl1.appendChild(saveBtn);
          wrapHeader.appendChild(divEl1);

          var wrapBody = document.createElement("div");
          wrapBody.className = "wraper-body";

          var inputEl = document.createElement("input");
          inputEl.setAttribute("id", "dayNum");
          inputEl.type = "tel";
          if (that.Data.defaultDay)
              inputEl.value = that.Data.defaultDay;

          var unitSpan = document.createElement("span");
          unitSpan.innerHTML = "天";

          wrapBody.appendChild(inputEl);
          wrapBody.appendChild(unitSpan);
          //推送时间设置
          this.PUSTTime = document.createElement("div");
          this.PUSTTime.className = "pushWrap";

          for (var i = 0, len = that.Data.defaultTime.length; i < len; i++) {
              var pushTime = document.createElement("div");
              pushTime.className = "push-row";
              pushTime.setAttribute("id", "row-" + i);

              var spanLeft = document.createElement("span");
              spanLeft.className = "push-left";
              spanLeft.innerHTML = "推送时间设置";
              if (i != 0)
                  spanLeft.style["visibility"] = "hidden";
              var spanMid = document.createElement("span");
              spanMid.className = "push-mid";
              var timeSpan = document.createElement("span");
              timeSpan.setAttribute("id", "time-" + i);
              timeSpan.className = "time-blur";
              timeSpan.innerHTML=that.Data.defaultTime[i];
              spanMid.appendChild(timeSpan);
              timeSpan.addEventListener("click", function (e) {
                  if (that.Data.timeClickEv)
                      that.Data.timeClickEv.call(that);
                  that._resetList(this.innerHTML);
                  that._editTStyle(e);
              }, false);
              var spanRight = document.createElement("span");
              spanRight.className = "push-right";

              spanRight.addEventListener("click", function () {
                  that._editPTime(this.id, this);
              }, false);
              if (i == 0){
                  spanRight.setAttribute("id", "add-" + i);
                  spanRight.innerHTML = "添加时间";
              }
              else {
                  spanRight.innerHTML = "删除时间";
                  spanRight.style["color"] = "red";
                  spanRight.setAttribute("id", "del-" + i);
              }
              pushTime.appendChild(spanLeft);
              pushTime.appendChild(spanMid);
              pushTime.appendChild(spanRight);
              that.PUSTTime.appendChild(pushTime);
          }

          outerWrapper.appendChild(wrapHeader);
          outerWrapper.appendChild(wrapBody);
          outerWrapper.appendChild(this.PUSTTime);
          this._initTime();
      }
      Widget.prototype._initTime=function(){
          var that = this,i,btnLen=that.Data.btnSet.length,itemH=that.Data.itemH;
          var btnDiv = document.createElement("div");
          btnDiv.className = "btn-wrap";
          btnDiv.style.cssText = that.Data.btnPRCss.css;
          var btnW = 100 / btnLen;
          //按钮
          for (i = 0; i < btnLen; i++) {
              var btnData=that.Data.btnSet[i];
              var divChild = document.createElement("div");
              divChild.style.cssText = "display:table-cell;width:" + btnW + "%;"+btnData.css;
              divChild.innerHTML = btnData.name;
              if (btnData.clickCB) {
                  divChild.addEventListener('click', btnData.clickCB, false);
              }

              btnDiv.appendChild(divChild);
          }
          //时间列表
          if (that.Data.arrCount != that.Data.arrData.length) {
              alert("no fit!");
              return;
          }
          that.divContainer = document.createElement("div");
          that.divContainer.className = "time-container";
          var ListW = 100 / that.Data.arrCount;

          for (i = 0; i < that.Data.arrCount; i++) {
              var tempObj = {};
              var data = that.Data.arrData[i];
              var divWraper = document.createElement("div");
              divWraper.className = "time-wrap";
              divWraper.setAttribute("id", "time-"+data.name);
              divWraper.style.cssText = "float:left;width:"+ListW+"%;";

              var UL = document.createElement("UL");
              UL.className = data.name + "-list";
              UL.style["transform"] = "translate(0,0)";
              UL.style["transition"] = "0ms";

              tempObj["name"] = data.name;
              tempObj["obj"] = UL;
              tempObj["x"] = 0;
              var returnData= that._initList(UL, data.data, data.name);
              tempObj["y"] = returnData.y;
              tempObj["value"] = '';
              tempObj["itemCount"] = returnData.itemCount;
              tempObj["limitIndex"]={min:0,max:tempObj["itemCount"]};
              that.ulObj.push(tempObj);

              divWraper.appendChild(UL);
              that.divContainer.appendChild(divWraper);
          }
          that.outerWrapper.appendChild(btnDiv);
          that.outerWrapper.appendChild(that.divContainer);
          for (var i = 0, len = that.ulObj.length; i < len; i++) {
              that._setMidRow(that.ulObj[i]);
          }
          that.registerEvent(that.divContainer,that.touchEvents.START,false);
      }
      Widget.prototype._initList=function(obj, dataList,name){
          var that=this;
          if (obj == null) return;
          if (dataList == null || dataList.length == 0) {
              dataList = that._GetData(name);
          }
          for (var i = 0, len = dataList.length; i < len; i++) {
              var li = document.createElement("Li");
              if (name == 'Week')
                  li.setAttribute('id', 'week-' + i);
              else
                  li.setAttribute('id', 'hour-' + i);
              li.style.cssText = "height:"+that.Data.itemH+"px;line-height:"+that.Data.itemH+"px;";
              li.innerHTML = dataList[i];
              li.setAttribute('data-date',dataList[i]);
              obj.appendChild(li);
          }
          var deltaY=that._GetPos(name);
          that._pos(obj,deltaY);

          return { itemCount: dataList.length ,y:deltaY};
      }
      Widget.prototype.startEvent=function(e){
          var point = baseClass.mobileAttrs.hasTouch ? e.touches[0] : e, that = this;
          that.pointX = point.pageX,
              that.pointY = point.pageY;
          that.index = Math.round(that.pointX/that.outerWrapper.offsetWidth),
              curObj = that.ulObj[that.index], that.moved = false;
          that.startY = point.pageY;

          that.startTime=e.timeStamp||Date.now();
          that.registerEvent(that.divContainer,that.touchEvents.MOVE,false);
          that.registerEvent(that.divContainer,that.touchEvents.END,false);
         // that.registerEvent(that.outerWrapper,ANIEND_EV,false);
      }
      Widget.prototype.moveEvent=function(e){
              e.preventDefault();
              var point = baseClass.mobileAttrs.hasTouch ? e.touches[0] : e, that = this,
                  deltaX = point.pageX - that.pointX,
                  deltaY = point.pageY - that.pointY,
                  curObj = that.ulObj[that.index],
                  newY = curObj.y + (deltaY / 5 * 4);
              // that._hideMidRow();
              that.pointX = point.pageX;
              that.pointY = that.endY = point.pageY;

              that.moved = true;
              that._pos(curObj["obj"], newY);
              that.ulObj[that.index].y = newY;
      }
      Widget.prototype.endEvent=function(e){
          var that = this, timeStamp = e.timeStamp || Date.now(),
              duration = timeStamp - that.startTime,
              curObj = that.ulObj[that.index], momentumY = { dist: 0, time: 0 },
              newPosY = curObj.y,deltaY=0;
          if (!that.moved) return;

          that.unRegisterEvent(that.divContainer,that.touchEvents.MOVE,false);
          that.unRegisterEvent(that.divContainer,that.touchEvents.END,false);
          if (duration < 300 && that.Data.momentum && Math.abs(newPosY - that.startY) > 10) {
              deltaY = that._getCanScrollValue((curObj.itemCount>20?10:curObj.itemCount)*that.Data.itemH,that.endY-that.startY);
          }
          that.ulObj[that.index].y = newPosY = that._getRealPos(newPosY + deltaY, curObj.limitIndex, curObj.obj);
          curObj.obj.style[baseClass.mobileAttrs.transform] = "translate(0," + newPosY + "px)";
          curObj.obj.style['transition'] = "transform .5s cubic-bezier(0.333333, 0.666667, 0.666667, 1) 0s";
          that.registerEvent(that.divContainer,this.touchEvents.TRNEND_EV,false);
      }

      Widget.prototype._transitionEnd=function(e){
            var that = this,
                curObj = that.ulObj[that.index];
            that._setMidRow(curObj);
          //  that.registerEvent(that.divContainer,this.touchEvents.START,false);
            //that._unbind(TRNEND_EV,that.divContainer);
      },
      Widget.prototype._pos=function(obj,newY){
        var that = this;
        if (obj == null) return;
        obj.style[baseClass.mobileAttrs.transform] = "translate(0," + newY + "px)";

      },
      Widget.prototype._getRealPos=function(wantToY,limitIndex,curObj){
        var that=this,rowCount=that.Data.arrCount,itemH=that.Data.itemH;
        var upper = itemH * Math.floor(rowCount / 2) - (limitIndex.min * itemH);
        var dir = wantToY < 0 ? -1 : 1;
        var lower = itemH * Math.ceil(rowCount / 2) - (limitIndex.max-1) * itemH;
        var real = wantToY < upper ? (wantToY > lower ? wantToY : lower) : upper;
        /*获得精确的定位*/
        var AccurateIndex = Math.abs(Math.round(real / itemH - Math.floor(rowCount / 2)));
        // _curObjInfo.index = AccurateIndex;
        return itemH * Math.floor(rowCount / 2) - AccurateIndex * itemH;

    },
    Widget.prototype._getCanScrollValue=function(canScrollHeight,touchDiff){

        var that = this, dir = touchDiff < 0 ? -1 : 1, absDiff = Math.abs(touchDiff),
            itemHeight=that.Data.itemH,rowCount=that.Data.arrCount;
        if (touchDiff > itemHeight * rowCount * 3 / 4) {
            return canScrollHeight * dir * 0.9;
        }else if(touchDiff<itemHeight * rowCount * 3/4&&touchDiff>itemHeight * rowCount *  1/2){
            return canScrollHeight * dir * 0.7;
        }else if(touchDiff<itemHeight * rowCount * 1/2&&touchDiff>itemHeight * rowCount * 1/4){
            return canScrollHeight * dir * .5;
        }else{
            return itemHeight * dir * 2;
        }

    },
      Widget.prototype._setMidRow=function (ulObj) {
            if (ulObj == undefined) return;

            var that = this,y=ulObj.y,arrName=ulObj.name,
                itemH = that.Data.itemH;
            var value = 2 - (y / itemH);
            value = that._transformToReal(arrName, value);
            switch(arrName){
                case 'Week':
                    for (var i = 0, len = 7; i < len; i++) {
                        var obj = that.getDomByID('week-' + i);
                        if (obj && obj.getAttribute('data-date') == value) {
                            obj.style["color"] = "rgb(47, 185, 252)";
                        } else {
                            // obj.style["color"] = "#000";
                            obj.style["color"] = "#858e91";
                        }

                    }
                    break;
                case 'Hour':
                    for (var i = 0, len = 24; i < len; i++) {
                        var obj = that.getDomByID('hour-' + i);
                        if (obj && obj.getAttribute('data-date') == value) {
                            obj.style["color"] = "rgb(47, 185, 252)";
                        } else {
                            obj.style["color"] = "#000";
                            obj.style["color"] = "#858e91";
                        }

                    }
                    break;
            }
      },
          //根据value来获取真实的值
      Widget.prototype._transformToReal=function (type, value) {
            var temp = '';
            switch(type){
                case 'Week':
                    switch (value) {
                        case 1:
                            temp = "星期一";
                            break;
                        case 2:
                            temp = "星期二";
                            break;
                        case 3:
                            temp = "星期三";
                            break;
                        case 4:
                            temp = "星期四";
                            break;
                        case 5:
                            temp = "星期五";
                            break;
                        case 6:
                            temp = "星期六";
                            break;
                        case 7:
                        case 0:
                            temp = "星期日";
                            break
                        default:
                            throw new Error("出错了！"+value);
                            break;
                    }
                    break;
                case 'Hour':
                    temp = (value < 10 ? "0" + value : value) + ":00";
                    break;
            }
            return temp;
    },
      Widget.prototype._GetPos=function (name) {
        var pos=0,that=this,itemHeight=that.Data.itemH||45;
        switch (name) {
            case 'Week':
                var date = new Date(),
                    currentDate = date.getDay();
                if (currentDate == 0) currentDate = 7;
                pos = (2-currentDate) * itemHeight;
                break;
            case 'Hour':
                var date = new Date(),
                    currentHour = date.getHours();
                pos = (2 - currentHour) * itemHeight;
                break;
            default:

                break;
        }
        that.y = pos;
        return pos;
      },
      Widget.prototype._GetData=function(name){
          var temp = [];
          switch (name) {
              case 'Week':
                  temp = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'];
                  break;
              case 'Hour':
                  for (var i = 1; i <= 24; i++) {
                      var time = (i < 10 ? "0" + i : i) + ":00";
                      temp.push(time);
                  }
                  break;
              default:

                  break;
          }
          return temp;
      }
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
