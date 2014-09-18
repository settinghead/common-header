angular.module("risevision.common.header")

.controller("SystemMessagesButtonCtrl", [
  "$scope", "userState", "$log", "$sce", "getCoreSystemMessages",
  function($scope, userState, $log, $sce, getCoreSystemMessages) {
    $scope.renderHtml = function(html_code)
    {
        return $sce.trustAsHtml(html_code);
    };
    $scope.$watch("userState.selectedCompany.id", function (newVal) {
      if(newVal) {
        getCoreSystemMessages(newVal);
      }
    });
  }
]);
