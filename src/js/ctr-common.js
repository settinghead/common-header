"use strict";

// Create a module for our core Store services
angular.module("risevision.common.header")
    .controller("commonController", ["$scope", "$rootScope", "$sce", "apiAuth", "storeDataService", "$modal", "companyService",
        "commonService", "shoppingCartService", "cacheService", "usSpinnerService", "$loading", "$interval", "$q", "storeAPILoader", "oauthAPILoader", "$window", "$location",
        function ($scope, $rootScope, $sce, apiAuth, apiStore, $modal, companyService,
            commonService, shoppingCart, cache, usSpinnerService, $loading, $interval, $q, storeAPILoader, oauthAPILoader, $window, $location) {

        var AUTH_STATUS_UNDEFINED = -1;
        var AUTH_STATUS_NOT_AUTHENTICATED = 0;
        var AUTH_STATUS_AUTHENTICATED = 1;
        var DEFAULT_PROFILE_PICTURE = "img/user-icon.png";
        $rootScope.user = {
            profile: {
                name: "",
                email: "",
                picture: DEFAULT_PROFILE_PICTURE
            }
        };
        $rootScope.authStatus = AUTH_STATUS_UNDEFINED;     //-1=unknown, 0=not authenticated, 1=authenticated
        $rootScope.isAuthed = false;    //true if authenticated

        $rootScope.isRiseAdmin = false; //Rise Vision Billing Administrator
        $rootScope.isRiseUser = false;

        $scope.thAutoRefresh = null;
        $rootScope.authDeffered = $q.defer();

        $scope.updateAuth = function (authResult) {
          if (authResult && !authResult.error) {
              $interval.cancel($scope.thAutoRefresh);
              $scope.thAutoRefresh = $interval(function(){
                $interval.cancel($scope.thAutoRefresh);
                apiAuth.checkAuth(true);
              }, 55 * 60 * 1000); //refresh every 55 minutes

              $rootScope.authStatus = AUTH_STATUS_AUTHENTICATED;
              $rootScope.isAuthed = true;
              console.log("user is authenticated");
              oauthAPILoader.get();
              storeAPILoader.get();
              var companiesDeferred = $q.defer();
              apiAuth.getUserCompanies().then(function (resp) {
                if (resp.items && resp.items.length > 0) {
                    var company = resp.items[0];
                    $rootScope.user.company = company;
                    $rootScope.isRiseAdmin = company.userRoles && company.userRoles.indexOf("ba") > -1;
                    //release 1 simpification - everyone is Purchaser ("pu" role)
                    $rootScope.isRiseUser = true;
                    companyService.loadSelectedCompany($rootScope.selectedCompanyIdParam, $rootScope.user.company).then(function(loadedCompany) {
                        $rootScope.setSelectedCompany(loadedCompany);
                        $rootScope.setSelectedCompanyIdParam(loadedCompany.id);
                        $rootScope.$broadcast("userCompany.loaded");
                        companiesDeferred.resolve();
                    });
                } else {
                    $rootScope.isRiseAdmin = false;
                    $rootScope.isRiseUser = false;
                    $rootScope.$broadcast("userCompany.none");
                    companiesDeferred.resolve();
                }
              });
              var profileDeferred = $q.defer();
              apiAuth.getProfile().then(function (resp) {
                $rootScope.user.profile.name = resp.name;
                $rootScope.user.profile.email = resp.email;
                $rootScope.user.profile.picture = resp.picture;
                profileDeferred.resolve();
                $rootScope.$broadcast("profile.loaded");
              });

              // this promise is for both the company and profile load, so it signifies complete auth.
              $q.all([profileDeferred.promise, companiesDeferred.promise]).then(function () { $rootScope.authDeffered.resolve(); });
          } else {
            $rootScope.authDeffered.resolve();
            $scope.clearUser();
            console.log("user is not authenticated");
          }
        };

        // initial auth check (silent)
        apiAuth.checkAuth(true).then($scope.updateAuth);

        $rootScope.authStatus = apiAuth.AUTH_STATUS_UNDEFINED; //this value is linked to the UI
        $rootScope.selectedCompany = {};
        $rootScope.isCAD = false;
        $scope.user.profile.picture = apiAuth.DEFAULT_PROFILE_PICTURE;
        $scope.messages = [];
        $scope.defaultSpinnerOptions = $loading.getDefaultSpinnerOptions();
        $scope.companyLoaded = false;

        $scope.shoppingCartItemCount = shoppingCart.getItemCount();
        $scope.$on("cartChanged", function() {
            console.log("Cart Changed!");
            $scope.shoppingCartItemCount = shoppingCart.getItemCount();
        });


        $scope.login = function () {
            apiAuth.checkAuth().then(function () {
                $window.location.reload();
            });
        };

        $scope.logout = function () {
            /* jshint ignore:start */
            logoutFrame.location = "https://www.google.com/accounts/Logout";
            /* jshint ignore:end */
            $scope.clearUser();
            $interval.cancel($scope.thAutoRefresh);
            $rootScope.$broadcast("user.signout");
        };

        $scope.clearUser = function () {
            $rootScope.authStatus = AUTH_STATUS_NOT_AUTHENTICATED;
            $rootScope.isAuthed = false;
            $rootScope.isRiseAdmin = false;
            $rootScope.isRiseUser = false;
            $rootScope.user.profile.name = "";
            $rootScope.user.profile.email = "";
            $rootScope.user.profile.picture = DEFAULT_PROFILE_PICTURE;
            cache.clear();
        };

        $scope.updateAuthStatus = function (value) {
            if ($scope.authStatus !== value) {
                $scope.authStatus = value;
                $scope.userProfileName = apiAuth.userProfileName;
                $scope.userProfileEmail = apiAuth.userProfileEmail;
                $scope.userProfilePicture = apiAuth.userProfilePicture;
            }
        };

        $scope.getSystemMessages = function () {
            if (!$rootScope.inRVAFrame) {
                if ($rootScope.isAuthed && $rootScope.user.company) {
                    apiStore.getSystemMessages($rootScope.user.company.id).then(function (result) { $scope.renderSystemMessages(result); });
                }
            }
        };

        $scope.renderSystemMessages = function (items) {
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

            $scope.messages = messages;
        };

        $scope.switchCompany = function () {
            var modalInstance = $modal.open({
                templateUrl: "view/company-selector.html",
                controller: "companySelectorCtr",
                backdrop: true,
                resolve: {
                    companyId: function () {
                        return $rootScope.selectedCompany.id;
                    }
                }
            });
            modalInstance.result.then(function (company) {
                $rootScope.setSelectedCompany(company);
                $rootScope.setSelectedCompanyIdParam(company.id);
            });
        };

        $rootScope.setSelectedCompany = function (company) {
            if (company.id !== $rootScope.selectedCompany.id) {
                angular.copy(company, $rootScope.selectedCompany);
                $rootScope.$broadcast("selectedCompany.changed");
            }
        };

        $rootScope.resetSelectedCompany = function () {
            $rootScope.setSelectedCompany($rootScope.user.company);
            $rootScope.setSelectedCompanyIdParam($rootScope.user.company.id);
        };

        $rootScope.setSelectedCompanyIdParam = function (companyId) {
            $rootScope.selectedCompanyIdParam = companyId;
            $location.search("cid", companyId);
        };

        $scope.isHomeCompany = function () {
            return $rootScope.isRiseUser && ($rootScope.user.company.id === $rootScope.selectedCompany.id);
        };

        $scope.$on("user.signout", function () {
            $scope.companyLoaded = false;
            if (!$scope.$state.is("product_with_name") && !$scope.$state.is("product")) {
                $scope.$state.go("products");
            }
        });

        $scope.$on("userCompany.loaded", function () {
            $scope.companyLoaded = true;
            $scope.getSystemMessages();
        });
    }]);
