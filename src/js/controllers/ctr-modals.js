angular.module("risevision.common.header")

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
