angular.module("risevision.common.header")
.controller("RegistrationModalCtrl", [
  "$scope", "$modalInstance", "$rootScope",
  "updateUser", "getUser",
  "$loading", "registerAccount", "$log", "cookieStore",
  function($scope, $modalInstance, $rootScope,
    updateUser, getUser, $loading,
    registerAccount, $log, cookieStore) {

    var userState = $rootScope.userState;
    getUser().finally(function () {
      if(!angular.isDefined(userState.user.profile.mailSyncEnabled)) {
        userState.user.profile.mailSyncEnabled = false;
      }
      if(!angular.isDefined(userState.user.profile.accepted)) {
        userState.user.profile.accepted = false;
      }
    });

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
      registerAccount(userState.user.profile.username,
        userState.user.profile).then(
        function () {
          // $modalInstance.close("success");
          userState.status = "pendingCheck";
        },
        function (err) {alert("Error: " + err);
        $log.error(err);});
    };
  }
]);
