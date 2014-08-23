(function(angular) {
  "use strict";

  angular.module("risevision.common.auth",
    ["risevision.common.gapi", "risevision.common.localstorage",
      "risevision.common.config",
      "ngBiscuit"
    ])

    // Some constants
    .value("DEFAULT_PROFILE_PICTURE", "http://api.randomuser.me/portraits/med/men/33.jpg")
    .value("SCOPES", "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile")

    .constant("userState", {
      user: {}
    })

    .factory("apiAuth", ["$interval", "$rootScope", "$q", "$http",
      "gapiLoader", "coreAPILoader", "oauthAPILoader", "CLIENT_ID",
      "SCOPES", "DEFAULT_PROFILE_PICTURE", "$log", "localStorageService",
      "$location", "cookieStore", "userState", "userInfoCache",
      function($interval, $rootScope, $q, $http, gapiLoader, coreAPILoader,
        oauthAPILoader, CLIENT_ID, SCOPES, DEFAULT_PROFILE_PICTURE, $log,
        localStorageService, $location, cookieStore, userState, userInfoCache) {

        var that = this;
        var factory = {};

        var AUTH_STATUS_NOT_AUTHENTICATED = 0;
        var AUTH_STAUS_LOADING = -1;

        this.resetUserState = function() {
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

        var accessToken = cookieStore.get("rv-token");

        if(accessToken) {
          accessToken = JSON.parse(accessToken);
        }

        $log.debug("Access token", accessToken);

        /**
        * The entry point for an app.
        * This may or may not result in a valid authentication.
        *
        * If forceAuth is true, then this is a login request.
        * If not, then it's the app init auth check which will
        * setup an already existinguser "session".
        */
        factory.$authenticate = function(forceAuth) {
          $log.debug("$authentication called");
          var authenticateDeferred = $q.defer();
          that.resetUserState();
          userInfoCache.removeAll();

          /**
          * This event is designed to be clearer about the auth flow.
          * It returns a promise that will resolve upon successful authentication,
          * or otherwise be 'reject'ed.
          *
          * This allows a UI to respond to the attempt (by locking the UI for example),
          * and also allow better handling of the failure case.
          *
          */
          $rootScope.$broadcast("rvAuth.$authenticate", {
            isImmediate: !forceAuth,
            promise: authenticateDeferred.promise,
            userState: userState
          });

          // This flag indicates a potentially authenticated user.
          var userAuthed = (angular.isDefined(accessToken) && accessToken !== null);
          $log.debug("userAuthed", userAuthed);

          if (forceAuth || userAuthed === true) {
            that.authorize(userAuthed === true && !forceAuth)
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

        function getBaseDomain() {
          var result;
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
          return result;
        }

        /*
        * Responsible for triggering the Google OAuth process.
        *
        */
        this.authorize = function(attemptImmediate) {
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

          oauthAPILoader.get().then(function (gApi) {
            gApi.auth.authorize(opts, function (authResult) {
              $log.debug("authResult", authResult);
              if (authResult && !authResult.error) {
                accessToken = authResult;
                if(typeof accessToken === "object") {
                  cookieStore.put(
                    "rv-token", JSON.stringify(accessToken),
                    {domain: "." + getBaseDomain()}
                    );
                  cookieStore.put(
                    "rv-token", JSON.stringify(accessToken));
                }
                authorizeDeferred.resolve(authResult);
              }
              else {
                authorizeDeferred.reject();
              }
            });
          });
          return authorizeDeferred.promise;
        };

        /**
        * A Convenience method for the app to
        * get the userState object.
        *
        */
        factory.getUserState = function() {
          return userState;
        };

        /**
        * This would be called from the common header (sign out button),
        * or elsewhere in the app (ad-hoc signout). It's responsible
        * for immediately flushing all state and broadcasting
        * an event that the header or app uses to update itself.
        */
        factory.$signOut = function() {
          var deferred = $q.defer();
          gapiLoader.get().then(function (gApi) {
            // The flag the indicates a user is potentially
            // authenticated already, must be destroyed.
            cookieStore.remove("rv-token",
              {domain: "." + getBaseDomain()});
            cookieStore.remove("rv-token");
            userInfoCache.removeAll();
            //clear auth token
            gApi.auth.setToken();
            accessToken = undefined;
            // The majority of state is in here
            that.resetUserState();
            deferred.resolve();
            $rootScope.$broadcast("rvAuth.$signOut");
          }, deferred.reject);
          return deferred.promise;
        };

        factory.getAccessToken = function () {
          return accessToken;
        };

        if(accessToken) {
          gapiLoader.get().then(function (gApi) {
            gApi.auth.setToken(accessToken, null);
            // factory.$authenticate(false);
            userState.authStatus = AUTH_STAUS_LOADING;
          });
        }

        that.resetUserState();

        return factory;

      }]);

})(angular);
