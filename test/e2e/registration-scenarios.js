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

  describe("Registration", function() {
  var ptor;

      before(function() {
        ptor = protractor.getInstance();
        ptor.manage().deleteAllCookies();
        browser.get("/test/e2e/index.html");

        //clear local storage
        browser.executeScript("localStorage.clear();");
        ptor.driver.navigate().refresh();
      });

      it("should show T&C Dialog on new Google Account", function() {

        element(by.id("reset-db")).click();
        //delete account
        element(by.id("delete-account")).click();

        expect(element(by.css("a.sign-in")).isDisplayed()).to.eventually.equal(true);
        //click on sign in button
        element(by.css("a.sign-in")).click();
        element(by.css(".authorize-button")).click();
        //dialog shows
        assert.eventually.isTrue(element(by.css(".registration-modal")).isPresent(), "registration dialog should show");

        //fill in email address
        element(by.css(".registration-modal .email")).sendKeys("michael.sanchez@awesomecompany.io");

        //click authorize
        element(by.css(".accept-terms-checkbox")).click();
        element(by.css(".registration-save-button")).click();


        assert.eventually.isFalse(element(by.css(".registration-modal")).isPresent(), "registration dialog should hide");
      });

      xit("should show Email Update dialogue after the user has accepted T&C", function() {
        delete window.currentUser.email;

        expect(element(by.css(".update-profile-modal")).isPresent()).to.eventually.equal(false);
        //click on sign in button
        element(by.css("a.sign-in")).click();
        element(by.css(".authorize-button")).click();
        //dialog shows
        expect(element(by.css(".update-profile-modal")).isDisplayed()).to.eventually.equal(true);

        //show error on invalid email
        element(by.css(".update-profile-modal .continue-button")).click();
        expect(element(by.css(".update-profile-modal .error-field")).isDisplayed()).to.eventually.equal(true);
        //fill in email
        element(by.css(".user-profile .email")).senKeys("michael.senchez@company.com");
        element(by.css(".update-profile-modal .continue-button")).click();
        //auth dialog should disappear
        expect(element(by.css(".update-profile-modal")).isPresent()).to.eventually.equal(false);
      });

      xit("should show company creation dialogue if no company is created", function() {
        //TODO
      });

      xit("should follow complete workflow", function() {
        //TODO
      });

  });
})();
