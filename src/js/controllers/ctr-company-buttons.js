angular.module("risevision.common.header")
.controller("CompanyButtonsCtrl", [ "$scope", "$modal", "$templateCache",
  "companyService", "$timeout", "switchCompany",
  function($scope, $modal, $templateCache, companyService, $timeout, switchCompany) {

    //reload user companies when current username is changed
    $scope.$watch("userState.user.profile.username", function (newVal) {
      if(newVal) {
        companyService.getUserCompanies()
          //this is needed or shopping cart won't show immediately
          // .then(function (){$timeout(function (){$scope.$digest();});})
          ;
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
          companyId: function () {return companyId; }
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
