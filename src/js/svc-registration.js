(function (angular) {
  "use strict";

  angular.module("risevision.common.registration",
  ["risevision.common.profile"])

  .value("userStatusDependencies", {
    "termsConditionsAccepted" : "signedInWithGoogle",
    "acceptableState": ["termsConditionsAccepted", "notLoggedIn"]
  })

  .factory("checkUserStatus", [
    "userStatusDependencies", "$injector", "$q", "$log", "userState",
    function (userStatusDependencies, $injector, $q, $log, userState) {

      var attemptStatus = function(status){
        $log.debug("Attempting to reach status", status, "...");
        var deferred = $q.defer();
        var dependencies = userStatusDependencies[status];

        if(dependencies) {
          if(!(dependencies instanceof Array)) {
            dependencies = [dependencies];
          }
          var rejP = [];
          var rejD = {};

          angular.forEach(dependencies, function(dep) {
            rejP.push((rejD[dep] = $q.defer()).promise);
          });

          angular.forEach(dependencies, function(dep) {
            attemptStatus(dep).then(function (){
              //should go here if any of the dependencies is satisfied
              $log.debug("Deps for status", dep, "satisfied.");
              $injector.get(status)().then(
                function () {
                  $log.debug("Status", status, "satisfied.");
                  deferred.resolve(true);
                  angular.forEach(dependencies, function(dep) {
                    rejD[dep].reject();
                  });
                },
                function () {
                  $log.debug("Status", status, "not satisfied.");
                  rejD[dep].resolve(status);
                }
              );
            }, function (s) {
              $log.debug("Failed to reach status", dep, ".");
              rejD[dep].resolve(s);
            });
          });

          $q.all(rejP).then( //when all dependencies are rejected
             //reject if none of the dependencies is satisfied
             function(rejectedStatus) {
               $log.debug("All deps for status", status, "have been rejected.", rejectedStatus);
               deferred.reject(rejectedStatus[0]);
             }
          );
        }
        else {
          //terminal
          $injector.get(status)().then(
            function () {
              $log.debug("Status", status, "satisfied.");
              deferred.resolve(true);
            },
            function () {
              $log.debug("Status", status, "not satisfied.");
              deferred.reject(status);
            }
          );
        }
        return deferred.promise;
      };

      return function (desiredStatus) {
        return attemptStatus(desiredStatus || "acceptableState").then(
          function () {
            userState.status = "OK";
          },
          function (status) {
            // if rejected at any given step,
            // show the dialog of that relevant step
            userState.status = status;
          });
      };
  }])

  .factory("acceptableState", ["$q", function ($q) {
    return function () {
      var deferred = $q.defer();
      deferred.resolve(true);
      return deferred.promise;
    };
  }])


  .factory("signedInWithGoogle", ["$q", "getOAuthUserInfo", "$log", "userState",
  function ($q, getOAuthUserInfo, $log, userState) {
    return function () {
      var deferred = $q.defer();
      getOAuthUserInfo().then(
        function () {
          deferred.resolve();
          userState.authStatus = 1;
          },
        function () {
          deferred.reject("signedInWithGoogle");
          userState.authStatus = 0;
          });
      return deferred.promise;
    };
  }])

  .factory("notLoggedIn", ["$q", "$log", "signedInWithGoogle",
  function ($q, $log, signedInWithGoogle) {
    return function () {
      var deferred = $q.defer();
      signedInWithGoogle().then(function () {
        deferred.reject("notLoggedIn");
      }, deferred.resolve);
      return deferred.promise;
    };
  }])

  .factory("termsConditionsAccepted", ["$q", "coreAPILoader", "$log", "getProfile",
   function ($q, coreAPILoader, $log, getProfile) {
    return function () {
      var deferred = $q.defer();

      getProfile().then(function (profile) {
        if(
          profile.termsAcceptanceDate &&
          profile.email) {
            deferred.resolve();
          }
        else {deferred.reject("termsConditionsAccepted");}
      }, function () {
        deferred.reject("termsConditionsAccepted");
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
  }])

  .factory("profileLoaded", ["$q", "getProfile", function ($q, getProfile) {
    return function () {
      var deferred = $q.defer();
      getProfile().then(deferred.resolve, function (){
        deferred.reject("profileLoaded");
      });
      return deferred.promise;
    };
  }]);

})(angular);
