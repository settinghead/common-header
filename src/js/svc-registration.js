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

      var attemptStatus = function(status){
        var deferred = $q.defer();
        var dependency = userStatusDependencies[status];
        if(dependency) {
          achieveStatus(dependency).then(function (){
            $injector.get(status)().then(
              deferred.resolve,
              deferred.reject
            );
          }, deferred.reject);
        }
        else {
          //terminal
          $injector.get(status)().then(
            deferred.resolve,
            deferred.reject
          );
        }
        return deferred.promise;
      };

      return function (userState) {
        return attemptStatus("registrationComplete",
          function () {},
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

  .factory("termsConditionsAccepted", ["$q", function ($q) {
    return function (userState) {
      coreAPILoader.get().then(function (coreApi) {
        var request = coreApi.user.get({});
        request.execute(function (resp) {
            $log.debug("core.user.get() resp", resp);
            if(resp.result === true && resp.termsAcceptanceDate) {
              deferred.resolve(resp);
            }
            else {
              deferred.reject(resp);
            }
        });
      });
      return deferred.promise;
    };
  }])

  .factory("profileCreated", ["$q", "coreAPILoader", function ($q, coreAPILoader) {
    return function () {
      var deferred = $q.defer();
      coreAPILoader.get().then(function (coreApi) {
        //TODO
        var request = coreApi.user.get({});
        request.execute(function (resp) {
            $log.debug("core.user.get() resp", resp);
            if(resp.result === true && resp.email) {
              deferred.resolve(resp);
            }
            else {
              deferred.reject(resp);
            }
        });
      });
      return deferred.promise;
    };
  }])

  .factory("updateProfile", ["$q", "coreAPILoader", function ($q, coreAPILoader) {
    return function () {
      var deferred = $q.defer();
      coreAPILoader.get().then(function (coreApi) {
        //TODO: consult Alxey
        var request = coreApi.user.updateProfile(profile);
        request.execute(function (resp) {
            $log.debug("updateProfile resp", resp);
            if(resp.result === true) {
              deferred.resolve(resp);
            }
            else {
              deferred.reject(resp);
            }
        });
      });
      return deferred.promise;
    };
  }])

  .factory("signedInWithGoogle", ["$q", "coreAPILoader", function ($q, coreAPILoader) {
    return function (userState) {
      coreAPILoader.get().then(function (coreApi) {
        var request = coreApi.user.get();
        request.execute(function (resp) {
            $log.debug("updateProfile resp", resp);
            if(resp.result === true) {
              deferred.resolve(resp);
            }
            else {
              deferred.reject(resp);
            }
        });
      });
      return deferred.promise;
    };
  }])

  .factory("companyCreated", ["$q", function ($q) {
    return function (userState) {
      coreAPILoader.get().then(function (coreApi) {
        var request = coreApi.company.get();
        request.execute(function (resp) {
            $log.debug("core.company.get() resp", resp);
            if(resp.result === true) {
              deferred.resolve(resp);
            }
            else {
              deferred.reject(resp);
            }
        });
      });
      return deferred.promise;
    };
  }]);

})(angular);
