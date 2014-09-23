angular.module("risevision.common.header")
.controller("AuthButtonsCtr", ["$scope", "$modal", "$templateCache",
  "elizaState", "$rootScope", "$loading", "authenticate",
  "signOut", "$log", "getUser", "cookieStore",
  function($scope, $modal, $templateCache, elizaState, $rootScope,
  $loading, authenticate, signOut, $log, getUser, cookieStore) {

    $scope.spinnerOptions = {color: "#999", hwaccel: true, radius: 10};

    $scope.$watch("elizaState.status", function (newStatus){
      if (newStatus === "pendingCheck") {
        $loading.start("auth-buttons");
      }
      else {
        $loading.stop("auth-buttons");
      }
    });

    // Login Modal
    $scope.loginModal = function(size) {
      // var modalInstance =
      $modal.open({
        template: $templateCache.get("authorization-modal.html"),
        controller: "AuthModalCtrl",
        size: size
      });
    };

    $scope.authenticate = function() {
      authenticate(true).finally(function(){
        elizaState.status = "pendingCheck";
        $loading.start("auth-buttons");
      });
    };

    $scope.register = function () {
      cookieStore.remove("surpressRegistration");
      elizaState.status = "pendingCheck";
    };

    $scope.logout = function () {
      signOut().then(function (){
        alert("If you are using a public computer, please do not forget to log out of Google Account, or close your browser window if you are using Incognito mode. ");
        elizaState.status = "pendingCheck";
        $loading.start("auth-buttons");
      }, function (err) {
        $log.error("sign out failed", err);
      });
    };

    // Show User Settings Modal
    $scope.userSettings = function(size) {
      // var modalInstance =
      $modal.open({
        template: $templateCache.get("user-settings-modal.html"),
        controller: "UserSettingsModalCtrl",
        size: size,
        resolve: {username: function () {return elizaState.user.username;},
        add: function () {return false; }}
      });
    };
    // Show Payment Methods Modal
    $scope.paymentMethods = function(size) {
      // var modalInstance =
      $modal.open({
        template: $templateCache.get("payment-methods-modal.html"),
        controller: "PaymentMethodsModalCtrl",
        size: size
      });
    };

    authenticate(false).then(getUser);



    $scope.$watchCollection("elizaState.user.profile.roles", function (newVals) {
      if(newVals) {
        if(!elizaState.roleMap) {
          elizaState.roleMap = {};
        }
        newVals.forEach(function (val){
          elizaState.roleMap[val] = true;
        });
      }
    });
  }
]);
