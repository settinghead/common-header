angular.module("risevision.common.header")
.controller("AuthButtonsCtr", ["$scope", "$modal", "$templateCache",
  "apiAuth", "userState", "$rootScope", "$loading",
  function($scope, $modal, $templateCache, apiAuth, userState, $rootScope,
  $loading) {

    $scope.spinnerOptions = {color: "#999", hwaccel: true, radius: 10};

    // Login Modal
    $scope.loginModal = function(size) {
      // var modalInstance =
      $modal.open({
        template: $templateCache.get("authorization-modal.html"),
        controller: "AuthModalCtrl",
        size: size
      });
    };

    $scope.authenticate = function() {
      apiAuth.$authenticate(true).finally(function(){
        userState.status = "pendingCheck";
        $loading.start("auth-buttons");
      });
    };

    $scope.logout = function () {
      apiAuth.$signOut().finally(function (){
        userState.status = "pendingCheck";
        $loading.start("auth-buttons");
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

    $scope.$watch("userState.status", function (newStatus){
      if (newStatus === "pendingCheck") {
        $loading.start("auth-buttons");
      }
      else {
        $loading.stop("auth-buttons");
      }
    });
  }
]);
