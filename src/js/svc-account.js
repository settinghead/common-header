(function (angular) {

  "use strict";
  angular.module("risevision.common.account", [
  "risevision.common.gapi", "risevision.common.oauth2",
  "risevision.common.company",
  "risevision.common.cache"])

  .factory("agreeToTerms", ["$q", "coreAPILoader", "$log", "userInfoCache",
  function ($q, coreAPILoader, $log, userInfoCache) {
    return function () {
      $log.debug("agreeToTerms called.");
      var deferred = $q.defer();
      coreAPILoader().then(function (coreApi) {
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
    return function (basicProfile) {
      $log.debug("registerAccount called.");
      var deferred = $q.defer();
      if(basicProfile.accepted) {
        var promises = [addAccount(), agreeToTerms(), updateUser(basicProfile)];
        $q.all(promises).then(function (resps) {
          $log.debug("registerAccount resps", resps);
          if(resps[2].result === true) {
            deferred.resolve();
          }
          else {
            deferred.reject(resps);
          }
        });

      }
      else {
        deferred.reject("You need to accept terms and conditions first in order to register for an account.");
      }
      return deferred.promise;
    };
  }])

  .factory("addAccount", ["$q", "coreAPILoader", "$log",
  function ($q, coreAPILoader, $log) {
    return function () {
      $log.debug("registerAccount called.");
      var deferred = $q.defer();
      coreAPILoader().then(function (coreApi) {
        var request = coreApi.account.add();
        request.execute(function (resp) {
            $log.debug("addAccount resp", resp);
            if(resp.result === true) {
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
