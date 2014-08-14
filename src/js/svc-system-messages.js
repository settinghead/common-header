(function (angular) {

  "use strict";
  /*global gapi: false */

  angular.module("risevision.common.systemmessages",
  ["risevision.common.gapi"])
    .service("systemMessages", ["gapiLoader", "$q", "$log", "$interval",
    function (gapiLoader, $q, $log, $interval) {
      var self = this;

      this.getSystemMessages = function (companyId) {
          var deferred = $q.defer();
          gapiLoader.get(function (gApi) {
            var request = gApi.client.store.statusmessages.get({ "companyId": companyId });
            request.execute(function (resp) {
                $log.debug("getSystemMessage resp", resp.items);
                deferred.resolve(resp.items);
            });
          });
          return deferred.promise;
      };
  }]);

})(angular);
