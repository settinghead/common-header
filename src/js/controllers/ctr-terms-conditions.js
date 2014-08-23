angular.module("risevision.common.header")
.controller("TermsConditionsModalCtrl", [
  "$scope", "$modalInstance", "$rootScope",
  "updateProfile", "getProfile", "getOAuthUserInfo",
  "$loading",
  function($scope, $modalInstance, $rootScope,
    updateProfile, getProfile, getOAuthUserInfo, $loading) {

    var userState = $rootScope.userState;
    getProfile(userState).finally(function () {
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
    };

    $scope.$watch("userState.user.profile.accepted", function (newVal) {
      if(angular.isDefined(newVal)) {
        if(newVal){
          userState.user.profile.termsAcceptanceDate = new Date().toISOString();
        }
        else {
          delete userState.user.profile.termsAcceptanceDate;
        }
      }
    });

    $scope.$watch("userState.status", function (newVal) {
      if(newVal === "pendingCheck") {
        $loading.start("terms-conditions-modal");
      }
      else {
        $loading.stop("terms-conditions-modal");
        if(userState.status !== "termsConditionsAccepted") {
          $modalInstance.close("success");
        }
      }
    });

    $scope.agree = function () {
      //update terms and conditions date
      updateProfile(userState.user.profile).then(function (){
        userState.status = "pendingCheck";
      });
    };
  }
]);
