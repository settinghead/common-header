(function (angular) {

  "use strict";
  angular.module("risevision.common.account", [
  "risevision.common.gapi", "risevision.common.oauth2",
  "risevision.common.company",
  "risevision.common.cache"])

  .factory("createAccount", ["$q", "$log",
  "createCompany", "addAccount", "updateProfile",
  "getUserCompanies",
  function ($q, $log, createCompany, addAccount, updateProfile,
    getUserCompanies) {
    return function (basicProfile) {
      $log.debug("createAccount called.");
      var deferred = $q.defer();
      if(basicProfile.accepted) {
        var promises = [
          addAccount(),
          updateProfile(basicProfile),
          getUserCompanies().then(function (resp) {
            if(resp.result && (!resp.items || resp.items === 0)) {
              return createCompany()
                .then(function (resp){
                  //update company ID
                  return updateProfile({companyId: resp.item.id});
                });
            }
            else {
              var deferred = $q.defer();
              deferred.resolve(resp);
              return deferred.promise;
            }
          })];
        $q.all(promises).then(function (resps) {
            $log.debug("createAccount resps", resps);
            if(resps[2].result === true) {
              deferred.resolve();
            }
            else {
              deferred.reject("createAccount");
            }
          }, deferred.reject);
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
      $log.debug("createAccount called.");
      var deferred = $q.defer();
      coreAPILoader().then(function (coreApi) {
        var request = coreApi.account.add();
        request.execute(function (resp) {
            $log.debug("createAccount resp", resp);
            if(resp.result === true) {
              deferred.resolve();
            }
            else {
              deferred.reject("createAccount");
            }
        });
      });
      return deferred.promise;
    };
  }]);

})(angular);
