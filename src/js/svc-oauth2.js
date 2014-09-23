(function (angular) {

  "use strict";
  angular.module("risevision.common.oauth2",
  ["risevision.common.gapi", "risevision.common.cache"]).
  factory("getOAuthUserInfo", ["oauthAPILoader", "$q", "userInfoCache",
  "$log",
  function (oauthAPILoader, $q, userInfoCache, $log) {
    return function () {

      var deferred = $q.defer();
      var resp;
      if((resp = userInfoCache.get("oauth2UserInfo"))) {
        if(resp.error) {
          deferred.reject(resp.error);
        }
        else {
          deferred.resolve(resp);
        }
      }
      else {
        oauthAPILoader().then(function (gApi){
          gApi.client.oauth2.userinfo.get().execute(function (resp){
            $log.debug("getOAuthUserInfo oauth2.userinfo.get() resp", resp);
            if(!resp) {
              deferred.reject();
            }
            else if(resp.error) {
              deferred.reject(resp.error);
            }
            else {
              userInfoCache.put("oauth2UserInfo", resp);
              deferred.resolve(resp);
            }
          });
        }, deferred.reject);
      }

      return deferred.promise;
    };
  }]);

})(angular);
