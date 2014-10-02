angular.module("risevision.common.header")
.controller("AuthButtonsCtr", ["$scope", "$modal", "$templateCache",
  "userState", "$loading",
  "$log", "uiStatusManager",
  function($scope, $modal, $templateCache, userState,
  $loading, $log, uiStatusManager) {

    $scope.spinnerOptions = {color: "#999", hwaccel: true, radius: 10};

    //spinner
    $scope.$watch(function () {return uiStatusManager.isStatusUndetermined(); },
    function (undetermined){
      $scope.undetermined = undetermined;
      if (undetermined === true) { $loading.start("auth-buttons"); }
      else { $loading.stop("auth-buttons"); }
    });

    //watch on username change and populate onto scope variables requried
    // for rendering UI

    $scope.$watch(function () {return userState.isLoggedIn();},
      function (loggedIn) { $scope.isLoggedIn = loggedIn;
        if(loggedIn === true) { $scope.userPicture = userState.getUserPicture();}
      });
    $scope.$watch(function () {return userState.isRiseVisionUser();},
      function (isRvUser) { $scope.isRiseVisionUser = isRvUser; });

    //repopulate profile upon change of current user
    $scope.$watch(function () {return userState.getUsername();},
      function () {
        $scope.profile = userState.getCopyOfProfile(); });

    // Login Modal
    $scope.loginModal = function(size) {
      var modalInstance =
      $modal.open({
        template: $templateCache.get("authorization-modal.html"),
        controller: "AuthModalCtrl",
        size: size
      });

      modalInstance.result.then(function () {
          uiStatusManager.invalidateStatus("registrationComplete");
      });
    };

    $scope.logout = function () {
      userState.signOut().then(function (){
        alert("If you are using a public computer, please do not forget to log out of Google Account, or close your browser window if you are using Incognito mode. ");
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
        resolve: {username: function () {return userState.getUsername();},
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

    userState.authenticate(false);
  }
]);
