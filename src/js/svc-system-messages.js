(function (angular) {

  "use strict";

  angular.module("risevision.common.systemmessages",
  ["risevision.common.gapi"])
    .factory("getSystemMessages", ["gapiLoader", "$q", "$log",
    function (gapiLoader, $q, $log) {
      return function (companyId) {
        var deferred = $q.defer();
        gapiLoader().then(function (gApi) {
          var request = gApi.client.core.systemmessages.list(
            { "companyId": companyId });
          request.execute(function (resp) {
            $log.debug("getSystemMessage resp", resp.items);
            deferred.resolve(resp.items);
          });
        });
        return deferred.promise;
      };
  }]);

})(angular);
