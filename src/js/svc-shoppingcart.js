(function (angular) {
  "use strict";

  angular.module("risevision.common.cache")

  .factory("shoppingCart", ["rvStorage", "$log", "$q",
    function (rvStorage, $log, $q){
    var items = null;
    var itemsMap = {};

    var readFromStorage = function() {
      var storedCartContents = rvStorage.getItem("rvStore_OrderProducts");
      $log.debug("storedCartContents", storedCartContents);
      if (storedCartContents) {
        var res = JSON.parse(storedCartContents);
        if (res && res.items && res.itemsMap) {
          while(items.length > 0) { items.pop(); } //clear all items
          items = res.items;
          itemsMap = res.itemsMap;
        }
      }
    };

    var persistToStorage = function() {
      rvStorage.setItem("rvStore_OrderProducts",
        JSON.stringify({items: items, itemsMap: itemsMap}));
    };

    var loadReady = $q.defer();

    return {
      loadReady: loadReady.promise,
      getSubTotal: function (isCAD) {
        var shipping = 0;
        var subTotal = 0;
        if(items) {
          for (var i = 0; i < items.length; i++) {
              var shippingCost = (isCAD) ? items[i].selected.shippingCAD : items[i].selected.shippingUSD;
              var productCost = (isCAD) ? items[i].selected.priceCAD : items[i].selected.priceUSD;
              if (items[i].paymentTerms !== "Metered") {
                shipping += shippingCost * items[i].qty || 0;
                subTotal += productCost * items[i].qty || 0;
              }
          }
        }

        return subTotal + shipping;
      },
      getShippingTotal: function (isCAD) {
        var shipping = 0;
        if(items) {
          for (var i = 0; i < items.length; i++) {
              if (items[i].paymentTerms !== "Metered") {
                var shippingCost = (isCAD) ? items[i].selected.shippingCAD : items[i].selected.shippingUSD;
                shipping += shippingCost * items[i].qty || 0;
              }
          }
        }
        return shipping;
      },
      clear: function () {
        if(items) {
          items.length = 0;
        }
        for (var key in itemsMap) {
          delete itemsMap[key];
        }
        persistToStorage();
        $log.debug("Shopping cart cleared.");
      },
      destroy: function () {
        this.clear();
        items = null;
      },
      initialize: function () {
        items = [];
        readFromStorage();
        loadReady.resolve();
        return items;
      },
      getItemCount: function () {
        return items.length;
      },
      removeItem: function(itemToRemove) {
        if (itemToRemove && itemsMap[itemToRemove.productId]) {
          delete itemsMap[itemToRemove.productId];
          for (var i = 0; i < items.length; i++) {
            if (items[i].productId === itemToRemove.productId) {
              items.splice(i, 1);
              delete itemsMap[itemToRemove.productId];
              break;
            }
          }
          persistToStorage();
        }
      },
      adjustItemQuantity: function(itemToAdjust, qty) {
        if (itemToAdjust && $.isNumeric(qty) && itemsMap[itemToAdjust.id]) {
          if (qty > 0) {
            itemsMap[itemToAdjust.id].quantity = qty;
            itemsMap[itemToAdjust.id].item.qty = qty;
            persistToStorage();
          }
          else {
            this.removeItem(itemToAdjust);
          }
        }
      },
      addItem: function(itemToAdd, qty, pricingIndex) {
        if (itemsMap[itemToAdd.productId] && (itemToAdd.paymentTerms === "Subscription" || itemToAdd.paymentTerms === "Metered")) {
          return;
        }

        if (itemToAdd && $.isNumeric(qty) && itemToAdd.orderedPricing.length > pricingIndex) {
          if (itemsMap[itemToAdd.productId]) {
            // qty for existing item is increased
            itemsMap[itemToAdd.productId].qty = parseInt(itemsMap[itemToAdd.productId].qty) + parseInt(qty);
          }
          else {
            // item is not already in the cart
            itemsMap[itemToAdd.productId] = angular.copy(itemToAdd);
            itemsMap[itemToAdd.productId].qty = qty;
            items.push(itemsMap[itemToAdd.productId]);
          }
          itemsMap[itemToAdd.productId].selected = itemToAdd.orderedPricing[pricingIndex];
          persistToStorage();
        }
      }
    };
  }]);
})(angular);
