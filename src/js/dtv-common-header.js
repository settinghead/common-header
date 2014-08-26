angular.module("risevision.common.header", [
  "risevision.common.auth",
  "risevision.common.gapi",
  "risevision.common.cache",
  "risevision.common.company",
  "risevision.common.localstorage",
  "risevision.common.header.templates",
  "risevision.common.loading",
  "risevision.common.registration",
  "risevision.common.oauth2",
  "risevision.common.geodata",
  "risevision.common.shoppingcart",
  "ui.bootstrap"
])
.directive("commonHeader",
  ["$modal", "$rootScope", "$q", "apiAuth", "$loading",
   "$interval", "oauthAPILoader", "$log",
    "$templateCache", "userStatusDependencies", "checkUserStatus",
    "userState",
  function($modal, $rootScope, $q, apiAuth, $loading, $interval,
    oauthAPILoader, $log, $templateCache,
    dependencies, checkUserStatus, userState) {
    return {
      restrict: "E",
      template: $templateCache.get("common-header.html"),
      scope: false,
      link: function(scope) {
        scope.navCollapsed = true;

        // $rootScope.$on("rvAuth.$authenticate", function() {
        //   getUserCompanies();
        // });

        scope.termsAndConditions = function (size) {
          var modalInstance = $modal.open({
            template: $templateCache.get("terms-and-conditions-modal.html"),
            controller: "TermsConditionsModalCtrl",
            size: size,
            backdrop: "static"
          });
          modalInstance.result.finally(function (){
            userState.status = "pendingCheck";
          });
        };

        scope.updateProfile = function (size) {
          $modal.open({
            templateUrl: "create-profile.html",
            controller: "CreateProfileModalCtrl",
            size: size
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
            $log.debug("statusChange from", oldStatus, "to", newStatus);
            //render a dialog based on the state user is in
            if(newStatus === "termsConditionsAccepted") {
              scope.termsAndConditions();
            }
            else if(newStatus !== "acceptableState") {
              checkUserStatus();
            }
          }
        });

        $rootScope.userState = userState;
        // apiAuth.init();
        userState.status = "pendingCheck";

      }
    };
  }
]);
