/*jshint expr:true */

describe("Services: Shopping Cart", function() {

  beforeEach(module("risevision.common.shoppingcart"));

  it("should exist", function() {
    inject(function(shoppingCart) {
      expect(shoppingCart).be.defined;
    });
  });

  it("should add items to cart", function (){
    inject(function(shoppingCart) {
      shoppingCart.addItem({id: "aabbccccdd", orderedPricing: [100]}, 2, 0);
      expect(shoppingCart.getItemCount()).to.equal(1);
      shoppingCart.addItem({id: "cdcds", orderedPricing: [100]}, 2, 0);
      shoppingCart.addItem({id: "vdvdv", orderedPricing: [100]}, 2, 0);
      shoppingCart.addItem({id: "aabbccccdd", orderedPricing: [100]}, 2, 0);
      expect(shoppingCart.getItemCount()).to.equal(3);
    });
  });

  it("should remove items from cart", function () {
    inject(function(shoppingCart) {
      shoppingCart.addItem({id: "aabbccccdd", orderedPricing: [100]}, 2, 0);
      shoppingCart.addItem({id: "cdcds", orderedPricing: [100]}, 2, 0);
      shoppingCart.addItem({id: "vdvdv", orderedPricing: [100]}, 2, 0);
      expect(shoppingCart.getItemCount()).to.equal(3);
      shoppingCart.removeItem({id: "not_in_cart", orderedPricing: [100]}, 2, 0);
      expect(shoppingCart.getItemCount()).to.equal(3);
      shoppingCart.removeItem({id: "aabbccccdd", orderedPricing: [100]}, 2, 0);
      expect(shoppingCart.getItemCount()).to.equal(2);
      shoppingCart.removeItem({id: "vdvdv", orderedPricing: [100]}, 2, 0);
      expect(shoppingCart.getItemCount()).to.equal(1);
      shoppingCart.removeItem({id: "cdcds", orderedPricing: [100]}, 2, 0);
      expect(shoppingCart.getItemCount()).to.equal(0);
    });

    it("should clear cart", function () {
      inject(function(shoppingCart) {
        shoppingCart.addItem({id: "aabbccccdd", orderedPricing: [100]}, 2, 0);
        shoppingCart.addItem({id: "cdcds", orderedPricing: [100]}, 2, 0);
        shoppingCart.addItem({id: "vdvdv", orderedPricing: [100]}, 2, 0);
        expect(shoppingCart.getItemCount()).to.equal(3);
        shoppingCart.clear();
        expect(shoppingCart.getItemCount()).to.equal(0);
      });
    });

  });

});
