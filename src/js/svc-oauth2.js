(function (angular) {

  "use strict";
  angular.module("risevision.common.oauth2", ["risevision.common.gapi"]).
  factory("getOAuthUserInfo", ["oauthAPILoader", "$q",
  function (oauthAPILoader, $q) {
    return function () {
      var deferred = $q.defer();
      oauthAPILoader.get().then(function (gApi){
        gApi.client.oauth2.userinfo.get().execute(function (resp){
          deferred.resolve(resp);
        });
      }, deferred.reject);
      return deferred.promise;
    };
  }]);

})(angular);
