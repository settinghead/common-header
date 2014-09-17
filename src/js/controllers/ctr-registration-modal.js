angular.module("risevision.common.header")
.controller("RegistrationModalCtrl", [
  "$scope", "$modalInstance", "getUser",
  "$loading", "registerAccount", "$log", "cookieStore",
  "userState", "pick",
  function($scope, $modalInstance, getUser, $loading,
    registerAccount, $log, cookieStore, userState, pick) {


    getUser().then().finally(function () {
      if(!userState.profile) { userState.profile = {}; }
      if(!angular.isDefined(userState.user.profile.mailSyncEnabled)) {
        userState.user.profile.mailSyncEnabled = false;
      }
      if(!angular.isDefined(userState.user.accepted)) {
        userState.user.accepted = false;
      }

      $scope.profile = pick(userState.user.profile, "email", "mailSyncEnabled");
      $scope.profile.accepted = userState.user.accepted;

    });

    $scope.profile = {mailSyncEnabled: false};

    $scope.closeModal = function() {
      cookieStore.put("surpressRegistration", true);
      $modalInstance.dismiss("cancel");
    };

    var watch = $scope.$watch("userState.status", function (newVal) {
      if(newVal) {
        if(newVal === "pendingCheck") {
          //start the spinner
          $loading.start("registration-modal");
        }
        else {
          $loading.stop("registration-modal");
          if(userState.status !== "basicProfileCreated") {
            $modalInstance.close("success");
            //stop the watch
            watch();
          }
        }
      }
    });

    $scope.save = function () {
      //update terms and conditions date
      registerAccount(userState.user.username, $scope.profile).then(
        function () {
          // $modalInstance.close("success");
        userState.status = "pendingCheck";
        },
        function (err) {alert("Error: " + err);
        $log.error(err);});
    };
  }
]);
