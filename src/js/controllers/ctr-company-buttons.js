angular.module("risevision.common.header")
.controller("CompanyButtonsCtrl", [ "$scope", "$modal", "$templateCache",
  "switchCompany", "userState", "getCompany",
  function($scope, $modal, $templateCache, switchCompany, userState, getCompany) {

    getCompany().then(function (company) {
      userState.user.company = company;
    });

    //reload user companies when current username is changed
    $scope.$watch("userState.user.profile", function (newVal) {
      if(newVal) {
        getCompany().then(function (company) {
          userState.user.company = company;
        });
      }
    });

    $scope.$watch("userState.user.company.id", function (newVal) {
      if(newVal) {
        userState.selectedCompany = userState.user.company;
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
              if(userState.selectedCompany) {
                cId = userState.selectedCompany.id;
              }
              else {
                cId = userState.user.company.id;
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
            if(userState.selectedCompany) {
              return userState.selectedCompany.id;
            }
            else {
              return userState.user.company.id;
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
            if(userState.selectedCompany) {
              return userState.selectedCompany.id;
            }
            else {
              return userState.user.company.id;
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
      switchCompany($scope.userState.user.company);
    };

    //watch and monitor if current company is a subcompany
    $scope.$watch("userState.selectedCompany.id", function (newVal) {
      if(newVal && $scope.userState.user && $scope.userState.user.company) {
        $scope.userState.subCompanySelected = (newVal !== $scope.userState.user.company.id);
      }
    });
  }
]);
