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
    "userState",
  function($modal, $rootScope, $q, $loading, $interval,
    oauthAPILoader, $log, $templateCache, userState) {
    return {
      restrict: "E",
      template: $templateCache.get("common-header.html"),
      scope: false,
      link: function($scope) {
        $scope.navCollapsed = true;

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

        $scope.$watch(function () { return userState.isRiseVisionUser(); },
        function (isRvUser) { $scope.isRiseVisionUser = isRvUser; });

      }
    };
  }
])
.directive("ngEnter", function() {
        return function(scope, element, attrs) {
            element.bind("keydown keypress", function(event) {
                if(event.which === 13) {
                        scope.$apply(function(){
                                scope.$eval(attrs.ngEnter);
                        });

                        event.preventDefault();
                }
            });
        };
});
