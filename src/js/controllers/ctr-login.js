angular.module("risevision.common.header")
.controller("AuthModalCtrl", ["$scope", "$modalInstance", "$window",
  "authenticate", "$rootScope", "$loading",
  function($scope, $modalInstance, $window, authenticate, $rootScope, $loading) {
    $loading.stop("authenticate-button");

    $scope.authenticate = function() {
      $loading.start("authenticate-button");
      authenticate(true).finally(function(){
        $rootScope.elizaState.status = "pendingCheck";
        $modalInstance.close("success");
        $loading.stop("authenticate-button");
      });
    };

    $scope.closeModal = function () {
      $modalInstance.dismiss("cancel");
    };
  }
]);
