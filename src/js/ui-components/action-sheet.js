// ------------------------------------
// Action Sheet
// ------------------------------------
angular.module("risevision.common.header")
  .directive("actionSheet", ["$document", "$compile", function($document, $compile) {
    return {
      restrict: "A",
      link: function (scope, iElement, iAttrs) {

        var body = $document.find("body").eq(0);
        var isVisible = false;
        var backdropDomEl = document.getElementById("action-sheet-backdrop");

        if (!angular.isObject(backdropDomEl)) {
          backdropDomEl = angular.element("<div id=\"action-sheet-backdrop\" class=\"modal-backdrop\"></div>");
          body.append(backdropDomEl);
        } else {
          backdropDomEl = angular.element(backdropDomEl);
        }

        scope.templateUrl = scope.$eval(iAttrs.actionSheet);
        scope.title = scope.$eval(iAttrs.title);

        var angularDomEl = angular.element("<div class=\"action-sheet\"><ng-include src=\"templateUrl\"></ng-include></div>");

        var actionSheetDomEl = $compile(angularDomEl)(scope);
        body.append(actionSheetDomEl);

        var toggle = function () {
          isVisible = !isVisible;
          actionSheetDomEl.toggleClass("is-action-sheet-opened");
          backdropDomEl.toggleClass("is-action-sheet-opened");

          if (isVisible) {
            backdropDomEl.bind("tap", toggle);
            backdropDomEl.bind("click", toggle);
          } else {
            backdropDomEl.unbind("tap");
            backdropDomEl.unbind("click");
          }
        };

        iElement.bind("tap", toggle);
        iElement.bind("click", toggle);
        angularDomEl.bind("tap", toggle);
        angularDomEl.bind("click", toggle);
      }
    };
  }])
  .directive("replaceInclude", function () {
    return {
      require: "ngInclude",
      restrict: "A",
      link: function (scope, el, attrs) {
        el.replaceWith(el.children());
      }
    };
  });
