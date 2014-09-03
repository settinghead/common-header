angular.module("risevision.common.header")

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

.controller("PaymentMethodsModalCtrl", ["$scope", "$modalInstance", "$modal",
  "$templateCache",
  function($scope, $modalInstance, $modal, $templateCache) {
    $scope.closeModal = function() {
      $modalInstance.dismiss("cancel");
    };
    // Show Payment Methods Modal
    $scope.creditCards = function(size) {
      // var modalInstance =
      $modal.open({
        template: $templateCache.get("credit-cards-modal.html"),
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
