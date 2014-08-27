angular.module("risevision.common.header")
.controller("CompanyButtonsCtrl", [ "$scope", "$modal", "$templateCache",
  "getUserCompanies", "$timeout",
  function($scope, $modal, $templateCache, getUserCompanies, $timeout) {

    //reload user companies when current username is changed
    $scope.$watch("userState.user.profile.username", function (newVal) {
      if(newVal) {
        getUserCompanies()
          //this is needed or shopping cart won't show immediately
          .then(function (){$timeout(function (){$scope.$digest();});});
      }
    });

    $scope.addSubCompany = function(size) {
      $modal.open({
        template: $templateCache.get("sub-company-modal.html"),
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
  }
]);
