angular.module("risevision.common.header")

.controller("SystemMessagesButtonCtrl", [
  "$scope", "$log", "$sce", "getSystemMessages",
  function($scope, $log, $sce, getSystemMessages) {
    $scope.renderHtml = function(html_code)
    {
        return $sce.trustAsHtml(html_code);
    };
    $scope.$watch("userState.selectedCompany.id", function (newVal) {
      if(newVal) {
        getSystemMessages(newVal).then(function (messages) {
          $scope.messages = messages;
        });
      }
    });
  }
]);
