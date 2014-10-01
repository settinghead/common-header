(function (angular) {

  "use strict";
  angular.module("risevision.common.account", [
  "risevision.common.gapi", "risevision.common.oauth2",
  "risevision.common.company",
  "risevision.common.cache"])

  .factory("agreeToTerms", ["$q", "riseAPILoader", "$log", "userInfoCache",
  function ($q, riseAPILoader, $log, userInfoCache) {
    return function () {
      $log.debug("agreeToTerms called.");
      var deferred = $q.defer();
      riseAPILoader().then(function (coreApi) {
        var request = coreApi.account.agreeToTerms();
        request.execute(function (resp) {
          $log.debug("agreeToTerms resp", resp);
          userInfoCache.removeAll();
          if(!resp.error) {
            deferred.resolve();
          }
          else {
            deferred.reject(resp.error);
          }
        });
      });
      return deferred.promise;
    };
  }])

  .factory("registerAccount", ["$q", "$log",
  "createCompany", "addAccount", "updateUser", "agreeToTerms",
  function ($q, $log, createCompany, addAccount, updateUser,
    agreeToTerms) {
    return function (username, basicProfile) {
      $log.debug("registerAccount called.", username, basicProfile);
      var deferred = $q.defer();
      addAccount().then().finally(function () {
        agreeToTerms().then().finally(function () {
          updateUser(username, basicProfile).then(function (resp) {
            if(resp.result) { deferred.resolve(); }
            else { deferred.reject(); }
          }, deferred.reject).finally("registerAccount ended");
        });
      });
      return deferred.promise;
    };
  }])

  .factory("addAccount", ["$q", "riseAPILoader", "$log",
  function ($q, riseAPILoader, $log) {
    return function () {
      $log.debug("addAccount called.");
      var deferred = $q.defer();
      riseAPILoader().then(function (coreApi) {
        var request = coreApi.account.add();
        request.execute(function (resp) {
            $log.debug("addAccount resp", resp);
            if(resp.result) {
              deferred.resolve();
            }
            else {
              deferred.reject("addAccount");
            }
        });
      });
      return deferred.promise;
    };
  }]);

})(angular);
