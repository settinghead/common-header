angular.module("risevision.common.header")

.filter("surpressZero", function () {
  return function (num) {
    if(num) {
      return num;
    }
    else {
      return "";
    }
  };
})

.controller("ShoppingCartButtonCtrl", [
  "$scope", "shoppingCart", "userState", "$log", "STORE_URL",
  function($scope, shoppingCart, userState, $log, STORE_URL) {
    userState.shoppingCart = {};

    $scope.shoppingCartUrl = function () {
      return STORE_URL + "#/shopping-cart";
    };

    $scope.$watch("userState.user.profile.username", function (newVal) {
      if(newVal) {
        userState.shoppingCart.items = shoppingCart.initialize();
        $log.debug("Shopping cart populated.");
      }
      else {
        //clear cart on scope
        userState.shoppingCart.items = null;
      }
    });
  }
]);
