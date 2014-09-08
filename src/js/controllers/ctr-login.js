angular.module("risevision.common.header")
.controller("AuthModalCtrl", ["$scope", "$modalInstance", "$window",
  "authenticate", "$rootScope",
  function($scope, $modalInstance, $window, authenticate, $rootScope) {

    $scope.authenticate = function() {
      authenticate(true).finally(function(){
        $rootScope.userState.status = "pendingCheck";
        $modalInstance.close("success");
      });
    };

    $scope.closeModal = function () {
      $modalInstance.dismiss("cancel");
    };
  }
]);
