angular.module("risevision.common.header")

.controller("CompanySettingsModalCtrl", ["$scope", "$modalInstance",
  "updateCompany", "companyId", "COUNTRIES", "REGIONS_CA", "REGIONS_US",
  "getCompany",
  function($scope, $modalInstance, updateCompany, companyId,
  COUNTRIES, REGIONS_CA, REGIONS_US, getCompany) {
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
          alert("An error has occurred.", resp.error);
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
        alert("Error", error);
      });
    };
  }
]);
