angular.module("risevision.common.header")

.controller("SystemMessagesButtonCtrl", [
  "$scope", "userState", "$log", "$sce", "getCoreSystemMessages",
  "addSystemMessages",
  function($scope, userState, $log, $sce, getCoreSystemMessages,
    addSystemMessages) {

    userState.bindToScope($scope, userState.SELECTED_COMPANY, "selectedCompany");

    $scope.renderHtml = function(html_code)
    {
        return $sce.trustAsHtml(html_code);
    };
    $scope.$watch(function () {
      return userState.getSelectedCompanyId();
    }, function (newVal) {
      if(newVal) {
        getCoreSystemMessages(newVal).then(addSystemMessages);
      }
    });
  }
]);
