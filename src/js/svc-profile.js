(function (angular) {

  "use strict";
  angular.module("risevision.common.profile", ["risevision.common.gapi"]).
  factory("getProfile", ["oauthAPILoader", "coreAPILoader", "$q", "$log",
  function (oauthAPILoader, coreAPILoader, $q, $log) {
    return function (userState) {
      var deferred = $q.defer();
      if(userState && userState.user.profile) {
        //skip if already exists
        deferred.resolve(userState.user.profile);
      }
      else {
        $q.all([oauthAPILoader.get(), coreAPILoader.get()]).then(function (results){
          var coreApi = results[1];
          coreApi.user.get({}).execute(function (resp){
            if(resp.result === true) {
              $log.debug("getProfile resp", resp);
              if(userState) {
                userState.user.profile = resp.item;
              }
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

  .factory("updateProfile", ["$q", "coreAPILoader", "$log",
  function ($q, coreAPILoader, $log) {
    return function (profile) {
      $log.debug("updateProfile", profile);
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
  }]);

})(angular);
