(function (angular) {
  "use strict";

  angular.module("risevision.common.popupdetector",
  [])

  .factory("popupTest", ["$q", "$window", "$timeout",
    function ($q, $window, $timeout) {
    return function () {
      var deferred = $q.defer();

      var popup = $window.open("","","width=50, height=50",true);
       $timeout( function() {
          if(!popup || popup.outerHeight === 0) {
            //First Checking Condition Works For IE & Firefox
            //Second Checking Condition Works For Chrome
            deferred.reject("<strong>Sign In Pop-Up Blocked</strong> - " +
              "Allow pop-ups from store.risevision.com in the browser settings and Sign In again.");
          } else {
            popup.close();
            deferred.resolve(true);
          }
      }, 25);

      return deferred.promise;
    };
  }]);

})(angular);
