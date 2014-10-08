angular.module("risevision.common.header")

.controller("CompanySettingsModalCtrl", ["$scope", "$modalInstance",
  "updateCompany", "companyId", "COUNTRIES", "REGIONS_CA", "REGIONS_US",
  "getCompany", "regenerateCompanyField", "$window", "$loading", "humanReadableError",
  "userState", "riseAPI_getCompany", "riseAPI_setCompany",
  function($scope, $modalInstance, updateCompany, companyId,
    COUNTRIES, REGIONS_CA, REGIONS_US, getCompany, regenerateCompanyField,
    $window, $loading, humanReadableError, userState, riseAPI_getCompany,
    riseAPI_setCompany) {

    $scope.company = {id: companyId};
    $scope.countries = COUNTRIES;
    $scope.regionsCA = REGIONS_CA;
    $scope.regionsUS = REGIONS_US;
    $scope.isRiseStoreAdmin = userState.isRiseStoreAdmin();

    $scope.$watch("loading", function (loading) {
      if(loading) { $loading.start("company-settings-modal"); }
      else { $loading.stop("company-settings-modal"); }
    });

    $scope.loading = false;

    $scope.forms = {};

    if(companyId) {
      $scope.loading = true;
      getCompany(companyId, $scope.isRiseStoreAdmin).then(
        function (company) {
          $scope.company = company;
        },
        function (resp) {
          alert("An error has occurred. " + humanReadableError(resp));
        }).finally(function () { $scope.loading = false; });
    }
    $scope.closeModal = function() {
      $modalInstance.dismiss("cancel");
    };
    $scope.save = function () {
      $scope.loading = true;

      // cannot use $q.all because of the specifics of the Core API implementation
      // $q.all([
      //   updateCompany($scope.company.id, $scope.company),
      //   riseAPI_setCompany($scope.company.id, $scope.company)])
      // .then(
      //   function () {
      //     userState.updateCompanySettings($scope.company);
      //     $modalInstance.close("success");
      //   },
      //   function (errors) {
      //     alert("Error(s): " + humanReadableError(errors && errors.length ? errors[0] : {}));
      //   })

      updateCompany($scope.company.id, $scope.company)
      .then(riseAPI_setCompany($scope.company.id, $scope.company))
      .then(
        function () {
          userState.updateCompanySettings($scope.company);
          $modalInstance.close("success");
        })
      .catch(
        function (error) {
          alert("Error(s): " + humanReadableError(error));
        })
      .finally(function () {$scope.loading = false; });
    };
    $scope.resetAuthKey = function() {
      if ($window.confirm("Resetting the Company Authentication Key will cause existing Data Gadgets to no longer report data until they are updated with the new Key.")) {
        regenerateCompanyField($scope.company.id, "authKey").then(
          function(resp) {
            $scope.company.authKey = resp.item;
          },
          function (error) {
            alert("Error: " + humanReadableError(error));
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
            alert("Error: " + humanReadableError(error));
          });
      }
    };

  }
]);
