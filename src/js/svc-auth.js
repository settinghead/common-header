(function(angular) {
  "use strict";

  angular.module("risevison.common.auth",
    ["risevision.common.gapi", "risevison.common.localstorage"])
    .service("apiAuth", ["$interval", "$rootScope", "$q", "$http",
      "gapiLoader", "storeAPILoader", "oauthAPILoader", "CLIENT_ID",
      "$log", "localStorageService", "$timeout",
      function apiAuthConstructor($interval, $rootScope, $q, $http,
        gapiLoader, storeAPILoader, oauthAPILoader, CLIENT_ID, $log,
        localStorageService, $timeout) {

        var SCOPES = "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile";

        this.AUTH_STATUS_UNDEFINED = -1;
        this.AUTH_STATUS_NOT_AUTHENTICATED = 0;
        this.AUTH_STATUS_AUTHENTICATED = 1;

        var that = this;

        this.checkAuth = function (silentCheck) {
          var deferred = $q.defer();
          gapiLoader.get().then(function (gApi) {
            gApi.auth.authorize({ client_id: CLIENT_ID, scope: SCOPES, immediate: silentCheck}, function (authResult) {
              deferred.resolve(authResult);
            });
          });
          return deferred.promise;
        };

        this.getUserCompanies = function () {
            var deferred = $q.defer();
            storeAPILoader.get().then(function (storeClient) {
              var request = storeClient.usercompanies.get({});
              request.execute(function (resp) {
                deferred.resolve(resp);
              });
            });
            return deferred.promise;
        };

        this.getProfile = function () {
          var deferred = $q.defer();
          oauthAPILoader.get().then(function (gApi) {
            var request = gApi.client.oauth2.userinfo.get({});
            request.execute(function (resp) {
              deferred.resolve(resp);
            });
          });
          return deferred.promise;
        };
  }])

    .value("DEFAULT_PROFILE_PICTURE", "img/user-icon.png")

    .factory("clearUser", ["$rootScope", "cacheService", "apiAuth", "DEFAULT_PROFILE_PICTURE",
      function ($rootScope, cacheService, apiAuth, DEFAULT_PROFILE_PICTURE) {
        return function () {
          $rootScope.userState = $rootScope.userState || {};
          $rootScope.userState.authStatus = apiAuth.AUTH_STATUS_NOT_AUTHENTICATED;
          $rootScope.userState.isAuthed = false;
          $rootScope.userState.isRiseAdmin = false;
          $rootScope.userState.isRiseUser = false;
          $rootScope.userState.user.profile.name = "";
          $rootScope.userState.user.profile.email = "";
          $rootScope.userState.user.profile.picture = DEFAULT_PROFILE_PICTURE;
          cacheService.clear();
        };
    }])

    .factory("login", ["apiAuth", "localStorageService", "$rootScope", "$timeout",
      "authLoader", "updateAuth",
      function (apiAuth, localStorageService, $rootScope, $timeout, authLoader,
      updateAuth){
        return function () {
          apiAuth.checkAuth(false).then(function(authResult) {
            if (authResult && !authResult.error) {
              localStorageService.setItemImmediate("userAuthed", true);
              delete $rootScope.authDeffered;
              updateAuth(authResult);
              $timeout(function() {
                $rootScope.resetUserContextAndReturnToThisState();
              });
            }
          });
        };
    }])

    .factory("logout", ["localStorageService", "$rootScope", "cacheService",
      function (localStorageService, $rootScope, cacheService) {
        return function () {
          localStorageService.removeItemImmediate("userAuthed");
          cacheService.clear();
          localStorageService.setItemImmediate(REDIRECT_TO_STATE_KEY, JSON.stringify({
            name: "root.common.products",
            params: {}
          }));
          $rootScope.$state.go("root.reset");
        };
    }])

    .factory("updateAuth", ["clearUser", "$rootScope", "$log", "$interval", "apiAuth",
    "oauthAPILoader", "$q", "companyService",
      function (clearUser, $rootScope, $log, $interval, apiAuth, oauthAPILoader, $q,
      companyService) {
      var handler = function (authResult) {
        if (authResult && !(authResult instanceof TypeError) && !authResult.error) {
            $interval.cancel($rootScope.thAutoRefresh);
            $rootScope.thAutoRefresh = $interval(function(){
              $interval.cancel($rootScope.thAutoRefresh);
              apiAuth.checkAuth(true);
            }, 55 * 60 * 1000); //refresh every 55 minutes

            $rootScope.userState.authStatus = apiAuth.AUTH_STATUS_AUTHENTICATED;
            $rootScope.userState.isAuthed = true;
            $log.info("user is authenticated");
            $rootScope.$broadcast("user.authenticatd");
            oauthAPILoader.get();

            var companiesDeferred = $q.defer();
            apiAuth.getUserCompanies().then(function (resp) {
              if (resp.items && resp.items.length > 0) {
                  var company = resp.items[0];
                  $rootScope.userState.user.company = company;
                  $rootScope.userState.isRiseAdmin = company.userRoles && company.userRoles.indexOf("ba") > -1;
                  //release 1 simpification - everyone is Purchaser ("pu" role)
                  $rootScope.userState.isRiseUser = true;
                  companyService.loadSelectedCompany($rootScope.userState.selectedCompanyIdParam, $rootScope.userState.user.company).then(function(loadedCompany) {
                      $rootScope.setSelectedCompany(loadedCompany);
                      $rootScope.setSelectedCompanyIdParam(loadedCompany.id);
                      $rootScope.$broadcast("userCompany.loaded");
                      companiesDeferred.resolve();
                  });
              } else {
                  $rootScope.userState.isRiseAdmin = false;
                  $rootScope.userState.isRiseUser = false;
                  $rootScope.$broadcast("userCompany.none");
                  companiesDeferred.resolve();
              }
            });
            var profileDeferred = $q.defer();
            apiAuth.getProfile().then(function (resp) {
              $rootScope.userState.user.profile.name = resp.name;
              $rootScope.userState.user.profile.email = resp.email;
              $rootScope.userState.user.profile.picture = resp.picture;
              profileDeferred.resolve();
              $rootScope.$broadcast("profile.loaded");
            });

            // this promise is for both the company and profile load, so it signifies complete auth.
            $q.all([profileDeferred.promise, companiesDeferred.promise]).then(function () { $rootScope.authDeffered.resolve(); });
        } else {
          if ($rootScope.authDeffered) {
            $rootScope.authDeffered.resolve();
          }
          clearUser();
          $log.info("user is not authenticated");
        }
      };

      return handler;
    }])

    .factory("authLoader", ["$rootScope", "$sce", "apiAuth", "storeDataService",
      "$modal", "companyService", "commonService", "shoppingCartService",
      "cacheService", "usSpinnerService", "$loading", "$interval", "$q",
      "storeAPILoader", "oauthAPILoader", "$window", "$location", "$timeout",
      "localStorageService", "$log", "clearUser", "DEFAULT_PROFILE_PICTURE",
      "updateAuth",
      function ($rootScope, $sce, apiAuth, apiStore, $modal, companyService,
        commonService, shoppingCart, cacheService, usSpinnerService, $loading, $interval,
        $q, storeAPILoader, oauthAPILoader, $window, $location, $timeout,
        localStorageService, $log, clearUser, DEFAULT_PROFILE_PICTURE, updateAuth) {
        return function () {
          if(!$rootScope.authDeffered) {
            // This object is intended to hold anything that should be flushed
            // on login/logout.
            $rootScope.userState = {};



            // a flag signifying the app is being loaded within an iframe in RVA
            $rootScope.userState.inRVAFrame = angular.isDefined($location.search().inRVA);
            $rootScope.userState.alternateStoreAPIBaseURL = $location.search().store_api_base_url;
            $rootScope.userState.selectedCompanyIdParam = $location.search().cid;

            $rootScope.userState.user = {
                profile: {
                    name: "",
                    email: "",
                    picture: DEFAULT_PROFILE_PICTURE
                }
            };

            $rootScope.resetUserContextAndReturnToThisState = function() {
              localStorageService.setItemImmediate(REDIRECT_TO_STATE_KEY, JSON.stringify({
                name: $rootScope.$state.$current.name,
                params: $rootScope.$stateParams
              }));
              return $rootScope.$state.go("root.reset");
            };

            /* Open a url in a blank page without losing the cid query param flag */
            $rootScope.openUrlInNewWindow = function(url) {
              url += url.indexOf("?") === -1 ? "?" : "&";
              url += "cid=" + $rootScope.userState.selectedCompanyIdParam;
              if ($rootScope.userState.alternateStoreAPIBaseURL) {
                url += "&store_api_base_url=" + $rootScope.userState.alternateStoreAPIBaseURL;
              }
              $log.info("Opening new window with URL: ", url);
              $window.open(url, "_blank");
            };

            /**
            *
            * Responsible for opening the modal. Everything else happens ...magically?
            *
            */
            $rootScope.openUserSignInModal = function () {
              $modal.open({
                templateUrl: "view/user-sign-in-modal.html",
                controller: "userSignInModalCtr",
                scope: $rootScope,
                backdrop: true
              });
            };

            $rootScope.getSystemMessages = function () {
                if (!$rootScope.userState.inRVAFrame) {
                    if ($rootScope.userState.isAuthed && $rootScope.userState.user.company) {
                        apiStore.getSystemMessages($rootScope.userState.user.company.id).then(function (result) { $rootScope.renderSystemMessages(result); });
                    }
                }
            };

            $rootScope.renderSystemMessages = function (items) {
              var messages = [];
              var dt = new Date();
              dt.setHours(0,0,0,0);
              if (items) {
                  for (var i = 0; i < items.length; i++) {
                      if (commonService.dateIsInRange(dt, items[i].startDate, items[i].endDate)) {
                          messages.push($sce.trustAsHtml(items[i].text));
                      }
                  }
              }
              $rootScope.messages = messages;
            };

            $rootScope.openSwitchCompanyModal = function () {
              var modalInstance = $modal.open({
                templateUrl: "view/company-selector.html",
                controller: "companySelectorCtr",
                backdrop: true,
                resolve: {
                  companyId: function () {
                    return $rootScope.userState.selectedCompany.id;
                  }
                }
              });
              modalInstance.result.then(function (company) {
                $loading.startContentBackgroundSpinner();
                $rootScope.userState.selectedCompanyIdParam = company.id;
                $rootScope.resetUserContextAndReturnToThisState();
              });
            };

            $rootScope.resetSelectedCompany = function () {
              $loading.startContentBackgroundSpinner();
              $rootScope.userState.selectedCompanyIdParam = $rootScope.userState.user.company.id;
              $rootScope.resetUserContextAndReturnToThisState();
            };

            $rootScope.setSelectedCompany = function (company) {
              if (company.id !== $rootScope.userState.selectedCompany.id) {
                angular.copy(company, $rootScope.userState.selectedCompany);
                $rootScope.$broadcast("selectedCompany.changed");
              }
            };

            $rootScope.isHomeCompany = function () {
              return $rootScope.userState.isRiseUser && ($rootScope.userState.user.company.id === $rootScope.userState.selectedCompany.id);
            };

            $rootScope.resetSelectedCompany = function () {
              $rootScope.setSelectedCompany($rootScope.userState.user.company);
              $rootScope.setSelectedCompanyIdParam($rootScope.userState.user.company.id);
            };

            $rootScope.setSelectedCompanyIdParam = function (companyId) {
              $rootScope.userState.selectedCompanyIdParam = companyId;
              $location.search("cid", companyId);
            };

            $rootScope.userState.authStatus = apiAuth.AUTH_STATUS_UNDEFINED;     //-1=unknown, 0=not authenticated, 1=authenticated
            $rootScope.userState.isAuthed = false;    //true if authenticated

            $rootScope.userState.isRiseAdmin = false; //Rise Vision Billing Administrator
            $rootScope.userState.isRiseUser = false;

            $rootScope.thAutoRefresh = null;
            $rootScope.authDeffered = $q.defer();

            $rootScope.userState.authStatus = apiAuth.AUTH_STATUS_UNDEFINED; //this value is linked to the UI
            $rootScope.userState.selectedCompany = {};
            $rootScope.userState.isCAD = false;
            $rootScope.userState.user.profile.picture = apiAuth.DEFAULT_PROFILE_PICTURE;
            $rootScope.messages = [];
            $rootScope.defaultSpinnerOptions = $loading.getDefaultSpinnerOptions();
            $rootScope.userState.companyLoaded = false;

            $rootScope.shoppingCartItemCount = shoppingCart.getItemCount();
            $rootScope.$on("cartChanged", function() {
              $log.info("Cart Changed!");
              $rootScope.shoppingCartItemCount = shoppingCart.getItemCount();
            });

            $rootScope.$on("userCompany.loaded", function () {
              $rootScope.companyLoaded = true;
              $rootScope.getSystemMessages();
            });

           // initial auth check (silent)
            if (localStorageService.getItem("userAuthed")) {
                apiAuth.checkAuth(true).then(updateAuth);
            }
            else {
              updateAuth({ error: "not authenticated"});
            }
          }

          return $rootScope.authDeffered.promise;
        };
      }]);

})(angular);
