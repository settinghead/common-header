(function (angular) {
  "use strict";
  angular.module("risevision.common.util", [])

  .value("humanReadableError", function (resp) {
    var message;
    if (resp.message) {message = resp.message; }
    else if(resp.error) {
      if(resp.error.message) {message = resp.message; }
      else {message = resp.error; }
    }
    else {message = resp; }
    return JSON.stringify(message);
  })

  .value("BaseList", function (maxCount) {
      this.list = [];
      this.maxCount = maxCount ? maxCount : 20;
      this.cursor = null;
      this.endOfList = false;
      this.searchString = "";
      this.clear = function () {
          this.list = [];
          this.cursor = null;
          this.endOfList = false;
      };
      this.append = function (items) {
          for (var i = 0; i < items.length; i++) {
              this.list.push(items[i]);
          }
      };
      this.concat = function (items) {
          this.list = this.list.concat(items);
      };
      this.add = function (items, cursor) {
          this.cursor = cursor;
          this.endOfList = items.length < maxCount;
          this.concat(items);
      };
      this.remove = function (index) {
          this.list.splice(index, 1);
      };
  })

  .factory("dateIsInRange", [ function () {
/**
 * check if date is in range
 * @param {Date} date
 * @param {String} strStartDate
 * @return {String} strEndDate
 */
    return function (date, strStartDate, strEndDate) {
// strStartDate, strEndDate can either be empty string or date in ISO 8601 format "2014-05-14T00:00:00.000Z"
// empty means no there is no specific start or/and end date is set

// When parsing time, we don't want to convert Universal time to the current TimeZone
// example new Date(Date.parse("2014-05-14T00:00:00.000")); returns "Tue May 13 2014 20:00:00 GMT-0400 (EDT)"
// what we want is to pretennd that date already comes adjusted to the current TimeZone
// example "2014-05-14T00:00:00.000" show be converted to "Tue May 14 2014 00:00:00 GMT-0400 (EDT)"

      var res = true;
      var re, dt;

      try {
          if (strStartDate) {
              re = strStartDate.match(/(\d{4})\-(\d{2})\-(\d{2})/);
              dt = new Date(re[1], parseInt(re[2]) - 1, re[3], 0, 0, 0, 0);
              res = (date >= dt);
          }

          if (res && strEndDate) {
              re = strEndDate.match(/(\d{4})\-(\d{2})\-(\d{2})/);
              dt = new Date(re[1], parseInt(re[2]) - 1, re[3], 0, 0, 0, 0);
              res = (date <= dt);
          }

      } catch (e) {
          res = false;
      }

      return res;

    };

  }]);
})(angular);
