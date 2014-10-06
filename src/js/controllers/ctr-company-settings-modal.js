angular.module("risevision.common.header")

.controller("CompanySettingsModalCtrl", ["$scope", "$modalInstance",
  "updateCompany", "companyId", "COUNTRIES", "REGIONS_CA", "REGIONS_US",
  "getCompany", "regenerateCompanyField", "$window",
  function($scope, $modalInstance, updateCompany, companyId,
    COUNTRIES, REGIONS_CA, REGIONS_US, getCompany, regenerateCompanyField, 
    $window) {

    $scope.company = {id: companyId};
    $scope.countries = COUNTRIES;
    $scope.regionsCA = REGIONS_CA;
    $scope.regionsUS = REGIONS_US;

    if(companyId) {
      getCompany(companyId).then(
        function (company) {
          $scope.company = company;
        },
        function (resp) {
          alert("An error has occurred. " + resp.error);
        });
    }
    $scope.closeModal = function() {
      $modalInstance.dismiss("cancel");
    };
    $scope.save = function () {
      updateCompany($scope.company.id, $scope.company).then(
        function () {
          $modalInstance.close("success");
        },
        function (error) {
          alert("Error " + error);
        });
    };
    $scope.resetAuthKey = function() {
      if ($window.confirm("Resetting the Company Authentication Key will cause existing Data Gadgets to no longer report data until they are updated with the new Key.")) {
        regenerateCompanyField($scope.company.id, "authKey").then(
          function(resp) {
            $scope.company.authKey = resp.item;
          },
          function (error) {
            alert("Error" + error);
          });
      }
    };
    $scope.resetClaimId = function() {
      if ($window.confirm("Resetting the Company Claim Id will cause existing installations to no longer be associated with your Company.")) {
        regenerateCompanyField($scope.company.id, "claimId").then(
          function(resp) {
            $scope.company.claimId = resp.item;
          },
          function (error) {
            alert("Error" + error);
          });
      }
    };

  }
]);
