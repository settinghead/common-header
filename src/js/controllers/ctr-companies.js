angular.module("risevision.common.header")
.controller("SubCompanyModalCtrl", ["$scope", "$modalInstance", "$modal",
  function($scope, $modalInstance, $modal) {
    $scope.closeModal = function() {
      $modalInstance.dismiss("cancel");
    };
    // Show Move Company Modal
    $scope.moveCompany = function(size) {
      // var modalInstance =
      $modal.open({
        templateUrl: "move-company-modal.html",
        controller: "MoveCompanyModalCtrl",
        size: size
      });
    };
  }
])
.controller("MoveCompanyModalCtrl", ["$scope", "$modalInstance",
  function($scope, $modalInstance) {
    $scope.closeModal = function() {
      $modalInstance.dismiss("cancel");
    };
  }
])
.controller("CompanySettingsModalCtrl", ["$scope", "$modalInstance",
  "companyService", "companyId", "COUNTRIES",
  function($scope, $modalInstance, companyService, companyId,
  COUNTRIES) {
    $scope.company = {id: companyId};
    $scope.countries = COUNTRIES;
    if(companyId) {
      companyService.getCompany(companyId).then(
        function (company) {
          $scope.company = company;
        },
        function (resp) {
          alert("An error has occurred.", resp.error);
        });
    }
    $scope.save = function () {
      companyService.updateCompany($scope.company).then(
        function () {
          $modalInstance.close("success");
        },
      function (error) {
        alert("Error", error);
      });
    };
  }
]);
