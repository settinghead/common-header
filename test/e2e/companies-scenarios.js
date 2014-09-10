(function() {

  "use strict";

  /* https://github.com/angular/protractor/blob/master/docs/getting-started.md */

  var chai = require("chai");
  var chaiAsPromised = require("chai-as-promised");

  chai.use(chaiAsPromised);
  var expect = chai.expect;
  var assert = chai.assert;

  var fs = require("fs");

  browser.driver.manage().window().setSize(1024, 768);

  describe("Companies", function() {
  var ptor;

      before(function() {
        ptor = protractor.getInstance();
        ptor.manage().deleteAllCookies();
        browser.get("/test/e2e/index.html#/fake-store");

        //clear local storage
        browser.executeScript("localStorage.clear();");

        ptor.driver.navigate().refresh();
      });

      it("icon should not show when the user is not signed in", function() {
        assert.eventually.isTrue(element(by.id("buy-product-1")).isDisplayed(), "Product 1 button should show");
        assert.eventually.isTrue(element(by.id("buy-product-2")).isDisplayed(), "Product 2 button should show");
        assert.eventually.isTrue(element(by.id("buy-product-3")).isDisplayed(), "Product 3 button should show");
        assert.eventually.isFalse(element(by.css(".shopping-cart-button")).isDisplayed(), "Cart button should not show");

        assert.eventually.strictEqual(element(by.id("cartBadge")).getText(), "", "Cart badge should display nothing");
        element(by.id("buy-product-2")).click();
        assert.eventually.strictEqual(element(by.id("cartBadge")).getText(), "", "Should not add to cart");

      });

  });
})();
