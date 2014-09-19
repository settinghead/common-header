angular.module("risevision.common.header")

  .filter("roleLabel", ["userRoleMap", function (userRoleMap) {
    return function (key) {
      return userRoleMap[key];
    };
  }])

  .controller("CompanyUsersModalCtrl", ["$scope", "$modalInstance", "$modal",
    "$templateCache", "companyId", "getUsers",
    function($scope, $modalInstance, $modal, $templateCache, companyId, getUsers) {

      $scope.sort = {
        field: "username",
        descending: false
      };

      $scope.changeSorting = function(field) {
        var sort = $scope.sort;

        if (sort.field === field) {
            sort.descending = !sort.descending;
        } else {
            sort.field = field;
            sort.descending = false;
        }
      };

      var loadUsers = function () {
        getUsers({companyId: companyId}).then(function (users) {
          $scope.users = users;
        });
      };

      loadUsers();

      $scope.addUser = function (size) {
        var instance = $modal.open({
          template: $templateCache.get("user-settings-modal.html"),
          controller: "AddUserModalCtrl",
          size: size,
          resolve: { companyId: function () {return companyId; } }
        });
        instance.result.finally(loadUsers);
      };

      $scope.editUser = function (username, size) {
        var instance = $modal.open({
          template: $templateCache.get("user-settings-modal.html"),
          controller: "UserSettingsModalCtrl",
          size: size,
          resolve: {username: function (){ return username; },
          add: function () {return false; }}
        });
        instance.result.finally(loadUsers);
      };

      $scope.closeModal = function() {
        $modalInstance.dismiss("cancel");
      };
    }
  ]);
