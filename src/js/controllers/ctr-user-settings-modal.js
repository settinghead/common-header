angular.module("risevision.common.header")

  .controller("AddUserModalCtrl",
  ["$scope", "addUser", "$modalInstance", "companyId", "userState",
  "userRoleMap", "humanReadableError",
  function ($scope, addUser, $modalInstance, companyId, userState,
  userRoleMap, humanReadableError) {
    $scope.user = {};
    $scope.isAdd = true;

    //push roles into array
    $scope.availableRoles = [];
    angular.forEach(userRoleMap, function (v, k) {
      $scope.availableRoles.push({key: k, name: v});
    });

    $scope.save = function () {
      addUser(companyId, $scope.user.username, $scope.user).then(
        function () {
          $modalInstance.close("success");
        },
        function (error) {
          alert("Error" + humanReadableError(error));
        }
      );
    };

    $scope.closeModal = function() {
      $modalInstance.dismiss("cancel");
    };

    $scope.editRoleAllowed = function (role) {
      if(userState.isRiseAdmin()) {
        return true;
      }
      else if (userState.isUserAdmin()) {
        if(role.key === "sa" || role.key === "ba") {
          return false;
        }
        else {
          return true;
        }
      }
      else {
        //do not allow user to check/uncheck role by default
        return false;
      }
    };

    $scope.editRoleVisible = function (role) {
      if(userState.isRiseAdmin()) {
        return true;
      }
      else if (userState.isUserAdmin() || userState.isRiseVisionUser()) {
        if(role.key === "sa" || role.key === "ba") {
          return false;
        }
        else {
          return true;
        }
      }
      else {
        // in practice should never reach here
        return false;
      }
    };
  }])

  .controller("UserSettingsModalCtrl", [
    "$scope", "$modalInstance", "updateUser", "getUserProfile", "deleteUser",
    "addUser", "username", "userRoleMap", "$log", "$loading", "userState",
    "uiStatusManager", "humanReadableError",
    function($scope, $modalInstance, updateUser, getUserProfile, deleteUser,
      addUser, username, userRoleMap, $log, $loading, userState,
      uiStatusManager, humanReadableError) {

      //push roles into array
      $scope.availableRoles = [];
      angular.forEach(userRoleMap, function (v, k) {
        $scope.availableRoles.push({key: k, name: v});
      });

      var company = userState.getCopyOfSelectedCompany();

      $scope.showEmailCampaign = company.mailSyncEnabled;
      $scope.isUserAdmin = userState.isUserAdmin();
      $scope.username = username;

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
            alert("Error: " + humanReadableError(error));
          }
        ).finally(function (){
          if(username === userState.getUsername()) {
            userState.refreshProfile();
          }
          $loading.stop("user-settings-modal");});
      };

      $scope.editRoleAllowed = function (role) {
        if(userState.isRiseAdmin()) {
          return true;
        }
        else if (userState.isUserAdmin()) {
          if(role.key === "sa" || role.key === "ba") {
            return false;
          }
          else {
            return true;
          }
        }
        else {
          //do not allow user to check/uncheck role by default
          return false;
        }
      };

      $scope.editRoleVisible = function (role) {
        if(userState.isRiseAdmin()) {
          return true;
        }
        else if (userState.isUserAdmin() || userState.isRiseVisionUser()) {
          if(role.key === "sa" || role.key === "ba") {
            return false;
          }
          else {
            return true;
          }
        }
        else {
          // in practice should never reach here
          return false;
        }
      };
    }
  ]);
