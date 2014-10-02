angular.module("risevision.common.header", [
  "risevision.common.userstate",
  "risevision.common.account",
  "risevision.common.gapi",
  "risevision.common.cache",
  "risevision.common.company",
  "risevision.common.localstorage",
  "risevision.common.header.templates",
  "risevision.common.loading",
  "risevision.common.userstate",   "risevision.common.ui-status",
  "risevision.common.systemmessages",
  "risevision.common.oauth2",
  "risevision.common.geodata",
  "risevision.common.util",
  "risevision.common.userprofile",
  "risevision.common.registration",
  "risevision.common.shoppingcart",
  "checklist-model",
  "ui.bootstrap", "ngSanitize", "rvScrollEvent", "ngCsv", "ngTouch"
])
.directive("commonHeader",
  ["$modal", "$rootScope", "$q", "$loading",
   "$interval", "oauthAPILoader", "$log",
    "$templateCache",
    "userState", "uiStatusManager",
  function($modal, $rootScope, $q, $loading, $interval,
    oauthAPILoader, $log, $templateCache, userState, uiStatusManager) {
    return {
      restrict: "E",
      template: $templateCache.get("common-header.html"),
      scope: false,
      link: function($scope) {
        $scope.navCollapsed = true;

        var showTermsAndConditions = function (size) {
          var modalInstance = $modal.open({
            template: $templateCache.get("registration-modal.html"),
            controller: "RegistrationModalCtrl",
            size: size,
            backdrop: "static"
          });
          modalInstance.result.finally(function (){
            uiStatusManager.invalidateStatus();
          });
        };

        // If nav options not provided use defaults
        if (!$scope.navOptions) {
          $scope.navOptions = [{
            title: "Home",
            link: "#/"
          }, {
            title: "Store",
            link: ""
          }, {
            title: "Account",
            link: ""
          }, {
            title: "Sellers",
            link: ""
          }, {
            title: "Platform",
            link: "http://rva.risevision.com/",
            target: "_blank"
          }];
        }

        $scope.$watch(function () { return userState.getSelectedCompanyId(); },
        function (selectedCompanyId) {
          if(selectedCompanyId) {
            $scope.isSubcompanySelected = userState.isSubcompanySelected();
            $scope.selectedCompanyName = userState.getSelectedCompanyName();
          }
        });

        $scope.$watch(function () { return userState.isRiseVisionUser(); },
        function (isRvUser) { $scope.isRiseVisionUser = isRvUser; });

        //render dialogs based on status the UI is stuck on
        $scope.$watch(function () { return uiStatusManager.getStatus(); },
        function (newStatus, oldStatus){
          if(newStatus) {
            $log.debug("status changed from", oldStatus, "to", newStatus);

            //render a dialog based on the status current UI is in
            if(newStatus === "registerdAsRiseVisionUser") {
              showTermsAndConditions();
            }
          }
        });
      }
    };
  }
]);
