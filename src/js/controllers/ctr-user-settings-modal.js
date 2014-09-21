angular.module("risevision.common.header")

  .controller("AddUserModalCtrl", ["$scope", "addUser", "$modalInstance", "companyId",
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
    "$scope", "$modalInstance", "updateUser", "getUser", "deleteUser",
    "addUser", "username", "userRoleMap", "$log", "$loading",
    function($scope, $modalInstance, updateUser, getUser, deleteUser,
      addUser, username, userRoleMap, $log, $loading) {

      //push roles into array
      $scope.availableRoles = [];
      angular.forEach(userRoleMap, function (v, k) {
        $scope.availableRoles.push({key: k, name: v});
      });

      $scope.username = username;

      getUser(username).then(function (user) {
        $scope.user = user;
      });

      $scope.closeModal = function() {
        $modalInstance.dismiss("cancel");
      };

      $scope.deleteUser = function () {
        if (confirm("Are you sure you want to delete this user?")) {
          deleteUser().finally($modalInstance.dismiss("deleted"));
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
        ).finally(function (){$loading.stop("user-settings-modal");});
      };
    }
  ]);
