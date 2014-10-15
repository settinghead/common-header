angular.module("risevision.common.header")
.controller("SubCompanyModalCtrl", ["$scope", "$modalInstance", "$modal",
  "$templateCache", "createCompany", "COUNTRIES", "REGIONS_CA", "REGIONS_US",
  "userState", "$loading", "humanReadableError",
  function($scope, $modalInstance, $modal, $templateCache,
    createCompany, COUNTRIES, REGIONS_CA, REGIONS_US, userState, $loading,
    humanReadableError) {

    $scope.company = {};
    $scope.countries = COUNTRIES;
    $scope.regionsCA = REGIONS_CA;
    $scope.regionsUS = REGIONS_US;

    $scope.forms = {};

    $scope.$watch("loading", function (loading) {
      if(loading) { $loading.start("add-subcompany-modal"); }
      else { $loading.stop("add-subcompany-modal"); }
    });

    $scope.closeModal = function() {
      $modalInstance.dismiss("cancel");
    };
    $scope.save = function () {
      $scope.loading = true;
      createCompany(userState.getSelectedCompanyId(),
        $scope.company).then(function () {
        $modalInstance.close("success");
      }, function (err) {alert("Error: " + humanReadableError(err)); })
      .finally(function () {$scope.loading = false; });
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
  }
])

.controller("companySelectorCtr", ["$scope", "$modalInstance",
    "companyService", "companyId", "BaseList", "$loading",
    function ($scope, $modalInstance, companyService,
      companyId, BaseList, $loading) {

    var DB_MAX_COUNT = 20; //number of records to load at a time

    $scope.companies = new BaseList(DB_MAX_COUNT);
    $scope.search = {
        searchString: ""
    };

    $scope.$watch("loading", function (loading) {
      if(loading) {
        $loading.start("company-selector-modal");
        $loading.start("company-selector-modal-list"); }
      else { $loading.stop("company-selector-modal");
      $loading.stop("company-selector-modal-list"); }
    });

    $scope.closeModal = function () {
        $modalInstance.dismiss("cancel");
    };

    function loadCompanies() {
      $scope.loading = true;
      if (!$scope.companies.endOfList) {
        companyService.getCompanies(
          companyId, $scope.search.searchString,
          $scope.companies.cursor, DB_MAX_COUNT, null).then(function (result) {
          if (result && result.items) {
            $scope.companies.add(result.items, result.cursor);
          }
        }).finally(function () {
          $scope.loading = false;
        });
      }
    }

    if ($scope.companies.list.length === 0) {
      loadCompanies();
    }

    $scope.doSearch = function () {
      $scope.companies.clear();
      loadCompanies();
    };

    $scope.setCompany = function (company) {
      $modalInstance.close(company);
    };

    $scope.handleScroll = function (event, isEndEvent) {
      // $log.debug(event.target.scrollTop + " / " + event.target.scrollHeight + " / " + isEndEvent);
      if (isEndEvent) {
        if ((event.target.scrollHeight - event.target.clientHeight - event.target.scrollTop) < 20) {
          //load more rows if less than 20px left to the bottom
          loadCompanies();
        }
      }
    };

    $scope.getFullAddress = function (company) {
      var res = (company.street ? company.street + ", " : "") + 
        (company.city ? company.city + ", " : "") +
        (company.province ? company.province + ", " : "") +
        (company.country ? company.country + ", " : "") +
        (company.postalCode ? company.postalCode + ", " : "");
      if (res) {
        res = res.substr(0, res.length - 2);
      }
      return res;
    };

}
]);
