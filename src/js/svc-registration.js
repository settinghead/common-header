(function (angular) {
  "use strict";

  angular.module("risevision.common.registration", [])

  .value("userStatusDependencies", {
    "termsConditionsAccepted" : "signedInWithGoogle",
    "profileCreated": "termsConditionsAccepted",
    "companyCreated": "profileCreated",
    "registrationComplete": "companyCreated"
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
            if(resp.result === true && resp.item.termsAcceptanceDate) {
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

  .factory("acceptTermsAndConditions", ["updateProfile", function (updateProfile) {
    return function () {
      return updateProfile({
        termsAcceptanceDate: (new Date()).toISOString()
      });
    };
  }])

  .factory("profileCreated", ["$q", "coreAPILoader", "$log",
  function ($q, coreAPILoader, $log) {
    return function () {
      var deferred = $q.defer();
      coreAPILoader.get().then(function (coreApi) {
        //TODO
        var request = coreApi.user.get({});
        request.execute(function (resp) {
            $log.debug("profileCreated core.user.get() resp", resp);
            if(resp.result === true && resp.item.email) {
              deferred.resolve(resp);
            }
            else {
              deferred.reject("profileCreated");
            }
        });
      });
      return deferred.promise;
    };
  }])

  .factory("updateProfile", ["$q", "coreAPILoader", "$log",
  function ($q, coreAPILoader, $log) {
    return function (profile) {
      var deferred = $q.defer();
      coreAPILoader.get().then(function (coreApi) {
        //TODO: consult Alxey
        var request = coreApi.user.update(profile);
        request.execute(function (resp) {
            $log.debug("updateProfile resp", resp);
            if(resp.result === true) {
              deferred.resolve(resp);
            }
            else {
              deferred.reject("updateProfile");
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
