angular.module("risevision.common.header")
.controller("CompanyButtonsCtrl", [ "$scope", "$modal", "$templateCache",
  "userState",
  function($scope, $modal, $templateCache, userState) {

    $scope.$watch(function () {return userState.getSelectedCompanyId(); },
    function (newCompanyId) {
      if(newCompanyId) {
        $scope.isSubcompanySelected = userState.isSubcompanySelected();
        $scope.selectedCompanyName = userState.getSelectedCompanyName();
      }
    });

    $scope.$watch(function () {return userState.isRiseVisionUser(); },
    function (isRvUser) {
      $scope.isRiseVisionUser = isRvUser;
      if(isRvUser === true) {
        $scope.isSystemAdmin = userState.hasRole("sa");
        $scope.isPurchaser = userState.hasRole("pu");
      }
    });

    $scope.addSubCompany = function(size) {
      $modal.open({
        template: $templateCache.get("subcompany-modal.html"),
        controller: "SubCompanyModalCtrl",
        size: size
      });
    };

    // Show Company Settings Modal
    $scope.companySettings = function(companyId, size) {
      $modal.open({
        template: $templateCache.get("company-settings-modal.html"),
        controller: "CompanySettingsModalCtrl",
        size: size,
        resolve: {
          companyId: function () {
            return userState.getSelectedCompanyId();
          }
        }
      });
    };

    // Show Company Users Modal
    $scope.companyUsers = function(size) {
      $modal.open({
        template: $templateCache.get("company-users-modal.html"),
        controller: "CompanyUsersModalCtrl",
        size: size,
        backdrop: true,
        resolve: {
          companyId: function () {
            return userState.getSelectedCompanyId();
          }
        }
      });
    };

    $scope.switchCompany = function () {
      var modalInstance = $modal.open({
        template: $templateCache.get("company-selector-modal.html"),
        controller: "companySelectorCtr",
        backdrop: true,
        resolve: {
          companyId: function () {
            return userState.getSelectedCompanyId();
          }
        }
      });
      modalInstance.result.then(userState.switchCompany);
    };

    // Show Move Company Modal
    $scope.moveCompany = function(size) {
      // var modalInstance =
      $modal.open({
        template: $templateCache.get("move-company-modal.html"),
        controller: "MoveCompanyModalCtrl",
        size: size
      });
    };

    $scope.resetCompany = function () {
      userState.resetCompany();
    };

  }
]);
