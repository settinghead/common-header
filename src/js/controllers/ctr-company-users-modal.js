angular.module("risevision.common.header")

  .controller("CompanyUsersModalCtrl", ["$scope", "$modalInstance", "$modal",
    function($scope, $modalInstance, $modal, $templateCache) {
      $scope.closeModal = function() {
        $modalInstance.dismiss("cancel");
      };
      $scope.userSettings = function(size) {
        $modal.open({
          template: $templateCache.get("user-settings-modal.html"),
          controller: "UserSettingsModalCtrl",
          size: size
        });
      };
    }
  ]);
