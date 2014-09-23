(function (angular) {
  "use strict";

  angular.module("risevision.common.auth",
    ["risevision.common.gapi", "risevision.common.localstorage",
      "risevision.common.config", "risevision.common.cache",
      "risevision.common.oauth2", "ngBiscuit",
      "risevision.common.util"
    ])

    // Some constants
    .value("DEFAULT_PROFILE_PICTURE", "http://api.randomuser.me/portraits/med/men/33.jpg")
    .value("SCOPES", "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile")

    .service("accessTokenKeeper", ["$log", "getBaseDomain", "cookieStore",
      "gapiLoader", "pick",
      function ($log, getBaseDomain, cookieStore, gapiLoader, pick) {

      //load token from cookie

      var accessToken = cookieStore.get("rv-token");
      if(accessToken) {
        accessToken = JSON.parse(accessToken);
        gapiLoader().then(function (gApi) {
          gApi.auth.setToken(accessToken);
        });
      }

      $log.debug("Access token", accessToken);

      this.get = function () {
        return accessToken;
      };

      this.set = function (obj) {
        if(typeof obj === "object") {
          //As per doc: https://developers.google.com/api-client-library/javascript/reference/referencedocs#OAuth20TokenObject
          obj = pick(obj, "access_token", "state");
          cookieStore.put(
            "rv-token", JSON.stringify(obj), {domain: "." + getBaseDomain()});
          cookieStore.put(
            "rv-token", JSON.stringify(obj));
        }

        return gapiLoader().then(function (gApi) {
          gApi.auth.setToken(obj);
        });
      };

      this.clear = function () {
        $log.debug("Clearing access token...");
        accessToken = null;
        cookieStore.remove("rv-token",
          {domain: "." + getBaseDomain()});
        cookieStore.remove("rv-token");
        return gapiLoader().then(function (gApi) {
          gApi.auth.setToken();
        });
      };
    }])

    .factory("getBaseDomain", ["$log", "$location", function ($log, $location) {
      var result;
      function looksLikeIp(addr)
      {
       if (/^([0-9])+\.([0-9])+\.([0-9])+\.([0-9])+$/.test(addr))
        {
          return (true);
        }
        return (false);
      }
      return function getBaseDomain() {
        if(!result) {
          var hostname = $location.host();
          var port = $location.port() ? ":" + $location.port() : "";

          if(looksLikeIp(hostname)) {
            result = hostname + port;
          }
          else {
            var parts = hostname.split(".");
            if(parts.length > 1) {
              //localhost
              result = parts.slice(parts.length -2).join(".") + port;
            }
            else {
              result = hostname + port;
            }
          }

          $log.debug("baseDomain", result);
        }
        return result;
      };
    }])

    /**
    * A Convenience method for the app to
    * get the userState object.
    *
    */
    .factory("resetUserState", ["$log", "userState",
     function ($log, userState){
      return function() {
        delete userState.user;
        delete userState.selectedCompany;
        delete userState.isRiseAdmin;
        $log.debug("User state has been reset.");
      };
    }])

    .factory("authenticate", ["$log", "$q", "resetUserState",
      "userInfoCache", "userState", "CLIENT_ID", "SCOPES", "$location",
      "getBaseDomain", "oauthAPILoader", "accessTokenKeeper", "getOAuthUserInfo",
      function ($log, $q, resetUserState, userInfoCache, userState, CLIENT_ID,
      SCOPES, $location, getBaseDomain, oauthAPILoader, accessTokenKeeper,
      getOAuthUserInfo) {
        /*
        * Responsible for triggering the Google OAuth process.
        *
        */
        var authorize = function(attemptImmediate) {
          var authorizeDeferred = $q.defer();

          var opts = {
            client_id: CLIENT_ID,
            scope: SCOPES,
            cookie_policy: $location.protocol() + "://" + "." +
              getBaseDomain()
          };

          if (attemptImmediate) {
            opts.immediate = true;
          }
          else {
            opts.prompt = "select_account";
          }

          oauthAPILoader().then(function (gApi) {
            gApi.auth.authorize(opts, function (authResult) {
              $log.debug("authResult", authResult);
              if (authResult && !authResult.error) {
                accessTokenKeeper.set(authResult);
                getOAuthUserInfo().then(function (oauthUserInfo) {
                  if(!userState.user || userState.user.username !== oauthUserInfo.email) {
                    userState.user  = {
                      username: oauthUserInfo.email,
                      picture: oauthUserInfo.picture
                    };
                  }
                  authorizeDeferred.resolve(authResult);
                }, authorizeDeferred.reject);
              }
              else {
                authorizeDeferred.reject("not authorized");
              }
            });
          }, authorizeDeferred.reject);
          return authorizeDeferred.promise;
        };

      return function(forceAuth) {
        $log.debug("authentication called");
        var authenticateDeferred = $q.defer();
        if(forceAuth) {
          resetUserState();
          userInfoCache.removeAll();
        }

        // This flag indicates a potentially authenticated user.
        var accessToken = accessTokenKeeper.get();
        var userAuthed = (angular.isDefined(accessToken) && accessToken !== null);
        $log.debug("userAuthed", userAuthed);

        if (forceAuth || userAuthed === true) {
          authorize(userAuthed === true && !forceAuth)
          .then(function(authResult) {
            if (authResult && ! authResult.error) {
              authenticateDeferred.resolve();
            }
            else {
              authenticateDeferred.reject("Authentication Error: " + authResult.error);
            }
          });
        }
        else {
          var msg = "user is not authenticated";
          $log.info(msg);
          authenticateDeferred.reject(msg);
        }

        return authenticateDeferred.promise;
      };
    }])

    .factory("signOut", ["$q", "$log", "gapiLoader", "cookieStore", "getBaseDomain",
    "userInfoCache", "accessTokenKeeper", "resetUserState", "shoppingCart",
     function ($q, $log, gapiLoader, cookieStore, getBaseDomain, userInfoCache,
       accessTokenKeeper, resetUserState, shoppingCart) {
      return function() {
        var deferred = $q.defer();
        userInfoCache.removeAll();
        // The flag the indicates a user is potentially
        // authenticated already, must be destroyed.
        accessTokenKeeper.clear().then(function () {
          //clear auth token
          // The majority of state is in here
          resetUserState();
          shoppingCart.destroy();
          //call google api to sign out
          gapiLoader().then(function (gApi) {gApi.auth.signOut(); });
          cookieStore.remove("surpressRegistration");
          deferred.resolve();
          $log.debug("User is signed out.");
        }, deferred.reject);
        return deferred.promise;
      };
    }]);

})(angular);
