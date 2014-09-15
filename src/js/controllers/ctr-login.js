angular.module("risevision.common.header")
.controller("AuthModalCtrl", ["$scope", "$modalInstance", "$window",
  "authenticate", "$rootScope", "$loading",
  function($scope, $modalInstance, $window, authenticate, $rootScope, $loading) {

    $scope.authenticate = function() {
      $loading.start("authenticate-button");
      authenticate(true).finally(function(){
        $rootScope.userState.status = "pendingCheck";
        $modalInstance.close("success");
        $loading.stop("authenticate-button");
      });
    };

    $scope.closeModal = function () {
      $modalInstance.dismiss("cancel");
    };
  }
]);
