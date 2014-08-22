(function (angular) {
  "use strict";

  angular.module("risevision.common.registration", ["risevision.common.profile"])

  .value("userStatusDependencies", {
    "termsConditionsAccepted" : "signedInWithGoogle",
    "registrationComplete": "termsConditionsAccepted"
  })

  .factory("checkUserStatus", [
    "userStatusDependencies", "$injector", "$q",
    function (userStatusDependencies, $injector, $q) {

      var attemptStatus = function(status, userState){
        var deferred = $q.defer();
        var dependency = userStatusDependencies[status];
        if(dependency) {
          attemptStatus(dependency, userState).then(function (){
            $injector.get(status)(userState).then(
              deferred.resolve,
              deferred.reject
            );
          }, deferred.reject);
        }
        else {
          //terminal
          $injector.get(status)(userState).then(
            deferred.resolve,
            deferred.reject
          );
        }
        return deferred.promise;
      };

      return function (userState) {
        return attemptStatus("registrationComplete", userState).then(
          function () {
            userState.status = "registrationComplete";
          },
          function (status) {
            // if rejected at any given step,
            // show the dialog of that relevant step
            userState.status = status;
          });
      };
  }])

  .factory("registrationComplete", ["$q", function ($q) {
    return function () {
      var deferred = $q.defer();
      deferred.resolve(true);
      return deferred.promise;
    };
  }])

  .factory("termsConditionsAccepted", ["$q", "coreAPILoader", "$log",
   function ($q, coreAPILoader, $log) {
    return function () {
      var deferred = $q.defer();
      coreAPILoader.get().then(function (coreApi) {
        var request = coreApi.user.get({});
        request.execute(function (resp) {
            $log.debug("termsConditionsAccepted core.user.get() resp", resp);
            if(resp.result === true
              && resp.item.termsAcceptanceDate
              && resp.item.email) {
              deferred.resolve(resp);
            }
            else {
              deferred.reject("termsConditionsAccepted");
            }
        });
      });
      return deferred.promise;
    };
  }])

  .factory("profileUpdated", ["$q", "coreAPILoader", "$log",
  function ($q, coreAPILoader, $log) {
    return function () {
      var deferred = $q.defer();
      coreAPILoader.get().then(function (coreApi) {
        //TODO
        var request = coreApi.user.get({});
        request.execute(function (resp) {
            $log.debug("profileUpdated core.user.get() resp", resp);
            if(resp.result === true && resp.item.firstName) {
              deferred.resolve(resp);
            }
            else {
              deferred.reject("profileUpdated");
            }
        });
      });
      return deferred.promise;
    };
  }])

  .factory("signedInWithGoogle", ["$q",
    function ($q) {
      return function (userState) {
        var deferred = $q.defer();
        if(userState.authStatus === 1) {
          deferred.resolve();
        }
        else{
          deferred.reject("signedInWithGoogle");
        }
        return deferred.promise;
      };
  }])

  .factory("companyCreated", ["$q", "coreAPILoader", "$log",
  function ($q, coreAPILoader, $log) {
    return function () {
      var deferred = $q.defer();
      coreAPILoader.get().then(function (coreApi) {
        var request = coreApi.user.get();
        request.execute(function (resp) {
            $log.debug("companyCreated core.user.get() resp", resp);
            if(resp.result === true && resp.item.companyId) {
              deferred.resolve(resp);
            }
            else {
              deferred.reject("companyCreated");
            }
        });
      });
      return deferred.promise;
    };
  }]);

})(angular);
