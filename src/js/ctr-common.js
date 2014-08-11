"use strict";

// Create a module for our core Store services
angular.module("risevision.common.header")
    .controller("commonController", ["$scope", "$rootScope", "$sce", "apiAuth", "storeDataService", "$modal", "companyService",
        "commonService", "shoppingCartService", "cacheService", "usSpinnerService", "$loading", "$interval", "$q", "storeAPILoader", "oauthAPILoader", "$window", "$location",
        function ($scope, $rootScope, $sce, apiAuth, apiStore, $modal, companyService,
            commonService, shoppingCart, cache, usSpinnerService, $loading, $interval, $q, storeAPILoader, oauthAPILoader, $window, $location) {


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

        $scope.isHomeCompany = function () {
            return $rootScope.isRiseUser && ($rootScope.user.company.id === $rootScope.selectedCompany.id);
        };


    }]);
