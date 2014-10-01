(function (angular) {
  "use strict";

  angular.module("risevision.common.registration",
  ["risevision.common.userstate", "risevision.common.ui-status",
  "risevision.common.userprofile", "risevision.common.gapi"])

  .config(["uiStatusDependencies", function (uiStatusDependencies) {
    uiStatusDependencies.addDependencies({
      "registerdAsRiseVisionUser" : "signedInWithGoogle",
      "registrationComplete": ["notLoggedIn", "registerdAsRiseVisionUser"]
    });
  }])

  .factory("registrationComplete", ["$q", function ($q) {
    return function () {
      var deferred = $q.defer();
      deferred.resolve(true);
      return deferred.promise;
    };
  }])

  .factory("signedInWithGoogle", ["$q", "getOAuthUserInfo", "userState",
  function ($q, getOAuthUserInfo, userState) {
    return function () {
      var deferred = $q.defer();
      // userState.authenticate(false).then().finally(function () {
        if(userState.isLoggedIn()){
          deferred.resolve();
        }
        else {
          deferred.reject("signedInWithGoogle");
        }
      // });
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

  .factory("registerdAsRiseVisionUser", ["$q", "getUserProfile", "cookieStore", "$log", "userState",
  function ($q, getUserProfile, cookieStore, $log, userState) {
    return function () {
      var deferred = $q.defer();

      getUserProfile(userState.getUsername()).then(function (profile) {
        if(angular.isDefined(profile.email) &&
          angular.isDefined(profile.mailSyncEnabled)) {
          deferred.resolve(profile);
        }
        else if (cookieStore.get("surpressRegistration")){
          deferred.resolve({});
        }
        else {
          deferred.reject("registerdAsRiseVisionUser");
        }
      }, function (err) {
        if (cookieStore.get("surpressRegistration")){
          deferred.resolve({});
        }
        else {
          $log.debug("registerdAsRiseVisionUser rejected", err);
          deferred.reject("registerdAsRiseVisionUser");
        }
      });

      return deferred.promise;
    };
  }]);

})(angular);
