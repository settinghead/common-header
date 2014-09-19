angular.module("risevision.common.header")

.controller("SystemMessagesButtonCtrl", [
  "$scope", "userState", "$log", "$sce", "getCoreSystemMessages", "addSystemMessages",
  function($scope, userState, $log, $sce, getCoreSystemMessages,
    addSystemMessages) {
    $scope.renderHtml = function(html_code)
    {
        return $sce.trustAsHtml(html_code);
    };
    $scope.$watch("userState.selectedCompany.id", function (newVal) {
      if(newVal) {
        getCoreSystemMessages(newVal).then(addSystemMessages);
      }
    });
  }
]);
