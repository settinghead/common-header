angular.module("risevision.common.header")
.controller("TermsConditionsModalCtrl", [
  "$scope", "$modalInstance", "$rootScope",
  "updateProfile", "getProfile", "getOAuthUserInfo",
  "$loading", "createAccount", "$log", "cookieStore",
  function($scope, $modalInstance, $rootScope,
    updateProfile, getProfile, getOAuthUserInfo, $loading,
    createAccount, $log, cookieStore) {

    var userState = $rootScope.userState;
    getProfile(userState).finally(function () {
      if(!angular.isDefined(userState.user.profile.mailSyncEnabled)) {
        userState.user.profile.mailSyncEnabled = true;
      }
      if(!angular.isDefined(userState.user.profile.accepted)) {
        userState.user.profile.accepted = false;
      }
      if(!userState.user.profile.email) {
        //retrieve user email from oatuh2 user info
        getOAuthUserInfo().then(function (userInfo) {
          userState.user.profile.email = userInfo.email;
        });
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
          $loading.start("terms-conditions-modal");
        }
        else {
          $loading.stop("terms-conditions-modal");
          if(userState.status !== "basicProfileCreated") {
            $modalInstance.close("success");
            //stop the watch
            watch();
          }
        }
      }
    });

    $scope.agree = function () {
      //update terms and conditions date
      createAccount(userState.user.profile).then(
        function () { userState.status = "pendingCheck"; },
        function (err) {alert("Error: " + err);
        $log.error(err);});
    };
  }
]);
