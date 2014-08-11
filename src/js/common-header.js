angular.module("risevision.common.header", [
  "risevision.common.config",
  "risevison.common.auth",
  "risevision.common.gapi",
  "risevision.common.cache",
  "risevision.common.company",
  'ui.bootstrap'
])
.directive('commonHeader', ['$modal', '$rootScope', '$q', 'apiAuth', '$loading',
  'shoppingCartService', '$interval', 'oauthAPILoader', 'storeAPILoader',
  function($modal, $rootScope, $q, apiAuth, $loading, shoppingCart, $interval,
    oauthAPILoader, storeAPILoader) {
    return {
      restrict: 'E',
      templateUrl: 'components/rise-vision-common-header/src/templates/common-header.html',
      scope: {
        authStatus: '=',
        companyLoaded: '=',
        isAdmin: '=',
        subCompanySelected: '=',
        selectedCompanyName: '=',
        userProfilePicture: '=',
        userProfileName: '=',
        userProfileEmail: '=',
        messages: '='
      },
      link: function(scope, iElement, iAttrs) {

        var AUTH_STATUS_UNDEFINED = -1;
        var AUTH_STATUS_NOT_AUTHENTICATED = 0;
        var AUTH_STATUS_AUTHENTICATED = 1;
        var DEFAULT_PROFILE_PICTURE = "img/user-icon.png";
        var $scope = scope;

        $rootScope.user = {
            profile: {
                name: "",
                email: "",
                picture: DEFAULT_PROFILE_PICTURE
            }
        };
        $rootScope.authStatus = AUTH_STATUS_UNDEFINED;     //-1=unknown, 0=not authenticated, 1=authenticated
        $rootScope.isAuthed = false;    //true if authenticated

        $rootScope.isRiseAdmin = false; //Rise Vision Billing Administrator
        $rootScope.isRiseUser = false;

        $scope.thAutoRefresh = null;
        $rootScope.authDeffered = $q.defer();

        // initial auth check (silent)

        $scope.updateAuth = function (authResult) {
          if (authResult && !authResult.error) {
              $interval.cancel($scope.thAutoRefresh);
              $scope.thAutoRefresh = $interval(function(){
                $interval.cancel($scope.thAutoRefresh);
                apiAuth.checkAuth(true);
              }, 55 * 60 * 1000); //refresh every 55 minutes

              $rootScope.authStatus = AUTH_STATUS_AUTHENTICATED;
              $rootScope.isAuthed = true;
              console.log("user is authenticated");
              oauthAPILoader.get();
              storeAPILoader.get();

              var companiesDeferred = $q.defer();
              apiAuth.getUserCompanies().then(function (resp) {
                if (resp.items && resp.items.length > 0) {
                    var company = resp.items[0];
                    $rootScope.user.company = company;
                    $rootScope.isRiseAdmin = company.userRoles && company.userRoles.indexOf("ba") > -1;
                    //release 1 simpification - everyone is Purchaser ("pu" role)
                    $rootScope.isRiseUser = true;
                    companyService.loadSelectedCompany($rootScope.selectedCompanyIdParam, $rootScope.user.company).then(function(loadedCompany) {
                        $rootScope.setSelectedCompany(loadedCompany);
                        $rootScope.setSelectedCompanyIdParam(loadedCompany.id);
                        $rootScope.$broadcast("userCompany.loaded");
                        companiesDeferred.resolve();
                    });
                } else {
                    $rootScope.isRiseAdmin = false;
                    $rootScope.isRiseUser = false;
                    $rootScope.$broadcast("userCompany.none");
                    companiesDeferred.resolve();
                }
              });
              var profileDeferred = $q.defer();
              apiAuth.getProfile().then(function (resp) {
                $rootScope.user.profile.name = resp.name;
                $rootScope.user.profile.email = resp.email;
                $rootScope.user.profile.picture = resp.picture;
                profileDeferred.resolve();
                $rootScope.$broadcast("profile.loaded");
              });

              // this promise is for both the company and profile load, so it signifies complete auth.
              $q.all([profileDeferred.promise, companiesDeferred.promise]).then(function () { $rootScope.authDeffered.resolve(); });
          } else {
            $rootScope.authDeffered.resolve();
            $scope.clearUser();
            console.log("user is not authenticated");
          }
        };

        // initial auth check (silent)
        apiAuth.checkAuth(true).then($scope.updateAuth);

        $rootScope.authStatus = apiAuth.AUTH_STATUS_UNDEFINED; //this value is linked to the UI
        $rootScope.selectedCompany = {};
        $rootScope.isCAD = false;
        $rootScope.user.profile.picture = apiAuth.DEFAULT_PROFILE_PICTURE;
        $scope.messages = [];
        $scope.defaultSpinnerOptions = $loading.getDefaultSpinnerOptions();
        $rootScope.companyLoaded = false;

        $scope.shoppingCartItemCount = shoppingCart.getItemCount();
        $rootScope.$on("cartChanged", function() {
            console.log("Cart Changed!");
            $rootScope.shoppingCartItemCount = shoppingCart.getItemCount();
        });


        $rootScope.setSelectedCompany = function (company) {
            if (company.id !== $rootScope.selectedCompany.id) {
                angular.copy(company, $rootScope.selectedCompany);
                $rootScope.$broadcast("selectedCompany.changed");
            }
        };

        $rootScope.resetSelectedCompany = function () {
            $rootScope.setSelectedCompany($rootScope.user.company);
            $rootScope.setSelectedCompanyIdParam($rootScope.user.company.id);
        };

        $rootScope.setSelectedCompanyIdParam = function (companyId) {
            $rootScope.selectedCompanyIdParam = companyId;
            $location.search("cid", companyId);
        };

        $rootScope.$on("user.signout", function () {
            $rootScope.companyLoaded = false;
            if (!$scope.$state.is("product_with_name") && !$scope.$state.is("product")) {
                $scope.$state.go("products");
            }
        });


        $rootScope.$on("userCompany.loaded", function () {
            $rootScope.companyLoaded = true;
            $scope.getSystemMessages();
        });

        scope.navCollapsed = true;
        // Login Modal
        scope.login = function(size) {
          var modalInstance = $modal.open({
            templateUrl: 'authorization-modal.html',
            controller: 'AuthModalCtrl',
            size: size
          });
        };
        // Show Add Sub-Company Modal
        scope.addSubCompany = function(size) {
          var modalInstance = $modal.open({
            templateUrl: 'sub-company-modal.html',
            controller: 'SubCompanyModalCtrl',
            size: size
          });
        };
        // Show Company Settings Modal
        scope.companySettings = function(size) {
          var modalInstance = $modal.open({
            templateUrl: 'company-settings-modal.html',
            controller: 'CompanySettingsModalCtrl',
            size: size
          });
        };
        // Show User Settings Modal
        scope.userSettings = function(size) {
          var modalInstance = $modal.open({
            templateUrl: 'user-settings-modal.html',
            controller: 'UserSettingsModalCtrl',
            size: size
          });
        };
        // Show Payment Methods Modal
        scope.paymentMethods = function(size) {
          var modalInstance = $modal.open({
            templateUrl: 'payment-methods-modal.html',
            controller: 'PaymentMethodsModalCtrl',
            size: size
          });
        };


        // If nav options not provided use defaults
        if (!scope.navOptions)
          scope.navOptions = [{
            title: 'Home',
            link: '#/'
          }, {
            title: 'Store',
            link: ''
          }, {
            title: 'Account',
            link: ''
          }, {
            title: 'Sellers',
            link: ''
          }, {
            title: 'Platform',
            link: 'http://rva.risevision.com/',
            target: '_blank'
          }];
      }
    };
  }
])
.controller('AuthModalCtrl', ['$scope', '$modalInstance', '$window',
  'apiAuth',
  function($scope, $modalInstance, $window, apiAuth) {
    $scope.closeModal = function() {
      $modalInstance.dismiss('cancel');
    };
    $scope.login = function () {
        apiAuth.checkAuth().then(function () {
            $window.location.reload();
        });
    };
  }
])
.controller('SubCompanyModalCtrl', ['$scope', '$modalInstance', '$modal',
  function($scope, $modalInstance, $modal) {
    $scope.closeModal = function() {
      $modalInstance.dismiss('cancel');
    };
    // Show Move Company Modal
    $scope.moveCompany = function(size) {
      var modalInstance = $modal.open({
        templateUrl: 'move-company-modal.html',
        controller: 'MoveCompanyModalCtrl',
        size: size
      });
    };
  }
])
.controller('MoveCompanyModalCtrl', ['$scope', '$modalInstance',
  function($scope, $modalInstance) {
    $scope.closeModal = function() {
      $modalInstance.dismiss('cancel');
    };
  }
])
.controller('CompanySettingsModalCtrl', ['$scope', '$modalInstance',
  function($scope, $modalInstance) {
    $scope.closeModal = function() {
      $modalInstance.dismiss('cancel');
    };
  }
])
.controller('UserSettingsModalCtrl', ['$scope', '$modalInstance',
  function($scope, $modalInstance) {
    $scope.closeModal = function() {
      $modalInstance.dismiss('cancel');
    };
  }
])
.controller('PaymentMethodsModalCtrl', ['$scope', '$modalInstance', '$modal',
  function($scope, $modalInstance, $modal) {
    $scope.closeModal = function() {
      $modalInstance.dismiss('cancel');
    };
    // Show Payment Methods Modal
    $scope.creditCards = function(size) {
      var modalInstance = $modal.open({
        templateUrl: 'credit-cards-modal.html',
        controller: 'CreditCardsModalCtrl',
        size: size
      });
    };
  }
])
.controller('CreditCardsModalCtrl', ['$scope', '$modalInstance',
  function($scope, $modalInstance) {
    $scope.closeModal = function() {
      $modalInstance.dismiss('cancel');
    };
  }
]);
