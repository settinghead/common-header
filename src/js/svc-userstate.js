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
    "$interval",
    function ($injector, $q, $log, oauthAPILoader, $location, CLIENT_ID,
    gapiLoader, pick, cookieStore, OAUTH2_SCOPES, userInfoCache,
    getOAuthUserInfo, getUserProfile, getCompany, $rootScope,
    $interval) {
    //singleton factory that represents userState throughout application
    var _profile = {}; //Rise vision profile
    var _user = {};  //Google user
    var _userCompany = {};
    var _selectedCompany = {};
    var _roleMap = {};
    var _accessToken = cookieStore.get("rv-token");
    var _accessTokenRefreshHandler = null;
    var _inRVAFrame = angular.isDefined($location.search().inRVA);

      //
      var _follow = function(source) {
        var Follower = function(){};
        Follower.prototype = source;
        return new Follower();
      };

    var initializeAccessToken = function () {
      //load token from cookie
      if(_accessToken) {
        _accessToken = JSON.parse(_accessToken);
        gapiLoader().then(function (gApi) {
          gApi.auth.setToken(_accessToken);
        });
      }

      $log.debug("Access token", _accessToken);
    };

    initializeAccessToken();

    var _setAccessToken = function (obj) {
      if(typeof obj === "object") {
        _scheduleAccessTokenAutoRefresh();
        //As per doc: https://developers.google.com/api-client-library/javascript/reference/referencedocs#OAuth20TokenObject
        _accessToken = obj = pick(obj, "access_token", "state");
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
      _cancelAccessTokenAutoRefresh();
      _accessToken = null;
      cookieStore.remove("rv-token",
        {domain: "." + _getBaseDomain()});
      cookieStore.remove("rv-token");
      return gapiLoader().then(function (gApi) {
        gApi.auth.setToken();
      });
    };

    var _scheduleAccessTokenAutoRefresh = function () {
      //cancel any existing $interval(s)
      $interval.cancel(_accessTokenRefreshHandler);
      _accessTokenRefreshHandler = $interval(function(){
        //cancel current $interval. It will be re-sheduled if authentication succeeds
        $interval.cancel(_accessTokenRefreshHandler);
        //refresh Access Token
        _authorize(true);
      }, 55 * 60 * 1000); //refresh every 55 minutes
    };

    var _cancelAccessTokenAutoRefresh = function () {
      $interval.cancel(_accessTokenRefreshHandler);
      _accessTokenRefreshHandler = null;
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

    var _clearObj = function (obj) {
      for (var member in obj) {
        delete obj[member];
      }
    };

    var _clearAndCopy = function (src, dest) {
      _clearObj(dest);
      angular.extend(dest, src);
    };

    var _resetUserState = function () {
       _clearObj(_user);
       _clearObj(_selectedCompany);
       _clearObj(_profile);
       _clearObj(_userCompany);
       _roleMap = {};
       $log.debug("User state has been reset.");
     };

     var refreshProfile = function () {
       var deferred = $q.defer();
         getOAuthUserInfo().then(function (oauthUserInfo) {
         //populate profile if the current user is a rise vision user
         getUserProfile(_user.username, true).then(
           function (profile) {
             _clearAndCopy(angular.extend({
               username: oauthUserInfo.email
             }, profile), _profile);

             //set role map
             _roleMap = {};
             if(_profile.roles) {
                _profile.roles.forEach(function (val){
                  _roleMap[val] = true;
                });
             }
             deferred.resolve();
           }, deferred.reject);
       }, deferred.reject);
       return deferred.promise;
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
               if(!_user.username || !_profile.username ||
                 _user.username !== oauthUserInfo.email) {

                 //populate user
                 _clearAndCopy({
                   username: oauthUserInfo.email,
                   picture: oauthUserInfo.picture
                 }, _user);

                 refreshProfile().then(function () {
                   //populate userCompany
                   return getCompany().then(function(company) {
                     _clearAndCopy(company, _userCompany);
                     _clearAndCopy(company, _selectedCompany);

                   }, function () { _clearObj(_userCompany);
                   }).finally(function () {
                    authorizeDeferred.resolve(authResult);
                    $rootScope.$broadcast("risevision.user.authorized");
                    if(!attemptImmediate) {
                      $rootScope.$broadcast("risevision.user.userSignedIn");
                    }
                   });
                 },
                 function () {
                   authorizeDeferred.resolve(authResult);
                   $rootScope.$broadcast("risevision.user.authorized");
                   if(!attemptImmediate) {
                     $rootScope.$broadcast("risevision.user.userSignedIn");
                   }
                 });
               }
               else {authorizeDeferred.resolve(authResult); }
             }, function(err){
               _clearObj(_user);
             authorizeDeferred.reject(err); });
           }
           else {
             _clearObj(_user);
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
                 _clearAccessToken();
                 authenticateDeferred.reject("Authentication Error: " + authResult.error);
               }
             }, function () {
               _clearAccessToken();
               authenticateDeferred.reject();});
           }
           else {
             var msg = "user is not authenticated";
             $log.debug(msg);
             _clearAccessToken();
             authenticateDeferred.reject(msg);
             _clearObj(_user);
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
           _clearObj(_user);
           //call google api to sign out
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
      if(!_user.username) {return false; }
      else { return true; }
    };

    var isRiseVisionUser = function () {
      return _profile.username !== null &&
        _profile.username !== undefined;
    };

    var hasRole = function (role) {
      return angular.isDefined(_roleMap[role]);
    };

    var userState = {
      getUserCompanyId: function () {
        return (_userCompany && _userCompany.id) || null; },
      getSelectedCompanyId: function () {
        return (_selectedCompany && _selectedCompany.id) || null; },
      getSelectedCompanyName: function () {
        return (_selectedCompany && _selectedCompany.name) || null;},
      updateCompanySettings: function (company) {
        if (company && _selectedCompany) {
          _clearAndCopy(company, _selectedCompany);
          if (_userCompany.id === _selectedCompany.id) {
            _clearAndCopy(company, _userCompany);
          }
        }
      },
      getSelectedCompanyCountry: function () {
          return (_selectedCompany && _selectedCompany.country) || null;},
      getUsername: function () {
        return (_user && _user.username) || null; },
      getCopyOfProfile: function () { return _follow(_profile); },
      resetCompany: function () { _clearAndCopy(_userCompany, _selectedCompany); },
      getCopyOfUserCompany: function () { return _follow(_userCompany); },
      getCopyOfSelectedCompany: function () { return _follow(_selectedCompany); },
      switchCompany: function (company) { _clearAndCopy(company, _selectedCompany); },
      isSubcompanySelected: function () {
        return _selectedCompany && _selectedCompany.id !== (_userCompany && _userCompany.id); },
      getUserPicture: function () { return _user.picture; },
      hasRole: hasRole,
      inRVAFrame: function () {return _inRVAFrame; },
      isRiseAdmin: function () {return hasRole("sa"); },
      isRiseStoreAdmin: function () {return hasRole("ba"); },
      isUserAdmin: function () {return hasRole("ua"); },
      isPurchaser: function () {return hasRole("pu"); },
      isSeller: function () {return (_selectedCompany && _selectedCompany.sellerId) ? true : false; },
      isRiseVisionUser: isRiseVisionUser,
      isLoggedIn: isLoggedIn,
      authenticate: authenticate,
      signOut: signOut,
      refreshProfile: refreshProfile
    };

    window.userState = userState;
    return userState;
  }]);

})(angular);
