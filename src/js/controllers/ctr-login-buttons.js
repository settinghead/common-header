angular.module("risevision.common.header")
.controller("LoginButtonsCtr", ["$scope", "$modal", "$templateCache",
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
  }
]);
