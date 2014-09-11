angular.module("risevision.common.header")
.controller("CompanyButtonsCtrl", [ "$scope", "$modal", "$templateCache",
  "getUserCompanies", "$timeout", "switchCompany",
  function($scope, $modal, $templateCache, getUserCompanies, $timeout, switchCompany) {

    //reload user companies when current username is changed
    $scope.$watch("userState.user.profile.username", function (newVal) {
      if(newVal) {
        getUserCompanies();
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
            var cId = companyId;
            if(!cId) {
              cId = $scope.userState.selectedCompanyId;
            }
            return cId;
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
            return $scope.userState.selectedCompanyId;
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
            return $scope.userState.selectedCompanyId;
          }
        }
      });
      modalInstance.result.then(switchCompany);
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
      switchCompany($scope.userState.user.company);
    };

    //watch and monitor if current company is a subcompany
    $scope.$watch("userState.selectedCompanyId", function (newVal) {
      if(newVal && $scope.userState.user && $scope.userState.user.company) {
        $scope.userState.subCompanySelected = (newVal !== $scope.userState.user.company.id);
      }
    });
  }
]);
