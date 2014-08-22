angular.module("risevision.common.header")
.controller("AuthModalCtrl", ["$scope", "$modalInstance", "$window",
  "apiAuth", "$rootScope",
  function($scope, $modalInstance, $window, apiAuth, $rootScope) {
    $scope.authenticate = function() {
      apiAuth.$authenticate(true).finally(function(){
        $rootScope.userState.status = "pendingCheck";
        $modalInstance.dismiss();
      });
    };
  }
]);
