angular.module("risevision.common.header", [
  "risevision.common.auth",
  "risevision.common.account",
  "risevision.common.gapi",
  "risevision.common.cache",
  "risevision.common.company",
  "risevision.common.localstorage",
  "risevision.common.header.templates",
  "risevision.common.loading",
  "risevision.common.registration",
  "risevision.common.systemmessages",
  "risevision.common.oauth2",
  "risevision.common.geodata",
  "risevision.common.util",
  "risevision.common.userprofile",
  "checklist-model",
  "ui.bootstrap", "ngSanitize", "rvScrollEvent", "ngCsv", "ngTouch"
])
.directive("commonHeader",
  ["$modal", "$rootScope", "$q", "$loading",
   "$interval", "oauthAPILoader", "$log",
    "$templateCache", "userStatusDependencies", "checkUserStatus",
    "userState",
  function($modal, $rootScope, $q, $loading, $interval,
    oauthAPILoader, $log, $templateCache,
    dependencies, checkUserStatus, userState) {
    return {
      restrict: "E",
      template: $templateCache.get("common-header.html"),
      scope: false,
      link: function(scope) {
        scope.navCollapsed = true;

        var termsAndConditions = function (size) {
          var modalInstance = $modal.open({
            template: $templateCache.get("registration-modal.html"),
            controller: "RegistrationModalCtrl",
            size: size,
            backdrop: "static"
          });
          modalInstance.result.finally(function (){
            userState.status = "pendingCheck";
          });
        };

        // If nav options not provided use defaults
        if (!scope.navOptions) {
          scope.navOptions = [{
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

        $rootScope.$watch("userState.status", function (newStatus, oldStatus){
          if(newStatus) {
            $log.debug("status changed from", oldStatus, "to", newStatus);
            //render a dialog based on the state user is in
            if(newStatus === "basicProfileCreated") {
              termsAndConditions();
            }
            else if(newStatus !== "acceptableState") {
              checkUserStatus();
            }
          }
        });

        $rootScope.userState = userState;
        userState.status = "pendingCheck";

      }
    };
  }
]);
