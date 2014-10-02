(function() {

  "use strict";

  /* https://github.com/angular/protractor/blob/master/docs/getting-started.md */

  var chai = require("chai");
  var chaiAsPromised = require("chai-as-promised");

  chai.use(chaiAsPromised);
  var expect = chai.expect;
  var assert = chai.assert;

  var fs = require("fs");

  browser.driver.manage().window().setSize(1280, 768);

  describe("Registration", function() {
  var ptor;

      before(function() {
        ptor = protractor.getInstance();
        ptor.manage().deleteAllCookies();
        browser.get("/test/e2e/#/users");

        //clear local storage
        browser.executeScript("localStorage.clear();");
        ptor.driver.navigate().refresh();
      });

      it("should show T&C Dialog on new Google Account", function() {

        element(by.id("reset-db")).click();
        //delete account
        element(by.id("clear-accounts")).click();
        element(by.id("clear-users")).click();

        expect(element(by.css("button.sign-in")).isDisplayed()).to.eventually.equal(true);
        //click on sign in button
        browser.executeScript("gapi.setPendingSignInUser('michael.sanchez@awesome.io')");
        element(by.css("button.sign-in")).click();
        element(by.css(".authorize-button")).click();

        //dialog shows
        assert.eventually.isTrue(element(by.css(".registration-modal")).isPresent(), "registration dialog should show");

        //fill in email address
      });

      it("should not bug me again when I click 'cancel', even after a refresh (limbo state)", function() {
        element(by.css(".registration-cancel-button")).click();
        ptor.driver.navigate().refresh();
        assert.eventually.isFalse(element(by.css("a.sign-in")).isDisplayed(), "sign in button should not show");
        assert.eventually.isTrue(element(by.css("img.profile-pic")).isDisplayed(), "profile pic should show");
        assert.eventually.isFalse(element(by.css(".registration-modal")).isPresent(), "registration dialog should hide");
      });

      it("allow me to register when I've changed my mind", function() {
        element(by.css("img.profile-pic")).click();
        assert.eventually.isTrue(element(by.css(".register-user-menu-button")).isDisplayed(), "Auth menu should have a 'Register' button");
        element(by.css(".register-user-menu-button")).click();
        assert.eventually.isTrue(element(by.css(".registration-modal")).isPresent(), "registration dialog should show");
      });

      it("should complete the registration process", function () {
        element(by.css(".registration-modal .email")).sendKeys("michael.sanchez@awesomecompany.io");

        //click authorize
        element(by.css(".accept-terms-checkbox")).click();
        element(by.css(".registration-save-button")).click();

        assert.eventually.isFalse(element(by.css(".registration-modal")).isPresent(), "registration dialog should hide");
      });
  });
})();
