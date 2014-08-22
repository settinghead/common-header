angular.module("risevision.common.header")
.controller("TermsConditionsModalCtrl", [
  "$scope", "$modalInstance", "$rootScope",
  "updateProfile", "getProfile", "getOAuthUserInfo",
  function($scope, $modalInstance, $rootScope,
    updateProfile, getProfile, getOAuthUserInfo) {

    var userState = $rootScope.userState;

    getProfile(userState).then(function () {
      if(!userState.user.profile) {
        userState.user.profile = userState.user.profile || {};
      }
      if(!userState.user.profile.email) {
        //retrieve user email from oatuh2 user info
        getOAuthUserInfo().then(function (userInfo) {
          userState.user.profile.email = userInfo.email;
        });
      }
    });

    $scope.closeModal = function() {
      $modalInstance.dismiss("cancel");
      $rootScope.userState.status = "pendingCheck";
    };

    $scope.$watch("userState.user.profile.accepted", function (newVal) {
      if(newVal) {
        userState.user.profile.termsAcceptanceDate = new Date().toISOString();
      }
      else {
        delete userState.user.profile.termsAcceptanceDate;
      }
    });

    $scope.agree = function () {
      //update terms and conditions date
      updateProfile(userState.user.profile).then(function () {
        $modalInstance.close("success");
        $rootScope.userState.status = "pendingCheck";
      });
    };
  }
]);
