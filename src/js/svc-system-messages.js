(function (angular) {

  "use strict";

  angular.module("risevision.common.systemmessages",
  ["risevision.common.gapi"])
    .service("systemMessages", ["gapiLoader", "$q", "$log",
    function (gapiLoader, $q, $log) {

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
