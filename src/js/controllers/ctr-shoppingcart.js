angular.module("risevision.common.header")
.controller("ShoppingCartButtonCtrl", [
  "$scope", "shoppingCart", "userState",
  function($scope, shoppingCart, userState) {
    userState.shoppingCart = {};
    var items = userState.shoppingCart.items = shoppingCart.getItems();

    $scope.cartCount = function () {
      if(items && items.length > 0) {
        return items.length;
      }
      else{
        return;
      }
    };
  }
]);
