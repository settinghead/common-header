(function() {

  "use strict";

  /* https://github.com/angular/protractor/blob/master/docs/getting-started.md */

  var chai = require("chai");
  var chaiAsPromised = require("chai-as-promised");

  chai.use(chaiAsPromised);
  var expect = chai.expect;

  var fs = require("fs");

  browser.driver.manage().window().setSize(1024, 768);

  xdescribe("Registration", function() {
  var ptor;

      before(function() {
        ptor = protractor.getInstance();
        ptor.manage().deleteAllCookies();
        browser.get("/test/e2e/test-app.html");

        //clear local storage
        browser.executeScript("localStorage.clear();");
        ptor.driver.navigate().refresh();
      });

      it("should show T&C Dialog on new Google Account", function() {
        delete window.currentUser.termsAcceptanceDate;
        delete window.currentUser.email;

        expect(element(by.css("a.sign-in")).isDisplayed()).to.eventually.equal(true);
        //dialog does not show
        expect(element(by.css(".terms-conditions-modal")).isPresent()).to.eventually.equal(false);
        //click on sign in button
        element(by.css("a.sign-in")).click();
        element(by.css(".authorize-button")).click();
        //dialog shows
        expect(element(by.css(".terms-conditions-modal")).isDisplayed()).to.eventually.equal(true);
        //click authorize
        element(by.css(".accept-terms-button")).click();
        //auth dialog should disappear
        expect(element(by.css(".terms-conditions-modal")).isPresent()).to.eventually.equal(false);
      });

      it("should show Email Update dialogue after the user has accepted T&C", function() {
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

      it("should show company creation dialogue if no company is created", function() {
        //TODO
      });

      it("should follow complete workflow", function() {
        //TODO
      });

  });
})();
