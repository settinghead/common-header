(function (angular) {
  "use strict";

  angular.module("risevision.common.userstate",
    ["risevision.common.gapi", "risevision.common.localstorage",
    "risevision.common.config", "risevision.common.cache",
    "risevision.common.oauth2", "ngBiscuit",
    "risevision.common.util", "risevision.common.userprofile",
    "risevision.common.company"
  ])

  // constants (you can override them in your app as needed)
  .value("DEFAULT_PROFILE_PICTURE", "http://api.randomuser.me/portraits/med/men/33.jpg")
  .value("OAUTH2_SCOPES", "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile")

  .factory("userState", [
    "$injector", "$q", "$log", "oauthAPILoader", "$location", "CLIENT_ID",
    "gapiLoader", "pick", "cookieStore", "OAUTH2_SCOPES", "userInfoCache",
    "getOAuthUserInfo", "getUserProfile", "getCompany", "$rootScope",
    function ($injector, $q, $log, oauthAPILoader, $location, CLIENT_ID,
    gapiLoader, pick, cookieStore, OAUTH2_SCOPES, userInfoCache,
    getOAuthUserInfo, getUserProfile, getCompany, $rootScope) {
    //singleton factory that represents userState throughout application
    var _profile = null; //Rise vision profile
    var _user;  //Google user
    var _userCompany = null;
    var _selectedCompany = null;
    var _roleMap = null;
    var _accessToken = cookieStore.get("rv-token");

    (function initializeAccessToken () {
      //load token from cookie
      if(_accessToken) {
        _accessToken = JSON.parse(_accessToken);
        gapiLoader().then(function (gApi) {
          gApi.auth.setToken(_accessToken);
        });
      }

      $log.debug("Access token", _accessToken);
    })();


    var _setAccessToken = function (obj) {
      if(typeof obj === "object") {
        //As per doc: https://developers.google.com/api-client-library/javascript/reference/referencedocs#OAuth20TokenObject
        obj = pick(obj, "access_token", "state");
        cookieStore.put(
          "rv-token", JSON.stringify(obj), {domain: _getBaseDomain()});
        cookieStore.put(
          "rv-token", JSON.stringify(obj));
      }

      return gapiLoader().then(function (gApi) {
        gApi.auth.setToken(obj);
      });
    };

    var _clearAccessToken = function () {
      $log.debug("Clearing access token...");
      _accessToken = null;
      cookieStore.remove("rv-token",
        {domain: "." + _getBaseDomain()});
      cookieStore.remove("rv-token");
      return gapiLoader().then(function (gApi) {
        gApi.auth.setToken();
      });
    };


    var _looksLikeIp = function (addr)
    {
     if (/^([0-9])+\.([0-9])+\.([0-9])+\.([0-9])+$/.test(addr))
      {
        return (true);
      }
      return (false);
    };

    var _getBaseDomain = function () {
      var result;
      if(!result) {
        var hostname = $location.host();
        var port = $location.port() ? ":" + $location.port() : "";

        if(_looksLikeIp(hostname)) {
          result = hostname + port;
        }
        else {
          var parts = hostname.split(".");
          if(parts.length > 1) {
            //localhost
            result = "." + parts.slice(parts.length -2).join(".") + port;
          }
          else {
            result = "." + hostname + port;
          }
        }

        $log.debug("baseDomain", result);
      }
      return result;
    };

    var _resetUserState = function () {
       _user = undefined;
       _selectedCompany = null;
       _profile = null;
       _userCompany = null;
       _roleMap = null;
       $log.debug("User state has been reset.");
     };

     /*
     * Responsible for triggering the Google OAuth process.
     *
     */
     var _authorize = function(attemptImmediate) {
       var authorizeDeferred = $q.defer();

       var opts = {
         client_id: CLIENT_ID,
         scope: OAUTH2_SCOPES,
         cookie_policy: $location.protocol() + "://" +
           _getBaseDomain()
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
             _setAccessToken(authResult);
             getOAuthUserInfo().then(function (oauthUserInfo) {
               if(!_user || _user.username !== oauthUserInfo.email) {

                 //populate user
                 _user = {
                   username: oauthUserInfo.email,
                   picture: oauthUserInfo.picture
                 };

                 //populate profile if the current user is a rise vision user
                 getUserProfile(_user.username).then(
                   function (profile) {
                     _profile = angular.extend({
                       username: oauthUserInfo.email
                     }, profile);

                     //set role map
                     _roleMap = {};
                     if(_profile.roles) {
                        _profile.roles.forEach(function (val){
                          _roleMap[val] = true;
                        });
                     }

                     //populate userCompany
                     return getCompany().then(function(company) {
                       _selectedCompany = _userCompany = company;
                     }, function () { _userCompany = null;
                     }).finally(function () {
                       authorizeDeferred.resolve(authResult);
                       $rootScope.$broadcast("risevision.user.authorized");
                     });
                   },
                   function () { _profile = null;
                     authorizeDeferred.resolve(authResult);
                     $rootScope.$broadcast("risevision.user.authorized");
                   });
               }
               else {authorizeDeferred.resolve(authResult); }
             }, function(err){
               _user = null;
             authorizeDeferred.reject(err); });
           }
           else {
             _user = null;
             authorizeDeferred.reject("not authorized");
           }
         });
       }, authorizeDeferred.reject);
       return authorizeDeferred.promise;
     };

     var authenticate = function(forceAuth) {
           var authenticateDeferred = $q.defer();
           $log.debug("authentication called");
           if(forceAuth) {
             _resetUserState();
             userInfoCache.removeAll();
           }

           // This flag indicates a potentially authenticated user.
           var userAuthed = (angular.isDefined(_accessToken) && _accessToken !== null);
           $log.debug("userAuthed", userAuthed);

           if (forceAuth || userAuthed === true) {
             _authorize(!forceAuth)
             .then(function(authResult) {
               if (authResult && ! authResult.error) {
                 authenticateDeferred.resolve();
               }
               else {
                 authenticateDeferred.reject("Authentication Error: " + authResult.error);
               }
             }, authenticateDeferred.reject);
           }
           else {
             var msg = "user is not authenticated";
             $log.debug(msg);
             authenticateDeferred.reject(msg);
             _user = null;
           }

       return authenticateDeferred.promise;
     };

     var signOut = function() {
       var deferred = $q.defer();
       userInfoCache.removeAll();
       gapiLoader().then(function (gApi) {
         gApi.auth.signOut();
         // The flag the indicates a user is potentially
         // authenticated already, must be destroyed.
         _clearAccessToken().then(function () {
           //clear auth token
           // The majority of state is in here
           _resetUserState();
           _user = null;
          //  TODO: shoppingCart.destroy();
           //call google api to sign out
           cookieStore.remove("surpressRegistration");
           $rootScope.$broadcast("risevision.user.signedOut");
           $log.debug("User is signed out.");
           deferred.resolve();
         }, function () {
           deferred.reject();
         });
       });
       return deferred.promise;
     };

    var isLoggedIn = function () {
      if(_user === null) {return false; }
      else if(_user === undefined) { return undefined; }
      else { return true; }
    };

    var isRiseVisionUser = function () {
      return _profile !== null;
    };

    var hasRole = function (role) {
      return angular.isDefined(_roleMap[role]);
    };

    var userState = {
      getSelectedCompanyId: function () {
        return (_selectedCompany && _selectedCompany.id) || null; },
      getSelectedCompanyName: function () {
        return (_selectedCompany && _selectedCompany.name) || null;},
      getSelectedCompanyCountry: function () {
          return (_selectedCompany && _selectedCompany.country) || null;},
      getUsername: function () {
        return (_user && _user.username) || null; },
      getCopyOfProfile: function () { return angular.copy(_profile); },
      resetCompany: function () { _selectedCompany = _userCompany; },
      getCopyOfUserCompany: function () { return angular.copy(_userCompany); },
      getCopyOfSelectedCompany: function () { return angular.copy(_selectedCompany); },
      switchCompany: function (company) { _selectedCompany = company; },
      isSubcompanySelected: function () {
        return _selectedCompany && _selectedCompany.id !== (_userCompany && _userCompany.id); },
      getUserPicture: function () { return _user.picture; },
      hasRole: hasRole,
      isRiseAdmin: function () {return hasRole("ba"); },
      isSeller: function () {return _selectedCompany && _selectedCompany.isSeller === true; },
      isRiseVisionUser: isRiseVisionUser,
      isLoggedIn: isLoggedIn,
      authenticate: authenticate,
      signOut: signOut,
    };

    window.userState = userState;
    return userState;
  }]);

})(angular);
