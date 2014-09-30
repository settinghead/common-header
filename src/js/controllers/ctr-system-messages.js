angular.module("risevision.common.header")

.controller("SystemMessagesButtonCtrl", [
  "$scope", "userState", "$log", "$sce", "getCoreSystemMessages", "systemMessages",
  function($scope, userState, $log, $sce, getCoreSystemMessages,
    systemMessages) {

    $scope.messages = systemMessages;
    $scope.$watch(function () {return userState.isRiseVisionUser();},
      function (isRvUser) { $scope.isRiseVisionUser = isRvUser; });

    $scope.renderHtml = function(html_code)
    { return $sce.trustAsHtml(html_code); };

    $scope.$watch(
      function () { return userState.getSelectedCompanyId(); },
      function (newCompanyId) {
        if(newCompanyId !== null) {
          systemMessages.clear();
          getCoreSystemMessages(newCompanyId).then(systemMessages.addMessages);
        }
        else {
          systemMessages.clear();
        }
    });

  }
]);
