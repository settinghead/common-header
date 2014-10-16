angular.module("risevision.common.header")
.controller("AuthButtonsCtr", ["$scope", "$modal", "$templateCache",
  "userState", "$loading", "cookieStore",
  "$log", "uiStatusManager",
  function($scope, $modal, $templateCache, userState,
  $loading, cookieStore, $log, uiStatusManager) {

    window.$loading = $loading; //DEBUG

    $scope.spinnerOptions = {color: "#999", hwaccel: true, radius: 10};

    $scope.register = function () {
      cookieStore.remove("surpressRegistration");
      uiStatusManager.invalidateStatus("registrationComplete");
    };

    //clear state where user registration is surpressed
    $scope.$on("risevision.user.signedOut", function () {
      cookieStore.remove("surpressRegistration");
    });

    $scope.$on("risevision.uiStatus.validationCancelled", function () {
      cookieStore.remove("surpressRegistration");
    });

    //spinner
    $scope.$watch(function () {return uiStatusManager.isStatusUndetermined(); },
    function (undetermined){
      $scope.undetermined = undetermined;
      $scope.loading = undetermined;
    });


    //render dialogs based on status the UI is stuck on
    $scope.$watch(function () { return uiStatusManager.getStatus(); },
    function (newStatus, oldStatus){
      if(newStatus) {
        $log.debug("status changed from", oldStatus, "to", newStatus);

        //render a dialog based on the status current UI is in
        if(newStatus === "registerdAsRiseVisionUser") {
          if(!userState.registrationModalInstance && userState.isLoggedIn()) { // avoid duplicate registration modals
            userState.registrationModalInstance = $modal.open({
              template: $templateCache.get("registration-modal.html"),
              controller: "RegistrationModalCtrl",
              backdrop: "static"
            });
          }

          userState.registrationModalInstance.result.finally(function (){
            //TODO: put it somewhere else
            userState.registrationModalInstance = null;
            uiStatusManager.invalidateStatus();
          });
        }
      }
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
      function (username) {
        if(username) {
          $scope.profile = userState.getCopyOfProfile();
        }});

    // Login Modal
    $scope.login = function() {
      $loading.startGlobal("auth-buttons-login");
      userState.authenticate(true).then().finally(function(){
        $loading.stopGlobal("auth-buttons-login");
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

    $loading.startGlobal("auth-buttons-silent");
    userState.authenticate(false).then().finally(function () {
      $loading.stopGlobal("auth-buttons-silent");
      if(!uiStatusManager.isStatusUndetermined()) {
        //attempt to reach a stable registration state only
        //when there is currently no validating checking
        uiStatusManager.invalidateStatus("registrationComplete");
      }
    });
  }
]);
