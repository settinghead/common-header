angular.module("risevision.common.header")
.controller("RegistrationModalCtrl", [
  "$scope", "$modalInstance", "getUser",
  "$loading", "registerAccount", "$log", "cookieStore",
  "userState", "pick",
  function($scope, $modalInstance, getUser, $loading,
    registerAccount, $log, cookieStore, userState, pick) {

    $scope.profile = {};

    getUser().then().finally(function () {
      if(!angular.isDefined($scope.profile.mailSyncEnabled)) {
        $scope.profile.mailSyncEnabled = false;
      }
      if(!angular.isDefined(userState.profile.accepted)) {
        $scope.profile.accepted = false;
      }

      $scope.profile = pick(userState.profile, "email", "mailSyncEnabled");
      $scope.profile.accepted = userState.user.accepted;

    });

    $scope.profile = {mailSyncEnabled: false};

    $scope.closeModal = function() {
      cookieStore.put("surpressRegistration", true);
      $modalInstance.dismiss("cancel");
    };

    var watch = $scope.$watch("elizaState.status", function (newVal) {
      if(newVal) {
        if(newVal === "pendingCheck") {
          //start the spinner
          $loading.start("registration-modal");
        }
        else {
          $loading.stop("registration-modal");
          if(elizaState.status !== "basicProfileCreated") {
            $modalInstance.close("success");
            //stop the watch
            watch();
          }
        }
      }
    });

    $scope.save = function () {
      //update terms and conditions date
      registerAccount(elizaState.user.username, $scope.profile).then(
        function () {
          // $modalInstance.close("success");
        elizaState.status = "pendingCheck";
        },
        function (err) {alert("Error: " + err);
        $log.error(err);});
    };
  }
]);
