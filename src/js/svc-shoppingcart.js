(function (angular) {
  "use strict";

  angular.module("risevision.common.cache")

  .factory("shoppingCart", ["rvStorage", "$log",
    function (rvStorage, $log){
    var items = null;
    var itemsMap = {};

    var readFromStorage = function() {
      var storedCartContents = rvStorage.getItem("rvStore_OrderProducts");
      $log.debug("storedCartContents", storedCartContents);
      if (storedCartContents) {
        var res = JSON.parse(storedCartContents);
        if (res && res.items && res.itemsMap) {
          while(items.length > 0) { items.pop(); } //clear all items
          res.items.forEach(function (item) {items.push(item); });
          items = res.items;
          itemsMap = res.itemsMap;
        }
      }
    };

    var persistToStorage = function() {
      rvStorage.setItem("rvStore_OrderProducts",
        JSON.stringify({items: items, itemsMap: itemsMap}));
    };


    return {
      getSubTotal: function (isCAD) {
        var shipping = 0;
        var subTotal = 0;
        for (var i = 0; i < items.length; i++) {
          var shippingCost = (isCAD) ? items[i].item.selected.shippingCAD : items[i].item.selected.shippingUSD;
          var productCost = (isCAD) ? items[i].item.selected.priceCAD : items[i].item.selected.priceUSD;
          if (items[i].item.paymentTerms !== "Metered" && items[i].item.paymentTerms !== "Subscription") {
            shipping += shippingCost * items[i].quantity || 0;
            subTotal += productCost * items[i].quantity || 0;
          }
        }
        return subTotal + shipping;
      },
      getShippingTotal: function (isCAD) {
        var shipping = 0;
        for (var i = 0; i < items.length; i++) {
          var shippingCost = (isCAD) ? items[i].item.selected.shippingCAD : items[i].item.selected.shippingUSD;
          shipping += shippingCost * items[i].quantity || 0;
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
        return items;
      },
      getItemCount: function () {
        return items.length;
      },
      removeItem: function(itemToRemove) {
        if (itemToRemove && itemsMap[itemToRemove.id]) {
          delete itemsMap[itemToRemove.id];
          for (var i = 0; i < items.length; i++) {
            if (items[i].item.id === itemToRemove.id) {
              items.splice(i, 1);
              delete itemsMap[itemToRemove.id];
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
        if (items && itemToAdd && angular.isNumber(qty) && itemToAdd.orderedPricing.length > pricingIndex) {
          if (itemsMap[itemToAdd.id]) {
            // qty for existing item is increased
            itemsMap[itemToAdd.id].quantity += qty;
            itemsMap[itemToAdd.id].item.qty += qty;
          }
          else {
            // item is not already in the cart
            itemsMap[itemToAdd.id] = {item: angular.copy(itemToAdd), quantity: qty};
            itemsMap[itemToAdd.id].item.qty = qty;
            items.push(itemsMap[itemToAdd.id]);
          }
          itemsMap[itemToAdd.id].item.selected = itemToAdd.orderedPricing[pricingIndex];
          persistToStorage();
          $log.debug("Item", itemToAdd.id, "added to cart", itemToAdd);
        }
      }
    };
  }]);
})(angular);
