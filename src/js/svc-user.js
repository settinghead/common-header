(function (angular) {

  "use strict";
  angular.module("risevision.common.userprofile", [
  "risevision.common.gapi", "risevision.common.oauth2",
  "risevision.common.cache", "risevision.common.util"])

  .value("userRoleMap", {
    "ca": "Content Administrator",
    "ce": "Content Editor",
    "cp": "Content Publisher",
    "da": "Display Administrator",
    "ua": "User Administrator",
    "sa": "System Administrator",
    "pu": "Purchaser",
    "ba": "Billing Administrator"
  })

  .factory("getUser", ["oauthAPILoader", "coreAPILoader", "$q", "$log",
  "elizaState", "getOAuthUserInfo", "userInfoCache",
  function (oauthAPILoader, coreAPILoader, $q, $log, elizaState, getOAuthUserInfo,
    userInfoCache) {
    return function (username) {
      var deferred = $q.defer();
      var criteria = {};
      if (username) {criteria.username = username; }
      $log.debug("getUser called", criteria);
      if(userInfoCache.get("profile-" + username || (elizaState.user && elizaState.user.username))) {
        //skip if already exists
        $log.debug("getUser resp from cache", "profile-" + username, userInfoCache.get("profile-" + username));
        deferred.resolve(userInfoCache.get("profile-" + username));
      }
      else {
        $q.all([oauthAPILoader(), coreAPILoader(), getOAuthUserInfo()]).then(function (results){
          var coreApi = results[1];
          var oauthUserInfo = results[2];
          coreApi.user.get(criteria).execute(function (resp){
            if (resp.error || !resp.result) {
              deferred.reject(resp);
            }
            else {
              $log.debug("getUser resp", resp);
                //get user profile
                elizaState.user.profile = angular.extend({
                  username: oauthUserInfo.email
                }, resp.item);
              userInfoCache.put("profile-" + username || oauthUserInfo.email, resp.item);
              deferred.resolve(resp.item);
            }
          });
        }, deferred.reject);
      }
      return deferred.promise;
    };
  }])

  .factory("getUsers", ["$q", "coreAPILoader", "$log",
  function ($q, coreAPILoader, $log) {
    return function (opts) {
      var deferred = $q.defer();
      coreAPILoader().then(function (coreApi) {
        var request = coreApi.user.list(opts);
        request.execute(function (resp) {
            $log.debug("getUsers resp", resp);
            if(resp.result === true) {
              deferred.resolve(resp.items);
            }
            else {
              deferred.reject("getUsers");
            }
        });
      });
      return deferred.promise;
    };

  }])

  .factory("updateUser", ["$q", "coreAPILoader", "$log",
  "userInfoCache", "elizaState", "getUser", "pick",
  function ($q, coreAPILoader, $log, userInfoCache, elizaState, getUser, pick) {
    return function (username, profile) {
      $log.debug("updateUser called", username, profile);
      var deferred = $q.defer();
      profile = pick(profile, "mailSyncEnabled",
        "email", "firstName", "lastName", "telephone", "roles");
      if(angular.isDefined(profile.mailSyncEnabled) && typeof profile.mailSyncEnabled === "boolean") {
        //covert boolean to string
        profile.mailSyncEnabled = profile.mailSyncEnabled ? "true" : "false";
      }
      coreAPILoader().then(function (coreApi) {
        var request = coreApi.user.update({
          username: username, data: JSON.stringify(profile)});
        request.execute(function (resp) {
            $log.debug("updateUser resp", resp);
            if(resp.error) {
              deferred.reject(resp);
            }
            else if (resp.result) {
              userInfoCache.remove("profile-" + username);
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

  .factory("addUser", ["$q", "coreAPILoader", "$log",
  function ($q, coreAPILoader, $log) {
    return function (companyId, username, profile) {
      var deferred = $q.defer();
      coreAPILoader().then(function (coreApi) {
        var request = coreApi.user.add({
          username: username,
          companyId: companyId,
          data: JSON.stringify(profile)});
        request.execute(function (resp) {
          $log.debug("addUser resp", resp);
          if(resp.result === true) {
            deferred.resolve(resp);
          }
          else {
            deferred.reject("addUser");
          }
        });
      });
      return deferred.promise;
    };
  }])

  .factory("deleteUser", ["$q", "coreAPILoader", "$log",
  function ($q, coreAPILoader, $log) {
    return function (username) {
      var deferred = $q.defer();
      coreAPILoader().then(function (coreApi) {
        var request = coreApi.user.delete({
          username: username});
        request.execute(function (resp) {
          $log.debug("deleteUser resp", resp);
          if(resp.result === true) {
            deferred.resolve(resp);
          }
          else {
            deferred.reject("deleteUser");
          }
        });
      });
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
              deferred.resolve(resp.items);
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
