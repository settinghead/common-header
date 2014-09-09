(function (angular) {

  "use strict";
  angular.module("risevision.common.userprofile", [
  "risevision.common.gapi", "risevision.common.oauth2",
  "risevision.common.cache"]).
  factory("getUser", ["oauthAPILoader", "coreAPILoader", "$q", "$log",
  "userState", "getOAuthUserInfo", "userInfoCache",
  function (oauthAPILoader, coreAPILoader, $q, $log, userState, getOAuthUserInfo,
    userInfoCache) {
    return function () {
      var deferred = $q.defer();
      if(userInfoCache.get("profile")) {
        //skip if already exists
        deferred.resolve(userInfoCache.get("profile"));
      }
      else {
        $q.all([oauthAPILoader(), coreAPILoader(), getOAuthUserInfo()]).then(function (results){
          var coreApi = results[1];
          var oauthUserInfo = results[2];
          if(oauthUserInfo.email) {
            userState.user.profile = {
              picture: oauthUserInfo.picture
            };
          }
          coreApi.user.get({}).execute(function (resp){
            if(resp.result === true) {
              $log.debug("getUser resp", resp);
                angular.extend(userState.user.profile,
                  angular.extend({
                    picture: oauthUserInfo.picture,
                    username: oauthUserInfo.email
                  }, resp.item));
              userInfoCache.put("profile", resp.item);
              deferred.resolve(resp.item);
            }
            else {
              deferred.reject(resp);
            }
          });
        }, deferred.reject);
      }
      return deferred.promise;
    };
  }])

  .factory("updateUser", ["$q", "coreAPILoader", "$log",
  "userInfoCache", "userState", "getUser",
  function ($q, coreAPILoader, $log, userInfoCache, userState, getUser) {
    return function (profile) {
      $log.debug("updateUser", profile);
      var deferred = $q.defer();
      coreAPILoader().then(function (coreApi) {
        var request = coreApi.user.update(profile);
        request.execute(function (resp) {
            $log.debug("updateUser resp", resp);
            if(resp.result === true) {
              userInfoCache.remove("profile");
              getUser().then(function() {deferred.resolve(resp);});
            }
            else {
              deferred.reject("updateUser");
            }
        });
      }, deferred.reject);
      return deferred.promise;
    };
  }])

  .factory("getUsers", ["$q", "coreAPILoader", "$log", function (
    $q, coreAPILoader, $log) {
    return function (criteria) {
      $log.debug("getUsers", criteria);
      var deferred = $q.defer();
      coreAPILoader().then(function (coreApi) {
        var request = coreApi.user.list(criteria);
        request.execute(function (resp) {
            $log.debug("getUsers resp", resp);
            if(resp.result === true) {
              $log.debug("getUser resp", resp);
              deferred.resolve(resp.item);
            }
            else {
              deferred.reject("getUsers");
            }
        });
      }, deferred.reject);
      return deferred.promise;
    };
  }]);

})(angular);
