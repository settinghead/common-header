angular.module("risevision.common.header", [
  "risevision.common.auth",
  "risevision.common.gapi",
  "risevision.common.cache",
  "risevision.common.company",
  "risevision.common.localstorage",
  "risevision.common.header.templates",
  "risevision.common.loading",
  "risevision.common.registration",
  "ui.bootstrap"
])
.directive("commonHeader",
  ["$modal", "$rootScope", "$q", "apiAuth", "$loading",
   "$interval", "oauthAPILoader", "cacheService", "$log",
    "$templateCache", "userStatusDependencies", "checkUserStatus",
  function($modal, $rootScope, $q, apiAuth, $loading, $interval,
    oauthAPILoader, cacheService, $log, $templateCache,
    dependencies, checkUserStatus) {
    return {
      restrict: "E",
      template: $templateCache.get("common-header.html"),
      scope: false,
      link: function(scope) {
        scope.navCollapsed = true;

        $rootScope.$on("rvAuth.$authenticate", function() {
          $rootScope.userState = apiAuth.getUserState();
        });

        $rootScope.$on("rvAuth.$signOut", function () {
          $rootScope.userState = apiAuth.getUserState();
        });

        // Login Modal
        scope.loginModal = function(size) {
          // var modalInstance =
          $modal.open({
            templateUrl: "authorization-modal.html",
            controller: "AuthModalCtrl",
            size: size
          });
        };

        scope.logout = function () {
          apiAuth.$signOut();
        };

        // Show Add Sub-Company Modal
        scope.addSubCompany = function(size) {
          // var modalInstance =
          $modal.open({
            templateUrl: "sub-company-modal.html",
            controller: "SubCompanyModalCtrl",
            size: size
          });
        };
        // Show Company Settings Modal
        scope.companySettings = function(companyId, size) {
          // var modalInstance =
          $modal.open({
            templateUrl: "company-settings-modal.html",
            controller: "CompanySettingsModalCtrl",
            size: size,
            resolve: {
              companyId: function () {return companyId; }
            }
          });
        };
        // Show User Settings Modal
        scope.userSettings = function(size) {
          // var modalInstance =
          $modal.open({
            templateUrl: "user-settings-modal.html",
            controller: "UserSettingsModalCtrl",
            size: size
          });
        };
        // Show Payment Methods Modal
        scope.paymentMethods = function(size) {
          // var modalInstance =
          $modal.open({
            templateUrl: "payment-methods-modal.html",
            controller: "PaymentMethodsModalCtrl",
            size: size
          });
        };

        scope.termsAndConditions = function (size) {
          $modal.open({
            templateUrl: "terms-and-conditions.html",
            controller: "TermsConditionsModalCtrl",
            size: size
          });
        };

        scope.updateProfile = function (size) {
          $modal.open({
            templateUrl: "create-profile.html",
            controller: "CreateProfileModalCtrl",
            size: size
          });
        };

        // If nav options not provided use defaults
        if (!scope.navOptions) {
          scope.navOptions = [{
            title: "Home",
            link: "#/"
          }, {
            title: "Store",
            link: ""
          }, {
            title: "Account",
            link: ""
          }, {
            title: "Sellers",
            link: ""
          }, {
            title: "Platform",
            link: "http://rva.risevision.com/",
            target: "_blank"
          }];
        }

        $rootScope.$watch("userState.status", function (newStatus, oldStatus){
          if(newStatus && newStatus !== oldStatus) {
            $log.debug("statusChange from", oldStatus, "to", newStatus);

            if(newStatus === "termsConditionsAccepted") {
              scope.termsAndConditions();
            }
            else if (newStatus === "profileUpdated") {
              scope.updateProfile();
            }
            else if (newStatus === "companyCreated") {
              //no company id
              scope.companySettings(null);
            }
            else if(newStatus !== "registrationComplete") {
              checkUserStatus($rootScope.userState);
            }
          }
        });

        $rootScope.$watch("userState.authStatus", function (newVal) {
          if(newVal === -1) {
            apiAuth.$authenticate(false);
          }
        });

      }
    };
  }
])
.controller("AuthModalCtrl", ["$scope", "$modalInstance", "$window",
  "apiAuth",
  function($scope, $modalInstance, $window, apiAuth) {

    $scope.authenticate = function() {
      apiAuth.$authenticate(true);
      $modalInstance.dismiss();
    };

  }
])
.controller("SubCompanyModalCtrl", ["$scope", "$modalInstance", "$modal",
  function($scope, $modalInstance, $modal) {
    $scope.closeModal = function() {
      $modalInstance.dismiss("cancel");
    };
    // Show Move Company Modal
    $scope.moveCompany = function(size) {
      // var modalInstance =
      $modal.open({
        templateUrl: "move-company-modal.html",
        controller: "MoveCompanyModalCtrl",
        size: size
      });
    };
  }
])
.controller("TermsConditionsModalCtrl", [
  "$scope", "$modalInstance", "$rootScope", "acceptTermsAndConditions",
  function($scope, $modalInstance, $rootScope, acceptTermsAndConditions) {
    $scope.profile = {};
    $scope.closeModal = function() {
      $modalInstance.dismiss("cancel");
      $rootScope.userState.status = "pendingCheck";
    };
    $scope.agree = function () {
      acceptTermsAndConditions($scope.profile).then(function () {
        $modalInstance.close("success");
        $rootScope.userState.status = "pendingCheck";
      });
    };
  }
])
.controller("CreateProfileModalCtrl", [
  "$scope", "$modalInstance", "$rootScope", "updateProfile",
  function($scope, $modalInstance, $rootScope, updateProfile) {

    $scope.profile = {};

    $scope.closeModal = function() {
      $modalInstance.dismiss("cancel");
      $rootScope.userState.status = "pendingCheck";
    };
    $scope.continue = function () {
      updateProfile($scope.profile).then(function () {
        $modalInstance.close("success");
        $rootScope.userState.status = "pendingCheck";
      });
    };
  }
])
.controller("MoveCompanyModalCtrl", ["$scope", "$modalInstance",
  function($scope, $modalInstance) {
    $scope.closeModal = function() {
      $modalInstance.dismiss("cancel");
    };
  }
])
.controller("CompanySettingsModalCtrl", ["$scope", "$modalInstance",
  "companyService", "companyId", "$rootScope",
  function($scope, $modalInstance, companyService, companyId, $rootScope) {
    $scope.company = {id: companyId};
    $scope.closeModal = function() {
      $modalInstance.dismiss("cancel");
      if(!companyId) {
        $rootScope.userState.status = "pendingCheck";
      }
    };
    $scope.save = function () {
      companyService.createOrUpdateCompany($scope.company).then(
        function () {
          $modalInstance.close("success");
        },
      function (error) {
        alert("Error", error);
      });
    };
  }
])
.controller("UserSettingsModalCtrl", ["$scope", "$modalInstance",
  function($scope, $modalInstance) {
    $scope.closeModal = function() {
      $modalInstance.dismiss("cancel");
    };
  }
])
.controller("PaymentMethodsModalCtrl", ["$scope", "$modalInstance", "$modal",
  function($scope, $modalInstance, $modal) {
    $scope.closeModal = function() {
      $modalInstance.dismiss("cancel");
    };
    // Show Payment Methods Modal
    $scope.creditCards = function(size) {
      // var modalInstance =
      $modal.open({
        templateUrl: "credit-cards-modal.html",
        controller: "CreditCardsModalCtrl",
        size: size
      });
    };
  }
])
.controller("CreditCardsModalCtrl", ["$scope", "$modalInstance",
  function($scope, $modalInstance) {
    $scope.closeModal = function() {
      $modalInstance.dismiss("cancel");
    };
  }
]);
