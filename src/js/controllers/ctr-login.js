angular.module("risevision.common.header")
.controller("AuthModalCtrl", ["$scope", "$modalInstance", "$window",
  "userState", "$rootScope", "$loading", "uiStatusManager",
  function($scope, $modalInstance, $window, userState, $rootScope, $loading, uiStatusManager) {
    $loading.stop("authenticate-button");

    $scope.authenticate = function() {
      $loading.start("authenticate-button");
      userState.authenticate(true).then().finally(function(){
        uiStatusManager.invalidateStatus("registrationComplete");
        $modalInstance.close("success");
        $loading.stop("authenticate-button");
      });
    };

    $scope.closeModal = function () {
      $modalInstance.dismiss("cancel");
    };
  }
]);
