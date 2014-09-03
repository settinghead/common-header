angular.module("risevision.common.header")
  .controller("UserSettingsModalCtrl", [
    "$scope", "$modalInstance", "updateProfile", "getProfile", "userState",
    function($scope, $modalInstance, updateProfile, getProfile) {

      getProfile();

      $scope.closeModal = function() {
        $modalInstance.dismiss("cancel");
      };

      $scope.save = function () {
        updateProfile($scope.userState.user.profile).then(
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
