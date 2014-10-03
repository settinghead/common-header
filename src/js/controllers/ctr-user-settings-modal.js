angular.module("risevision.common.header")

  .controller("AddUserModalCtrl",
  ["$scope", "addUser", "$modalInstance", "companyId",
  function ($scope, addUser, $modalInstance, companyId) {
    $scope.user = {};


    $scope.save = function () {
      addUser(companyId, $scope.user.email, $scope.user).then(
        function () {
          $modalInstance.close("success");
        },
        function (error) {
          alert("Error", error);
        }
      );
    };

    $scope.closeModal = function() {
      $modalInstance.dismiss("cancel");
    };
  }])

  .controller("UserSettingsModalCtrl", [
    "$scope", "$modalInstance", "updateUser", "getUserProfile", "deleteUser",
    "addUser", "username", "userRoleMap", "$log", "$loading", "userState",
    "uiStatusManager",
    function($scope, $modalInstance, updateUser, getUserProfile, deleteUser,
      addUser, username, userRoleMap, $log, $loading, userState,
      uiStatusManager) {

      //push roles into array
      $scope.availableRoles = [];
      angular.forEach(userRoleMap, function (v, k) {
        $scope.availableRoles.push({key: k, name: v});
      });

      var company = userState.getCopyOfSelectedCompany();

      $scope.showEmailCampaign = company.mailSyncEnabled;
      $scope.isUserAdmin = userState.isUserAdmin();
      $scope.username = username;
      $scope.isAdd = !username;

      getUserProfile(username).then(function (user) {
        $scope.user = user;
      });

      $scope.closeModal = function() {
        $modalInstance.dismiss("cancel");
      };

      $scope.deleteUser = function () {
        if (confirm("Are you sure you want to delete this user?")) {
          deleteUser($scope.username)
            .then(function () {
              if($scope.username === userState.getUsername()) {
                userState.signOut().then().finally(function() {
                  uiStatusManager.invalidateStatus("registrationComplete");
                });
              }
            })
            .finally(function () {
              $modalInstance.dismiss("deleted");
            });
        }
      };

      $scope.save = function () {
        $loading.start("user-settings-modal");

        updateUser(username, $scope.user).then(
          function () {
            $modalInstance.close("success");
          },
          function (error) {
            $log.debug(error);
            alert("Error: " + error.message);
          }
        ).finally(function (){
          if(username === userState.getUsername()) {
            userState.refreshProfile();
          }
          $loading.stop("user-settings-modal");});
      };

      $scope.editRoleAllowed = function (role) {
        if (role.key === "ua" && $scope.username === userState.getUsername()) {
          //do not allow users to uncheck admin role for themselves
          return false;
        }
        else {
          //allow user to check/uncheck role by default
          return true;
        }
      };
    }
  ]);
