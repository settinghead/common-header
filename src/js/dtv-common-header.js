angular.module("risevision.common.header", [
  "risevision.common.userstate",
  "risevision.common.account",
  "risevision.common.gapi",
  "risevision.core.cache",
  "risevision.core.company",
  "risevision.common.company",
  "risevision.common.localstorage",
  "risevision.common.header.templates",
  "risevision.common.loading",
  "risevision.common.userstate",   "risevision.ui-flow",
  "risevision.common.systemmessages", "risevision.core.systemmessages",
  "risevision.core.oauth2",
  "risevision.common.geodata",
  "risevision.store.data-gadgets",
  "risevision.common.util",
  "risevision.core.userprofile",
  "risevision.common.registration",
  "risevision.common.shoppingcart",
  "checklist-model",
  "ui.bootstrap", "ngSanitize", "rvScrollEvent", "ngCsv", "ngTouch"
])

.factory("bindToScopeWithWatch", [function () {
  return function (fnToWatch, scopeVar, scope) {
    scope.$watch(function () { return fnToWatch.call(); },
    function (val) { scope[scopeVar] = val; });
  };
}])

.directive("commonHeader",
  ["$modal", "$rootScope", "$q", "$loading",
   "$interval", "oauth2APILoader", "$log",
    "$templateCache", "userState", "$location", "bindToScopeWithWatch",
  function($modal, $rootScope, $q, $loading, $interval,
    oauth2APILoader, $log, $templateCache, userState, $location,
    bindToScopeWithWatch) {
    return {
      restrict: "E",
      template: $templateCache.get("common-header.html"),
      scope: false,
      link: function($scope, element, attr) {
        $scope.navCollapsed = true;
        $scope.inRVAFrame = userState.inRVAFrame();

        // If nav options not provided use defaults
        if (!$scope[attr.navOptions]) {
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

        //default to true
        $scope.hideShoppingCart = attr.hideShoppingCart &&
          attr.hideShoppingCart !== "0" && attr.hideShoppingCart !== "false";

        bindToScopeWithWatch(userState.isRiseVisionUser, "isRiseVisionUser", $scope);

        $rootScope.$on("$stateChangeSuccess", function() {
          if ($scope.inRVAFrame) {
            $location.search("inRVA", $scope.inRVAFrame);
          }
        });
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
