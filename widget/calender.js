/**
 * Created by haoxin_qiu on 2017/4/28.
 * 日历控件 config:
 * {
 *      WidgetName:'Calender',
 *      container:'',
 *      Data:{
 *          curDate:'',// title 栏显示的时间，日历主体月份根据这个时间的月份来展示
 *          from:'1', //两种弹出方式: 1从顶部弹出  2从底部弹出
 *          btns:[
 *          {
 *               btnName:'确定'，
 *               style:{
 *
 *               },
 *               callBack:null
 *          },
 *          {
 *               btnName:'取消',
 *               style:{
 *
 *               },
 *               callBack:null
 *
 *          }],//按钮的组合
 *          style:{
 *
 *          }
 *      }
 *
 * }
 */
define(['utils','baseWidget'],function(utils,baseClass){
      function Widget(config){
          var _this=this;
          try{
              Widget.baseConstructor.call(this,config);
          }catch(e){
             console.error("WidgetName "+this.get('widget')+" has an Exception is "+e);
          }
          this.init();
      }

      utils.extends(Widget,baseClass);
      Widget.prototype.initWrapper=function(){
          var _this=this;
          this.Data=this.get('Data');
          this.outerWrapper=document.createElement('DIV');
          this.outerWrapper.className="kw-dtp-outer";
          this.setOpts('maskClickCB',function(){
              _this.hide();
          })
          var style=this.Data['style'];
          this.CALENDER_ROWS=6;
          this.CALENDER_COLUMN=7;
          if(style){
              _this.setStyle(this.outerWrapper,style);
          };
          _this.createMask();
          this.innerWraper=document.createElement('DIV');
          this.innerWraper.className="kw-dtp-inner";
          this.outerWrapper.appendChild(this.innerWraper);
          _this.get('container').appendChild(this.outerWrapper);
          _this.initTitle();
          _this.initBody();

      }
      //初始化日历的标题
      Widget.prototype.initTitle=function(){
          var _this=this;
          var btnsArr=this.Data['btns'];
          var titleBar=document.createElement('DIV');
          titleBar.className="kw-dtp-titlebar";
          this.innerWraper.appendChild(titleBar);
          //init buttoms
          if(btnsArr){
              var btnObjs={};
              for(var i= 0,len=btnsArr.length;i<len;i++){
                  var btn=btnsArr[i];
                  var btnId=btn['btnId']||i;
                  var btnObj=document.createElement('SPAN');
                  btnObj.setAttribute("id",btnId);
                  btnObj.className="kw-dtp-btn "+btnId;
                  btnObj.innerHTML=btn['btnName'];
                  btnObjs[btnId]=btnObj;
                  _this.registerEvent(btnObj,'click',btn['callBack']);
                  if(btn['style']){
                      _this.setStyle(btnObj,btn['style']);
                  }
                  titleBar.appendChild(btnObj);
              }
          }
          var middleWrapper=document.createElement('SPAN');
          middleWrapper.className="kw-dtp-middlewrapper";
          var preMon=document.createElement('SPAN');
          preMon.className="kw-dtp-premon";
          preMon.setAttribute('id','preMonth');
          middleWrapper.appendChild(preMon);

          var curDate=this.Data['curDate'];
          this.curDateInfo=utils.getDateInfo(curDate);
          this.dateStrSpan=document.createElement('SPAN');
          this.dateStrSpan.style['paddingLeft']="25px";
          this.dateStrSpan.style['paddingRight']="25px";
          var dateStr=this.curDateInfo['year']+" 年 "+this.curDateInfo['month']+" 月";
          this.dateStrSpan.innerHTML=dateStr;
          middleWrapper.appendChild(this.dateStrSpan);

          var nxtMon=document.createElement('SPAN');
          nxtMon.className="kw-dtp-nexmon";
          nxtMon.setAttribute('id',"nextMonth");
          middleWrapper.appendChild(nxtMon);

          titleBar.appendChild(middleWrapper);
      }
      Widget.prototype.getTitleDate=function(){
          var titleDate=this.dateStrSpan.innerHTML;
          if(titleDate){
              var titleFormat=this.get('titleFormat');
              switch (titleFormat){
                  case 'yyyy年MM月':
                      var index=titleDate.indexOf('年'),
                           year=titleDate.substring(0,index),
                           monthIndex=titleDate.indexOf('月'),
                           month=titleDate.substring(index+1,monthIndex);
                      return {year:parseInt(year),month:parseInt(month)};
                      break;
                  case 'yyyy-MM':

                      break;
                  default:
                      console.log("title format is false,please reset!");
                      return null;
                      break;
              }
          }
      }
      Widget.prototype.setTitle=function(){
          var str=this.curDateInfo['year']+" 年 "+this.curDateInfo['month']+" 月";
          this.dateStrSpan.innerHTML=str;
      }
      Widget.prototype.initBody=function(){
          var _this=this;
          if(!this.bodyWrapper){
              this.bodyWrapper=document.createElement('DIV');
              this.bodyWrapper.className="kw-dtp-boyd";
              this.bodyWrapper.appendChild(_this._initWeekArr());
              this.innerWraper.appendChild(this.bodyWrapper);

          }

          this.drawCalendarBody(this.bodyWrapper);
          this._setToDay();
          this._bindDayClick();
      }
      Widget.prototype.removeChildrens = function (parentNodes) {
            while (parentNodes.childNodes.length > 0) {
                var child = parentNodes.childNodes[0];
                parentNodes.removeChild(child);
            }
      }
      //
      Widget.prototype.drawCalendarBody=function(bodyWrapper){
          this.removeChildrens(bodyWrapper);
          var datesData= this._calcMonthDay(this.curDateInfo.year,this.curDateInfo.month);
          var date=datesData['date'];
          var columnNum=7;
          var rowCount=date.length / columnNum;
          for(var i= 0,len=rowCount;i<len;i++){
              var eachRowDate=date.slice((i * columnNum),(i + 1) * columnNum);
              bodyWrapper.appendChild(this.drawRow(eachRowDate,i));
          }
      }

      Widget.prototype._setToDay=function(){
          ///console.log("curDAte is "+this.get('Data')['curDate']);
          var todayInfo=utils.getDateInfo(this.get('Data')['curDate']);

          var curMonth=todayInfo.month;
          console.log('month is '+curMonth);
          var today=this.curDateInfo["day"];
          var dateIndex="day-"+(parseInt(today) + parseInt(this.datesData["preMonthDays"]));
          var todayDom=document.getElementById(dateIndex);
          if(todayDom){
              todayDom.setAttribute("data-date",today);
              todayDom.classList.add("kw-dtp-today");
              var today=todayDom.querySelector('span');
              if(this.curDateInfo.month==curMonth){
                  today.innerHTML="今天";
              }

              today.classList.add('selected-date');
              this.lastCurDateObj=today;
          }
      }
    //标注某一天  比如说显示当天的样式或点击后的样式
      Widget.prototype._setDateStyle=function(obj,styleId){
        obj.style.cssText="border-radius:100%;background:#1a85ff;color:white";
        if(preStyleId!=styleId){
            var preObj=this.getObjById(preStyleId);
            if(preObj&&preObj.firstChild){
                preObj.firstChild.style.cssText='';
            }
        }
    },
      //绑定dayItem 的click事件
      Widget.prototype._bindDayClick=function(){
          var _this=this;
          this.dayItemDomArr=[];
          for(var i= 1,len=this.CALENDER_COLUMN * this.CALENDER_ROWS;i<=len;i++){
              var temp_id="day-"+i;
              var itemDom=document.getElementById(temp_id);
              if(itemDom){
                  this.dayItemDomArr.push(itemDom);
                  this.bindEvent(itemDom,'click',function(e){
                      var target= e.target,parent=target.parentNode;
                      var date_month=target.getAttribute('data-month');
                      if(!date_month){
                          date_month=parent.getAttribute('data-month');
                      }
                      //console.log("date_month is "+date_month);
                      if(_this.get('dayItemClick')){
                          var curDom= e.target;
                          var curDate= curDom.getAttribute('data-date')|| e.target.parentNode.getAttribute('data-date'),
                              id=curDom.getAttribute('id')|| e.target.parentNode.getAttribute('id');
                          curDom.classList.add("selected-date");
                          _this.lastCurDateObj.classList.remove("selected-date");
                          _this.lastCurDateObj=curDom;
                          _this.get('dayItemClick').call(this, curDom, curDate);
                      }
                      if(date_month=='preMonth'){
                          console.log("premonth");
                          _this.preMonth();
                      }else if(date_month=='nextMonth'){
                          console.log("nexMonth");
                          _this.nextMonth();
                      }
                  })
              }
          }
      }
      Widget.prototype.drawRow=function(rowDate,rowNum){
          var rowStr="<div class='kw-dtp-rows'>";
          for(var i= 0,len=rowDate.length;i<len;i++){
              var date=rowDate[i],className="preMonth";
              if(rowNum<=1){
                  if(date>=1 && date<= (7 * 2 - this.datesData['preMonthDays'])){
                      className="curMonth";
                  }
              }else if(rowNum>=4){
                  if(date>=1 && date<=this.datesData['nextMonthDays']){
                      className="nextMonth";
                  }else{
                      className="curMonth";
                  }
              }else{
                  className="curMonth";
              }
              rowStr+="<span id='day-"+(rowNum * 7 + i + 1)+"' data-date="+date+" data-month='"+className+"' class='kw-dtp-dayitem "+className+"'><span>"+date+"</span></span>";
          }
          rowStr+="</div>";
          return this.transformStrToDom(rowStr);
      }
      Widget.prototype._initWeekArr=function(){
          var weekArr=utils.weekArr;
          if(weekArr){
              var domStr="<div class='kw-dtp-weekwrapper'>";
              for(var i= 0,len=weekArr.length;i<len;i++){
                  domStr+="<span class='kw-dtp-weekitem'>"+weekArr[i]+"</span>"
              }
              domStr+="</div>";
          }
          return this.transformStrToDom(domStr);
      }
      //下个月
      Widget.prototype.nextMonth=function(year,month){
          var nextMonth=new Date(this.curDateInfo.year,this.curDateInfo.month,this.curDateInfo.day);
          this.curDateInfo=utils.getDateInfo(nextMonth);
          console.log("year is "+this.curDateInfo.year+" and month is "+this.curDateInfo.month);
          this.setTitle();
          this.initBody()
      }
      //上个月
      Widget.prototype.preMonth=function(year,month){
          //console.log("curDateInfo is "+this.curDateInfo);
          var preMonthDate=new Date(this.curDateInfo.year,this.curDateInfo.month - 2,this.curDateInfo.day);
          this.curDateInfo=utils.getDateInfo(preMonthDate);
          console.log("year is "+this.curDateInfo.year+" and month is "+this.curDateInfo.month);
          this.setTitle();
          this.initBody();
      }
      ///<summary>计算当前月在bodyWrapper 应显示的日期</summary>
      ///
      ///
      Widget.prototype._calcMonthDay=function(year,month){
            var curMonthDays=this._getDate(year,month,0);
            var preMonthDays=this._getDays(year,parseInt(month) - 1,1);
            console.log("preMonth is "+preMonthDays);
            var nextMonthDays=42 - curMonthDays - preMonthDays;
            var preMonthDates=this._getPreMonthDates(year,parseInt(month) - 1,preMonthDays),
                datesArr=[],k= 1,j=1;
            for(var i= 0,len=(curMonthDays + nextMonthDays);i<len;i++){
                  if(i<curMonthDays){
                     datesArr.push(k++);
                  }else{
                     datesArr.push(j++);
                  }
            }
            this.datesData={
                date:preMonthDates.concat(datesArr),
                nextMonthDays:nextMonthDays,
                curMonthDays:curMonthDays,
                preMonthDays:preMonthDays
            }
            return this.datesData;

      }
    //获取一个月的天数
    Widget.prototype._getDate = function (year, month, day) {
        var dates = new Date(year, month, day).getDate();
        return dates;
    }
    Widget.prototype._getDays=function(year,month,day){
          var days=new Date(year,month,day).getDay();
          return days;
    }
    Widget.prototype._getPreMonthDates=function(year,month,preMonthDays){
           var lastMonthDateArr=[],
               lastMonthDays=this._getDate(year,month,0);
           if(!preMonthDays||preMonthDays===0)return lastMonthDateArr;
           while(preMonthDays){
               lastMonthDateArr.unshift(lastMonthDays--);
               preMonthDays--;
           }
          return lastMonthDateArr;

    }
    Widget.prototype.show=function(){
        if(this.outerWrapper && this.outerWrapper.style['display']!='display'){
            this.outerWrapper.style['display']="block";
        }
        console.log("showMask is "+this.Data['IsShowMask']);
        if(this.Data['IsShowMask']&&this.maskerDiv.style['display']=='none'){
            this.maskerDiv.style['display']="block";
        }
    }
    Widget.prototype.hide=function(){
        if(this.outerWrapper && this.outerWrapper.style['display']!='none'){
            this.outerWrapper.style['display']="none";
        }
        if(this.Data['IsShowMask']&&this.maskerDiv.style['display']=='block'){
            this.maskerDiv.style['display']="none";
        }
    }
    return Widget;
})
