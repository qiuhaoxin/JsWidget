/**
 * Created by haoxin_qiu on 2017/7/14.
 * 联动日期(PC 端)
 */
define(['utils', 'baseWidget'], function (utils, baseClass) {
     function Widget(config) {
          var _this = this;
          Widget.baseConstructor.call(this, config);
          this.init();
     }
     utils.extends(Widget, baseClass);
     Widget.prototype.initWrapper = function () {
          var _this = this;
          _this.Data = this.get('Data');
          var style = _this.get('style');
          this.CALENDER_ROWS = 6;
          this.CALENDER_COLUMN = 7;
          this.outerWrapper = document.createElement('DIV');
          this.outerWrapper.className = "kw-dtp-outer";
          if (style) {
               _this.setStyle(this.outerWrapper, style);
          };
          _this.createMask();
          this.innerWraper = document.createElement('DIV');
          this.innerWraper.className = "kw-dtp-inner";
          this.outerWrapper.appendChild(this.innerWraper);
          _this.get('container').appendChild(this.outerWrapper);
          //侧功能栏
          if (_this.Data['sideBar']['show']) {
               var timeNav = document.createElement('DIV');
               timeNav.className = "kw-lt-timenav";
               this.innerWraper.appendChild(timeNav);
               _this.Data['sideBar']['Data'].forEach(function (item, index, array) {
                    var result = "";
                    var options = { Year: 0, Month: 0, Day: 0 };
                    var tempDom = document.createElement('DIV');
                    tempDom.className = "kw-sb-item";
                    tempDom.innerHTML = item['FName'];
                    timeNav.appendChild(tempDom);
                    if (item['callBack']) {
                         _this.bindEvent(tempDom, 'click', function (e) {
                              switch (item["FID"]) {
                                   case "LastWeek":
                                        options['Day'] = -7;
                                        break;
                                   case "LastMonth":
                                        options['Month'] = -1;
                                        break;
                                   case "LastHalfYear":
                                        options['Month'] = -6;
                                        break;
                              }
                              result = _this.changeTime(options);
                              var dateStr = _this.formatDate((result.year + "-" + result.month + "-" + result.day), _this.Data['curDate']);
                              item['callBack'].call(this, dateStr);
                              //为了兼容左边侧栏点击效果
                              _this.removeLinkStyle();
                              _this.calcDate(result.year + "-" + result.month+"-"+result.day,_this.Data['curDate']);
                              _this._setDay((result.year + "-" + result.month + "-" + result.day),'click-date');
                              _this._setDay(_this.Data['curDate'],'click-date');

                         });
                    }
               })
          }
          for (var i = 0, len = 2; i < len; i++) {
               i == 0 ? (this.leftWrapper = document.createElement('DIV')) : (this.rightWrapper = document.createElement('DIV'));
               i == 0 ? (this.leftWrapper.className = "kw-lt-leftwrap") : (this.rightWrapper.className = "kw-lt-rightwrap");
               i == 0 ? (this.initTitle(this.leftWrapper)) : (this.initTitle(this.rightWrapper));
               i == 0 ? (this.leftWrapper.appendChild(this._initWeekArr())) : (this.rightWrapper.appendChild(this._initWeekArr()));
               i == 0 ? (this.innerWraper.appendChild(this.leftWrapper)) : (this.innerWraper.appendChild(this.rightWrapper));
               i == 0 ? (this.initBody(this.leftWrapper)) : (this.initBody(this.rightWrapper));
          }
          this._setDay(this.Data['curDate'], 'today');
     }
     Widget.prototype.initTodayFormat = function () {
          return this.formatDate(this.Data['curDate'], this.Data['curDate']);
     }
     Widget.prototype.formatDate = function (fromDate, toDate) {
          var _this = this;
          var fromDateStr = utils.convertDateToStr(fromDate, 'yyyy.MM.dd');
          var toDateStr = utils.convertDateToStr(toDate, 'yyyy.MM.dd');
          return fromDateStr + " - " + toDateStr;
     }
     Widget.prototype.deformatDate = function (dateStr) {
          var dateArr = dateStr && dateStr.split('-');
          var dateStrArr = [];
          for (var i = 0, len = dateArr.length; i < len; i++) {
               var dateStr = dateArr[i].split('.');
               var year=dateStr[0],month=dateStr[1],day=dateStr[2];
               dateStrArr.push(year+'-'+month+'-'+day);
          }
          return dateStrArr;
     }
     Widget.prototype.preYear = function () {
          var _this = this;
          var leftWrapDate = new Date(this.leftWrapDate.year - 1, parseInt(this.leftWrapDate.month) - 1, this.leftWrapDate.day);
          var rightWrapDate = new Date(this.rightWrapDate.year - 1, parseInt(this.rightWrapDate.month) - 1, this.leftWrapDate.day);
          this.resetDate(leftWrapDate, rightWrapDate);
     }
     Widget.prototype.nextYear = function () {
          var _this = this;
          var leftWrapDate = new Date(parseInt(this.leftWrapDate.year) + 1, parseInt(this.leftWrapDate.month) - 1, this.leftWrapDate.day);
          var rightWrapDate = new Date(parseInt(this.rightWrapDate.year) + 1, parseInt(this.rightWrapDate.month) - 1, this.leftWrapDate.day);
          this.resetDate(leftWrapDate, rightWrapDate);
     }
     Widget.prototype.show = function () {
          this.showMask();
          if (this.outerWrapper) {
               this.outerWrapper.style['display'] = "block";
          }
     }
     Widget.prototype.hide = function () {
          this.hideMask();
          this.outerWrapper.style['display'] = "none";
     }
     Widget.prototype.preMonth = function () {
          var _this = this;
          var leftWrapDate = new Date(this.leftWrapDate.year, parseInt(this.leftWrapDate.month) - 2, this.leftWrapDate.day);
          var rightWrapDate = new Date(this.rightWrapDate.year, parseInt(this.rightWrapDate.month) - 2, this.leftWrapDate.day);
          this.resetDate(leftWrapDate, rightWrapDate);
     }
     Widget.prototype.nextMonth = function () {
          var _this = this;
          var leftWrapDate = new Date(this.leftWrapDate.year, parseInt(this.leftWrapDate.month), this.leftWrapDate.day);
          var rightWrapDate = new Date(this.rightWrapDate.year, parseInt(this.rightWrapDate.month), this.leftWrapDate.day);
          this.resetDate(leftWrapDate, rightWrapDate);
     }
     Widget.prototype.resetDate = function (leftWrapDate, rightWrapDate) {
          this.leftWrapDate = utils.getDateInfo(leftWrapDate);
          this.rightWrapDate = utils.getDateInfo(rightWrapDate);
          this.resetTitleDate();
     }
     Widget.prototype.resetTitleDate = function () {
          this.leftDate.innerText = utils.convertDateToStr(this.leftWrapDate.year + "-" + this.leftWrapDate.month + "-" + this.leftWrapDate.day, 'yyyy年MM月');
          this.rightDate.innerText = utils.convertDateToStr(this.rightWrapDate.year + "-" + this.rightWrapDate.month + "-" + this.rightWrapDate.day, 'yyyy年MM月');
          this.reDraw()
     }
     //重现填充日历的内容
     Widget.prototype.reDraw = function () {
          this.initBody(this.leftWrapper);
          this.initBody(this.rightWrapper);
          this._setDay(this.Data['curDate'], 'today');
     }
     //日历头部
     Widget.prototype.initTitle = function (obj) {
          var _this = this;
          if (!obj) return;
          var titleDom = document.createElement('DIV');
          titleDom.className = "kw-lt-title";
          var yearDom = document.createElement('SPAN');
          this.bindEvent(yearDom, 'click', function () {
               if (obj.className == 'kw-lt-leftwrap') {
                    _this.preYear.call(_this);
               } else {
                    _this.nextYear.call(_this);
               }
          })
          yearDom.setAttribute('id', obj.className == 'kw-lt-leftwrap' ? 'preYear' : 'nextYear');
          yearDom.style.cssText = (obj.className == 'kw-lt-leftwrap' ? ("position:absolute;left:16px;top:22px;") : ("position:absolute;right:16px;top:22px;"));
          var arrowOne = document.createElement('SPAN');
          arrowOne.className = (obj.className == 'kw-lt-leftwrap' ? 'kw-lt-premon kw-dtp-arrow-year kw-year-one' : 'kw-lt-nexmon  kw-dtp-arrow-year kw-year-three');
          var arrowTwo = document.createElement('SPAN');
          arrowTwo.className = (obj.className == 'kw-lt-leftwrap' ? 'kw-lt-premon kw-dtp-arrow-year kw-year-two' : 'kw-lt-nexmon  kw-dtp-arrow-year kw-year-four');
          yearDom.appendChild(arrowOne);
          yearDom.appendChild(arrowTwo);
          titleDom.appendChild(yearDom);
          var monthDom = document.createElement('SPAN');
          monthDom.className = (obj.className == 'kw-lt-leftwrap' ? 'kw-lt-premon  kw-dtp-lt-month' : 'kw-lt-nexmon kw-dtp-rg-month');
          this.bindEvent(monthDom, 'click', function (e) {
               if (obj.className == 'kw-lt-leftwrap') {
                    _this.preMonth.call(_this);
               } else {
                    _this.nextMonth.call(_this);
               }
          })
          titleDom.appendChild(monthDom);
          if (obj.className == 'kw-lt-leftwrap') {
               this.leftDate = document.createElement('SPAN');
               this.leftDate.className = "kw-lt-ld";
               var result = utils.convertDateToStr(this.Data['curDate'], 'yyyy年MM月');
               this.leftWrapDate = utils.getDateInfo(this.Data['curDate']);
               this.leftDate.innerText = result;
               titleDom.appendChild(this.leftDate);
          } else if (obj.className == 'kw-lt-rightwrap') {
               this.rightDate = document.createElement('SPAN');
               this.rightDate.className = "kw-lt-rd";
               var result = utils.convertDateToStr(utils.getNextMonth(this.Data['curDate']), 'yyyy年MM月');
               this.rightWrapDate = utils.getDateInfo(utils.getNextMonth(this.Data['curDate']), 'yyyy-MM-dd');
               this.rightDate.innerText = result;
               titleDom.appendChild(this.rightDate);
          }
          obj.appendChild(titleDom);
     }
     Widget.prototype.initBody = function (outerWraper) {
          var _this = this, className = outerWraper.className, dateData = null;;
          if (!this.leftBodyWrapper && outerWraper.className == 'kw-lt-leftwrap') {
               this.leftBodyWrapper = document.createElement('DIV');
               this.leftBodyWrapper.className = "kw-dtp-boyd";
               outerWraper.appendChild(this.leftBodyWrapper);
               dateData = this.drawCalendarBody(this.leftBodyWrapper, outerWraper.className);
          } else if (this.leftBodyWrapper && outerWraper.className == 'kw-lt-leftwrap') {
               dateData = this.drawCalendarBody(this.leftBodyWrapper, outerWraper.className);
          }
          if (!this.rightBodyWrapper && outerWraper.className == 'kw-lt-rightwrap') {
               this.rightBodyWrapper = document.createElement('DIV');
               this.rightBodyWrapper.className = "kw-dtp-boyd";
               outerWraper.appendChild(this.rightBodyWrapper);
               dateData = this.drawCalendarBody(this.rightBodyWrapper, outerWraper.className);
          } else if (this.rightBodyWrapper && outerWraper.className == 'kw-lt-rightwrap') {
               dateData = this.drawCalendarBody(this.rightBodyWrapper, outerWraper.className);
          }
          this._bindDayClick(className == 'kw-lt-leftwrap' ? this.leftBodyWrapper : this.rightBodyWrapper, className);
     }
     //绑定dayItem 的click事件
     Widget.prototype._bindDayClick = function (outerWraper, className) {
          var _this = this;
          if (!this.dayItemDomObj) {
               this.dayItemDomObj = {};
          }
          className == 'kw-lt-leftwrap' ? (this.dayItemDomObj['leftWrapper'] = {}) : (this.dayItemDomObj['rightWrapper'] = {});
          //
          for (var i = 1, len = this.CALENDER_COLUMN * this.CALENDER_ROWS; i <= len; i++) {
               var temp_id = (className == 'kw-lt-leftwrap' ? 'left-' : 'right-') + "day-" + i;
               var itemDom = document.getElementById(temp_id);
               if (itemDom) {
                    var dataDate = itemDom.getAttribute('data-date');
                    if (className == 'kw-lt-leftwrap') {
                         this.dayItemDomObj['leftWrapper'][dataDate] = itemDom;
                    } else if (className == 'kw-lt-rightwrap') {
                         this.dayItemDomObj['rightWrapper'][dataDate] = itemDom;
                    }
                    this.bindEvent(itemDom, 'mouseover', function (e) {
                         e.preventDefault();
                         e.stopPropagation();
                         var target = e.target, parentNode = target.parentNode,
                             month = parentNode && parentNode.getAttribute('data-month');
                         if (month != 'nextMonth' && month != 'preMonth' && parentNode.classList.contains('kw-lt-dayitem')) {
                              parentNode.classList.add('kw-lt-selected-date');
                         }
                         if (_this.lastClickDateObj && month != 'nextMonth') {
                              var lastDate = _this.lastClickDateObj.parentNode.getAttribute('data-date'),
                                  curDate = parentNode.getAttribute('data-date');
                              var result = _this.calcDate(lastDate, curDate);
                         }
                    })
                    this.bindEvent(itemDom, 'mouseout', function (e) {
                         e.preventDefault();
                         e.stopPropagation();
                         var target = e.target, parentNode = target.parentNode,
                             month = parentNode && parentNode.getAttribute('data-month');
                         if (parentNode.classList.contains('kw-lt-selected-date')) {
                              parentNode.classList.remove('kw-lt-selected-date');
                         }
                    })
               }
          }
          this.bindEvent(outerWraper, 'click', function (e) {
               var target = e.target, className = target && target.className;
               //第一次点击日期元
               if (!_this.lastClickDateObj) {
                    _this.removeLinkStyle();
                    if (className == 'curMonth') {
                         _this.lastClickDateObj = target;
                    } else if (className == 'preMonth') {
                         _this.lastClickDateObj = target;
                    } else {
                         //超出今天日期不做处理
                    }
                    _this.lastClickDateObj && _this.lastClickDateObj.classList.add('click-date');
               } else {
                    //第二次点击 被点击的日期元className变化，与第一次点击的日期中间日期的视觉变化
                    var lastClassName = _this.lastClickDateObj.className, lastText = _this.lastClickDateObj.innerText;
                    target.classList.add('click-date');
                    var lastDate = _this.lastClickDateObj.parentNode.getAttribute('data-date'),
                        curDate = target.parentNode.getAttribute('data-date')
                    var result = _this.getResultDate(lastDate, curDate);
                    if (_this.get('doubleItemClick')) {
                         _this.get('doubleItemClick').call(_this, result);
                    }
                    _this.lastClickDateObj = null;
                    _this.hide();

               }

          })
     }
     Widget.prototype.getResultDate = function (lastDate, curDate) {
          var _this = this;
          var lastDateInfo = utils.getDateInfo(lastDate),
              curDateInfo = utils.getDateInfo(curDate);
          var times = curDateInfo.timestamp - lastDateInfo.timestamp;
          var days = parseInt(times / (1000 * 60 * 60 * 24));
          if (days > 0) {
               return this.formatDate(lastDate, curDate);
          } else {
               return this.formatDate(curDate, lastDate);
          }
     }
     Widget.prototype.removeClass = function (dateStr, removeClass) {
          var dateStr = dateStr.replace(/(^\s+)|(\s+$)/g, "");
          var ltd = this.dayItemDomObj['leftWrapper'][dateStr],
              rtd = this.dayItemDomObj['rightWrapper'][dateStr],
              dayDom;
          if (ltd && rtd) {
               if (ltd.getAttribute('data-month') == 'curMonth') {
                    dayDom = ltd;
               } else if (rtd.getAttribute('data-month') == 'curMonth') {
                    dayDom = rtd;
               } else {
                    dayDom = null;
               }
          } else {
               dayDom = (ltd == null ? rtd : ltd);
               if (dayDom && dayDom.getAttribute('data-month') != 'curMonth') {
                    dayDom = null;
               }
          }
          if (dayDom) {
               dayDom.classList.remove(removeClass);
               dayDom.childNodes[0].classList.remove(removeClass);
          }
     }
     //删除关联日期的样式
     Widget.prototype.removeLinkStyle=function(){
          var _this=this;
          //如果页面有残留的点击痕迹，先清除
          if (_this.linkDateArr && _this.linkDateArr.length > 0) {
               _this.linkDateArr.forEach(function (item, index, array) {
                    _this._setDay(item, "");
               })
               var dateStrArr = _this.deformatDate(_this.get('selectedDate'));
               dateStrArr.forEach(function (item,index,array) {
                    _this.removeClass(item,'click-date');
               })
          }
     }
     //计算两次点击中间的日期元，改变状态
     Widget.prototype.calcDate = function (lastDate, curDate) {
          var _this = this;
          var lastDateInfo = utils.getDateInfo(lastDate),
              curDateInfo = utils.getDateInfo(curDate);
          var times = curDateInfo.timestamp - lastDateInfo.timestamp;
          var days = parseInt(times / (1000 * 60 * 60 * 24));
          var dir = (days > 0 ? -1 : 1);
          var changeDate = null, changeDateInfo = null;
          if (!this.linkDateArr) {
               this.linkDateArr = [];
          }
          if (this.linkDateArr.length > 0) {
               this.linkDateArr.forEach(function (item, index, array) {
                    _this._setDay(item, "");
               })
          } else {
               this.linkDateArr = [];
          }
          for (var i = 1; i < Math.abs(days) ; i++) {
               changeDate = new Date(parseInt(curDateInfo.year), parseInt(curDateInfo.month) - 1, curDateInfo.day + (dir * i)),
                   changeDateInfo = utils.getDateInfo(changeDate);
               var dateStr = changeDateInfo && (changeDateInfo.year + "-" + changeDateInfo.month + '-' + changeDateInfo.day);
               this._setDay(dateStr, 'linkDay');
               this.linkDateArr.push(dateStr);
          }
          if (days > 0) {
               return this.formatDate(lastDate, curDate);
          } else {
               return this.formatDate(curDate, lastDate);
          }
     }
     //设置 日期单元格的样式
     Widget.prototype._setDay = function (dateStr, className) {
          var ltd = this.dayItemDomObj['leftWrapper'][dateStr],
              rtd = this.dayItemDomObj['rightWrapper'][dateStr],
              dayDom;
          if (ltd && rtd) {
               if (ltd.getAttribute('data-month') == 'curMonth') {
                    dayDom = ltd;
               } else if (rtd.getAttribute('data-month') == 'curMonth') {
                    dayDom = rtd;
               } else {
                    dayDom = null;
               }
          } else {
               dayDom = (ltd == null ? rtd : ltd);
               if (dayDom && dayDom.getAttribute('data-month') != 'curMonth') {
                    dayDom = null;
               }
          }
          if (className == 'today') {
               dayDom && (dayDom.innerHTML = '<span class="curMonth">今天</span>');
               dayDom && dayDom.classList.add(className);
          } else if (className == 'linkDay') {
               dayDom && (dayDom.classList.add(className))
          }else if(className=='click-date'){
               dayDom && (dayDom.childNodes[0].classList.add(className));
          } else {
               dayDom && (dayDom.classList.remove('linkDay'))
          }
     }
     Widget.prototype.removeChildrens = function (parentNodes) {
          while (parentNodes.childNodes.length > 0) {
               var child = parentNodes.childNodes[0];
               parentNodes.removeChild(child);
          }
     }
     Widget.prototype.drawCalendarBody = function (bodyWrapper, className) {
          this.removeChildrens(bodyWrapper);
          var datesData = null;
          if (className == 'kw-lt-leftwrap') {
               datesData = this._calcMonthDay(this.leftWrapDate.year, this.leftWrapDate.month);
          } else {
               datesData = this._calcMonthDay(this.rightWrapDate.year, this.rightWrapDate.month);
          }
          var date = datesData['date'];
          var columnNum = 7;
          var rowCount = date.length / columnNum;
          for (var i = 0, len = rowCount; i < len; i++) {
               var eachRowDate = date.slice((i * columnNum), (i + 1) * columnNum);
               bodyWrapper.appendChild(this.drawRow(eachRowDate, i, datesData['year'], datesData['month'], className));
          }
          return datesData;
     }
     Widget.prototype._calcMonthDay = function (year, month) {
          var curMonthDays = this._getDate(year, month, 0);
          var preMonthDays = this._getDays(year, parseInt(month) - 1, 1);
          var nextMonthDays = 42 - curMonthDays - preMonthDays;
          var preMonthDates = this._getPreMonthDates(year, parseInt(month) - 1, preMonthDays),
              datesArr = [], k = 1, j = 1;
          for (var i = 0, len = (curMonthDays + nextMonthDays) ; i < len; i++) {
               if (i < curMonthDays) {
                    datesArr.push(k++);
               } else {
                    datesArr.push(j++);
               }
          }
          this.datesData = {
               date: preMonthDates.concat(datesArr),
               nextMonthDays: nextMonthDays,
               curMonthDays: curMonthDays,
               preMonthDays: preMonthDays,
               year: year,
               month: month
          }
          return this.datesData;
     }
     //获取一个月的天数
     Widget.prototype._getDate = function (year, month, day) {
          var dates = new Date(year, month, day).getDate();
          return dates;
     }
     //获取
     Widget.prototype._getDays = function (year, month, day) {
          var days = new Date(year, month, day).getDay();
          return days
     }
     Widget.prototype._getPreMonthDates = function (year, month, preMonthDays) {
          var lastMonthDateArr = [],
              lastMonthDays = this._getDate(year, month, 0);
          if (!preMonthDays || preMonthDays === 0) return lastMonthDateArr;
          while (preMonthDays) {
               lastMonthDateArr.unshift(lastMonthDays--);
               preMonthDays--;
          }
          return lastMonthDateArr;
     }
     //比较时间与今天的日期做对比来显示相应样式
     Widget.prototype.comparentTime = function (year, month, day) {
          if (!this.todayInfo) {
               this.todayInfo = utils.getDateInfo(this.Data['curDate']);
          }
          if (this.todayInfo.year < year || (this.todayInfo.year == year && this.todayInfo.month < month) || (this.todayInfo.year == year && this.todayInfo.month == month && this.todayInfo.day < day)) {
               return "nextMonth";
          }
          return "";
     }
     Widget.prototype.drawRow = function (rowDate, rowNum, year, month, wrapClassName) {
          var rowStr = "<div class='kw-lt-rows' id='" + rowNum + "'>";
          for (var i = 0, len = rowDate.length; i < len; i++) {
               var date = rowDate[i], className = "preMonth", detialDate = '';
               if (rowNum <= 1) {
                    if (date >= 1 && date <= (7 * 2 - this.datesData['preMonthDays'])) {
                         var result = this.comparentTime(year, month, date);
                         if (!result) {
                              className = "curMonth";
                         } else {
                              className = result;
                         }
                         detialDate = year + '-' + month + '-' + date;
                    } else {
                         var result = this.comparentTime(year, month - 1, date);
                         if (!result) {
                              className = "preMonth";
                         } else {
                              className = result;
                         }
                         detialDate = year + '-' + (month - 1) + '-' + date;
                    }
               } else if (rowNum >= 4) {
                    if (date >= 1 && date <= this.datesData['nextMonthDays']) {
                         className = "nextMonth";
                         detialDate = year + '-' + (parseInt(month) + 1) + '-' + date;
                    } else {
                         var result = this.comparentTime(year, month, date);
                         if (!result) {
                              className = "curMonth";
                         } else {
                              className = result;
                         }
                         detialDate = year + '-' + month + '-' + date;
                    }
               } else {
                    var result = this.comparentTime(year, month, date);
                    if (!result) {
                         className = "curMonth";
                    } else {
                         className = result;
                    }
                    detialDate = year + '-' + month + '-' + date;
               }
               var id = ((wrapClassName == 'kw-lt-rightwrap' ? 'right-day-' : 'left-day-') + (rowNum * 7 + i + 1))
               rowStr += "<span id='" + id + "' data-date=" + detialDate + " data-month='" + className + "' class='kw-lt-dayitem " + className + "'><span class='" + className + "'>" + date + "</span></span>";
          }
          rowStr += "</div>";
          return this.transformStrToDom(rowStr);
     }
     //星期头
     Widget.prototype._initWeekArr = function () {
          var weekArr = utils.weekArr;
          if (weekArr) {
               var domStr = "<div class='kw-dtp-weekwrapper'>";
               for (var i = 0, len = weekArr.length; i < len; i++) {
                    domStr += "<span class='kw-lt-weekitem'>" + weekArr[i] + "</span>"
               }
               domStr += "</div>";
          }
          return this.transformStrToDom(domStr);
     }
     Widget.prototype.changeTime = function (options) {
          var changeYear = options.Year, changeMonth = options.Month, changeDay = options.Day;
          var today = this.Data['curDate'],
              todayDateInfo = utils.getDateInfo(today),
              changeDate = new Date(parseInt(todayDateInfo.year) + changeYear, parseInt(todayDateInfo.month) - 1 + changeMonth, todayDateInfo.day + changeDay),
              changeDateInfo = utils.getDateInfo(changeDate);
          return changeDateInfo;
     }
     Widget.prototype.show = function () {
          var _this = this;
          this.showMask();
          if (this.outerWrapper) {
               this.outerWrapper.style['display'] = "block";
          }
          this._setDay(_this.Data['curDate'], 'today');
     }
     Widget.prototype.hide = function () {
          this.hideMask();
          this.outerWrapper.style['display'] = "none";
     }
     return Widget;
})
