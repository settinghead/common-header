(function (angular) {

  "use strict";
  angular.module("risevision.common.profile", [
  "risevision.common.gapi", "risevision.common.oauth2",
  "risevision.common.cache"]).
  factory("getProfile", ["oauthAPILoader", "coreAPILoader", "$q", "$log",
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
          coreApi.user.get({}).execute(function (resp){
            if(resp.result === true) {
              $log.debug("getProfile resp", resp);
              if(userState) {
                userState.user.profile =
                  angular.extend({
                    picture: oauthUserInfo.picture,
                    username: oauthUserInfo.email
                  }, resp.item);
              }
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

  .factory("updateProfile", ["$q", "coreAPILoader", "$log", "userInfoCache",
  function ($q, coreAPILoader, $log, userInfoCache) {
    return function (profile) {
      $log.debug("updateProfile", profile);
      var deferred = $q.defer();
      coreAPILoader().then(function (coreApi) {
        //TODO: consult Alxey
        var request = coreApi.user.update(profile);
        request.execute(function (resp) {
            $log.debug("updateProfile resp", resp);
            if(resp.result === true) {
              userInfoCache.put("profile", resp.item);
              deferred.resolve(resp.item);
            }
            else {
              deferred.reject("updateProfile");
            }
        });
      });
      return deferred.promise;
    };
  }]);

})(angular);
