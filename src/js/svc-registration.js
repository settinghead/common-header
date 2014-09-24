(function (angular) {
  "use strict";

  angular.module("risevision.common.registration",
  ["risevision.common.userprofile"])

  .value("userStatusDependencies", {
    "basicProfileCreated" : "signedInWithGoogle",
    "acceptableState": ["notLoggedIn", "basicProfileCreated"]
  })

  .factory("checkUserStatus", [
    "userStatusDependencies", "$injector", "$q", "$log", "userState",
    function (userStatusDependencies, $injector, $q, $log, userState) {

      var attemptStatus = function(status){
        var lastD;
        $log.debug("Attempting to reach status", status, "...");
        var dependencies = userStatusDependencies[status];

        if(dependencies) {
          if(!(dependencies instanceof Array)) {
            dependencies = [dependencies];
          }

          var prevD = $q.defer(), firstD = prevD;

          angular.forEach(dependencies, function(dep) {
            var currentD = $q.defer();
            prevD.promise.then(currentD.resolve, function () {
              attemptStatus(dep).then(function (){
                //should go here if any of the dependencies is satisfied
                if(userStatusDependencies[dep]) {
                  $log.debug("Deps for status", dep, "satisfied.");
                }
                $injector.get(status)().then(
                  function () {
                    $log.debug("Status", status, "satisfied.");
                    currentD.resolve(true);
                  },
                  function () {
                    $log.debug("Status", status, "not satisfied.");
                    currentD.reject(dep);
                  }
                ).finally(currentD.resolve);
              }, function () {
                $log.debug("Failed to reach status", dep, ".");
                currentD.reject(dep);
              });
            });
            lastD = prevD = currentD;
          });

          //commence the avalance
          firstD.reject();
        }
        else {
          //terminal
          lastD = $q.defer();
          $injector.get(status)().then(
            function () {
              $log.debug("Terminal status", status, "satisfied.");
              lastD.resolve(true);
            },
            function () {
              $log.debug("Terminal status", status, "not satisfied.");
              lastD.reject(status);
            }
          );
        }

        return lastD.promise;
      };

      return function (desiredStatus) {
        if(!desiredStatus) {desiredStatus = "acceptableState"; }
        return attemptStatus(desiredStatus).then(
          function () {
            userState.status = desiredStatus;
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

  .factory("signedInWithGoogle", ["$q", "getOAuthUserInfo",
  function ($q, getOAuthUserInfo) {
    return function () {
      var deferred = $q.defer();
      getOAuthUserInfo().then(
        function () {
          deferred.resolve();
          },
        function () {
          deferred.reject("signedInWithGoogle");
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

  .factory("basicProfileCreated", ["$q", "getUser", "cookieStore", "$log",
  function ($q, getUser, cookieStore, $log) {
    return function () {
      var deferred = $q.defer();

      getUser().then(function (profile) {
        if(angular.isDefined(profile.email) &&
          angular.isDefined(profile.mailSyncEnabled)) {
          deferred.resolve(profile);
        }
        else if (cookieStore.get("surpressRegistration")){
          deferred.resolve({});
        }
        else {
          deferred.reject("basicProfileCreated");
        }
      }, function (err) {
        if (cookieStore.get("surpressRegistration")){
          deferred.resolve({});
        }
        else {
          $log.debug("basicProfileCreated rejected", err);
          deferred.reject("basicProfileCreated");
        }
      });

      return deferred.promise;
    };
  }])

  .factory("companyCreated", ["$q", "coreAPILoader", "$log",
  function ($q, coreAPILoader, $log) {
    return function () {
      var deferred = $q.defer();
      coreAPILoader().then(function (coreApi) {
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

  .factory("profileLoaded", ["$q", "getUser", function ($q, getUser) {
    return function () {
      var deferred = $q.defer();
      getUser().then(deferred.resolve, function (){
        deferred.reject("profileLoaded");
      });
      return deferred.promise;
    };
  }]);

})(angular);
