angular.module("risevision.common.header")
  .controller("UserSettingsModalCtrl", [
    "$scope", "$modalInstance", "updateUser", "getUser", "userState",
    function($scope, $modalInstance, updateUser, getUser) {

      getUser();

      $scope.closeModal = function() {
        $modalInstance.dismiss("cancel");
      };

      $scope.save = function () {
        updateUser($scope.userState.user.profile).then(
          function () {
            $modalInstance.close("success");
          },
          function (error) {
            alert("Error", error);
          }
        );
      };
    }
  ]);
