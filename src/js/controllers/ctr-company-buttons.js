angular.module("risevision.common.header")
.controller("CompanyButtonsCtrl", [ "$scope", "$modal", "$templateCache",
  "switchCompany", "elizaState", "getCompany",
  function($scope, $modal, $templateCache, switchCompany, elizaState, getCompany) {

    getCompany().then(function (company) {
      elizaState.user.company = company;
    });

    //reload user companies when current username is changed
    $scope.$watch("elizaState.user.profile", function (newVal) {
      if(newVal) {
        getCompany().then(function (company) {
          elizaState.user.company = company;
        });
      }
    });

    $scope.$watch("elizaState.user.company.id", function (newVal) {
      if(newVal) {
        elizaState.selectedCompany = elizaState.user.company;
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
              if(elizaState.selectedCompany) {
                cId = elizaState.selectedCompany.id;
              }
              else {
                cId = elizaState.user.company.id;
              }
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
            if(elizaState.selectedCompany) {
              return elizaState.selectedCompany.id;
            }
            else {
              return elizaState.user.company.id;
            }
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
            if(elizaState.selectedCompany) {
              return elizaState.selectedCompany.id;
            }
            else {
              return elizaState.user.company.id;
            }
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
      switchCompany($scope.elizaState.user.company);
    };

    //watch and monitor if current company is a subcompany
    $scope.$watch("elizaState.selectedCompany.id", function (newVal) {
      if(newVal && $scope.elizaState.user && $scope.elizaState.user.company) {
        $scope.elizaState.subCompanySelected = (newVal !== $scope.elizaState.user.company.id);
      }
    });
  }
]);
