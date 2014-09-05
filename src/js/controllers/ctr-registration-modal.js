angular.module("risevision.common.header")
.controller("RegistrationModalCtrl", [
  "$scope", "$modalInstance", "$rootScope",
  "updateProfile", "getProfile",
  "$loading", "createAccount", "$log", "cookieStore",
  function($scope, $modalInstance, $rootScope,
    updateProfile, getProfile, $loading,
    createAccount, $log, cookieStore) {

    var userState = $rootScope.userState;
    getProfile(userState).finally(function () {
      if(!angular.isDefined(userState.user.profile.mailSyncEnabled)) {
        userState.user.profile.mailSyncEnabled = true;
      }
      if(!angular.isDefined(userState.user.profile.accepted)) {
        userState.user.profile.accepted = false;
      }
    });

    $scope.cancel = function() {
      $modalInstance.dismiss("cancel");
      cookieStore.put("surpressRegistration", true);
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
      createAccount(userState.user.profile).then(
        function () {
          $modalInstance.close("success");
          userState.status = "pendingCheck";
        },
        function (err) {alert("Error: " + err);
        $log.error(err);});
    };
  }
]);
