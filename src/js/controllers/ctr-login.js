angular.module("risevision.common.header")
.controller("AuthModalCtrl", ["$scope", "$modalInstance", "$window",
  "userState", "$rootScope", "$loading",
  function($scope, $modalInstance, $window, userState, $rootScope, $loading) {
    $loading.stop("authenticate-button");

    $scope.authenticate = function() {
      $loading.start("authenticate-button");
      userState.authenticate(true).then().finally(function(){
        $modalInstance.close("success");
        $loading.stop("authenticate-button");
      });
    };

    $scope.closeModal = function () {
      $modalInstance.dismiss("cancel");
    };
  }
]);
