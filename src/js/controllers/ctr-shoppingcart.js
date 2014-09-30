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

    $scope.shoppingCartUrl = STORE_URL + "#/shopping-cart";
    $scope.items = null;

    $scope.$watch(function () {return userState.getUsername(); },
    function (newUsername) {
      if(newUsername && userState.isRiseVisionUser()) {
        $scope.items  = shoppingCart.initialize();
        $log.debug("Shopping cart initialized for user", newUsername, $scope.items);
      }
      else {
        $scope.items = shoppingCart.destroy();
      }
    });
  }
]);
