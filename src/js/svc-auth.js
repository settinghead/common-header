(function (angular) {
  "use strict";

  angular.module("risevision.common.auth",
    ["risevision.common.gapi", "risevision.common.localstorage",
      "risevision.common.config", "risevision.common.cache",
      "ngBiscuit"
    ])

    // Some constants
    .value("DEFAULT_PROFILE_PICTURE", "http://api.randomuser.me/portraits/med/men/33.jpg")
    .value("SCOPES", "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile")
    .value("AUTH_STAUS_LOADING", -1)
    .value("AUTH_STATUS_NOT_AUTHENTICATED", 0)

    .service("accessTokenKeeper", ["$log", "getBaseDomain", "cookieStore",
      "gapiLoader",
      function ($log, getBaseDomain, cookieStore, gapiLoader) {

      //load token from cookie

      var accessToken = cookieStore.get("rv-token");
      if(accessToken) {
        accessToken = JSON.parse(accessToken);
      }

      $log.debug("Access token", accessToken);

      this.get = function () {
        return accessToken;
      };

      this.set = function (obj) {
        if(typeof obj === "object") {
          cookieStore.put(
            "rv-token", JSON.stringify(obj),
            {domain: "." + getBaseDomain()}
            );
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

      return function getBaseDomain() {
        if(!result) {
          var hostname = $location.host();
          var port = $location.port() ? ":" + $location.port() : "";
          var parts = hostname.split(".");
          if(parts.length > 1) {
            //localhost
            result = parts.slice(parts.length -2).join(".") + port;
          }
          else {
            result = hostname + port;
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
    .factory("resetUserState", ["$log", "userState", "AUTH_STAUS_LOADING",
     function ($log, userState, AUTH_STAUS_LOADING){
      return function() {
        angular.extend(userState, {
          user: {
            company: null
          },
          selectedCompanyId: null,
          selectedCompany: null,
          isRiseAdmin: false,
          isRiseUser: false,
          isAuthed: false,
          authStatus: AUTH_STAUS_LOADING,
        });
        $log.debug("User state has been reset.");
      };
    }])

    .factory("authenticate", ["$log", "$q", "resetUserState",
      "userInfoCache", "userState", "CLIENT_ID", "SCOPES", "$location",
      "getBaseDomain", "oauthAPILoader", "AUTH_STATUS_NOT_AUTHENTICATED",
      "AUTH_STAUS_LOADING", "accessTokenKeeper",
      function ($log, $q, resetUserState, userInfoCache, userState, CLIENT_ID,
      SCOPES, $location, getBaseDomain, oauthAPILoader, AUTH_STATUS_NOT_AUTHENTICATED,
      AUTH_STAUS_LOADING, accessTokenKeeper) {
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
                authorizeDeferred.resolve(authResult);
              }
              else {
                authorizeDeferred.reject();
              }
            });
          });
          return authorizeDeferred.promise;
        };

      return function(forceAuth) {
        $log.debug("authentication called");
        userState.authStatus = AUTH_STAUS_LOADING;

        var authenticateDeferred = $q.defer();
        resetUserState();
        userInfoCache.removeAll();

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
          userState.authStatus = AUTH_STATUS_NOT_AUTHENTICATED;
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
          deferred.resolve();
          $log.debug("User is signed out.");
        }, deferred.reject);
        return deferred.promise;
      };
    }]);

})(angular);
