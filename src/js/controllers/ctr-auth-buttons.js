angular.module("risevision.common.header")
.controller("AuthButtonsCtr", ["$scope", "$modal", "$templateCache",
  "apiAuth", "userState",
  function($scope, $modal, $templateCache, apiAuth, userState) {
    // Login Modal
    $scope.loginModal = function(size) {
      // var modalInstance =
      $modal.open({
        template: $templateCache.get("authorization-modal.html"),
        controller: "AuthModalCtrl",
        size: size
      });
    };

    $scope.logout = function () {
      apiAuth.$signOut().finally(function (){
        userState.status = "pendingCheck";
      });
    };

    // Show User Settings Modal
    $scope.userSettings = function(size) {
      // var modalInstance =
      $modal.open({
        template: $templateCache.get("user-settings-modal.html"),
        controller: "UserSettingsModalCtrl",
        size: size
      });
    };
    // Show Payment Methods Modal
    $scope.paymentMethods = function(size) {
      // var modalInstance =
      $modal.open({
        template: $templateCache.get("payment-methods-modal.html"),
        controller: "PaymentMethodsModalCtrl",
        size: size
      });
    };
  }
]);
