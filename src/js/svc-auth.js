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

    .service("userState", ["$log", "$q", "userInfoCache", "_accessTokenKeeper",
    "gapiLoader", "cookieStore", "CLIENT_ID", "SCOPES", "$location", "oauthAPILoader",
    "getOAuthUserInfo", "getBaseDomain",
      function ($log, $q, userInfoCache, _accessTokenKeeper, gapiLoader,
      cookieStore, CLIENT_ID, SCOPES, $location, oauthAPILoader,
      getOAuthUserInfo, getBaseDomain) {

      var self = this;

      var _user = {};
      var _username = null;
      var _picture = null;
      var _profile = {};
      var _selectedCompany = {};
      var _cart = {};
      var _emptyObj = {};

      var clearObj = function (obj) {
        for (var prop in obj) { if (obj.hasOwnProperty(prop)) { delete obj[prop]; } }
      };

      this.reset = function () {
        clearObj(_user); clearObj(_profile); clearObj(_selectedCompany);
        clearObj(_cart);
      };

      this.getUsername = function () {
        return _username;
      };

      this.getSelectedCompanyId = function () {
        return (_selectedCompany || _emptyObj).id;
      };

      this.isRiseVisionUser = function () {
        return (_profile.email !== undefined || _profile.email !== null);
      };

      this.SELECTED_COMPANY = "selectedCompany";

      this.signOut = function() {
        var deferred = $q.defer();
        userInfoCache.removeAll();
        // The flag the indicates a user is potentially
        // authenticated already, must be destroyed.
        _accessTokenKeeper.clear().then(function () {
          //clear auth token
          // The majority of state is in here
          shoppingCart.destroy();
          //call google api to sign out
          gapiLoader().then(function (gApi) {gApi.auth.signOut(); });
          cookieStore.remove("surpressRegistration");
          deferred.resolve();
          $log.debug("User is signed out.");
        }, deferred.reject);
        return deferred.promise;
      };

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
              _accessTokenKeeper.set(authResult);
              getOAuthUserInfo().then(function (oauthUserInfo) {
                if(_username !== oauthUserInfo.email) {
                    _username = oauthUserInfo.email;
                    _picture = oauthUserInfo.picture;
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

      this.authenticate = function(forceAuth) {
        $log.debug("authentication called");
        var authenticateDeferred = $q.defer();
        if(forceAuth) {
          self.reset();
          userInfoCache.removeAll();
        }

        // This flag indicates a potentially authenticated user.
        var accessToken = _accessTokenKeeper.get();
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

    .service("_accessTokenKeeper", ["$log", "$q", "getBaseDomain", "cookieStore",
      "gapiLoader", "pick",
      function ($log, $q, getBaseDomain, cookieStore, gapiLoader, pick) {

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
    }]);

})(angular);
