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

  describe("Companies", function() {
  var ptor;

      before(function() {
        ptor = protractor.getInstance();
        ptor.manage().deleteAllCookies();
        browser.get("/test/e2e/index.html#/shopping-cart");

        //clear local storage
        browser.executeScript("localStorage.clear();");

        ptor.driver.navigate().refresh();
        element(by.id("reset-db")).click();
      });

      xdescribe("Select Subcompany", function () {
        it("Opens select subcompany dialog", function () {
          element(by.css("button.sign-in")).click();
          assert.eventually.isFalse(element(by.css("button.sign-in")).isDisplayed(), "sign in button should not show");
          element(by.css(".company-buttons-icon")).click();
          assert.eventually.isTrue(element(by.css(".select-subcompany-menu-button")).isDisplayed(),
            "Select subcompany menu item should present");
          element(by.css(".move-company-menu-button")).click();

          assert.eventually.isTrue(element(by.css(".select-subcompany-modal")).isDisplayed(),
            "Move company dialog should show");
        });

        it("Switches to subcompany", function () {
          //TODO
        });

        it("Switches back to parent company", function () {
          //TODO
        });
      });

      describe("Add subcompany & move company", function () {
        it("Opens Add Subcompany dialog", function () {

          browser.executeScript("gapi.setPendingSignInUser('michael.sanchez@awesome.io')");
          element(by.css("button.sign-in")).click();
          assert.eventually.isFalse(element(by.css("button.sign-in")).isDisplayed(), "sign in button should not show");

          element(by.css(".company-buttons-icon")).click();
          assert.eventually.isTrue(element(by.css(".add-subcompany-menu-button")).isDisplayed(),
            "Add subcompany menu item should show");
          element(by.css(".add-subcompany-menu-button")).click();
          assert.eventually.isTrue(element(by.css(".add-subcompany-modal")).isDisplayed(),
            "Add subcompany dialog should show");
            ptor.sleep(500);
        });

        it("Opens Move Company Dialog", function() {
          element(by.css(".move-subcompany-button")).click();

          assert.eventually.isTrue(element(by.css(".move-company-modal")).isDisplayed(),
            "Move company dialog should show");
        });

        it("Shows error on invalid auth key", function () {
          element(by.id("auth-key")).clear();
          element(by.id("auth-key")).sendKeys("invalid-auth-key");
          element(by.css(".retrieve-company-details-button")).click();
          assert.eventually.isTrue(element(by.css(".alert.alert-danger")).isDisplayed(),
            "Error message should show");
        });

        it("Retrieves Company Info", function () {
          element(by.id("auth-key")).clear();
          element(by.id("auth-key")).sendKeys("3509cd9b-e9ba-47d2-84bb-f954db4641b1");
          element(by.css(".retrieve-company-details-button")).click();

          assert.eventually.isTrue(element(by.css(".company-details-info")).isDisplayed(),
            "Company details info should show");
        });

        it("Should Move Company", function () {
          element(by.css(".move-company-button")).click();
          assert.eventually.isTrue(element(by.css(".alert.alert-success")).isDisplayed(),
            "Success message should show");
          assert.eventually.isFalse(element(by.css(".move-company-button")).isDisplayed(),
            "Move company button should hide");

        });

        it("Move Company Dialog Should Close", function () {
          element(by.css("button.close-move-company-button")).click();
          assert.eventually.isFalse(element(by.css(".move-company-modal")).isPresent(),
            "Move company dialog should hide");
        });

        it("Closes Add subcompany Dialog", function () {
          element(by.css(".cancel-add-subcompany-button")).click();
          assert.eventually.isFalse(element(by.css(".add-subcompany-modal")).isPresent(),
            "Add subcompany dialog should hide");
        });
      });

      describe("Company Users", function () {
        it("Opens Company Users Dialog and load company users", function() {
          element(by.css(".company-buttons-icon")).click();
          assert.eventually.isTrue(element(by.css(".company-users-menu-button")).isDisplayed(),
            "Company users menu item should present");
          element(by.css(".company-users-menu-button")).click();
          assert.eventually.isTrue(element(by.css(".company-users-modal")).isDisplayed(),
            "Company users dialog should show");
        });

        it("loads up a list of users for the company", function () {
          assert.eventually.strictEqual(element.all(by.css(".company-users-list-item")).count(), 34,
            "Loads up 34 users");
        });

        it("opens up Add User dialog", function () {
          element(by.css("button.add-company-user-button")).click();
          assert.eventually.isTrue(element(by.css(".user-settings-modal")).isPresent(), "Add user dialog should show");
        });

        it("adds a user", function () {
          element(by.id("user-settings-username")).sendKeys("noobuser@somecompany.com");
          element(by.id("user-settings-first-name")).sendKeys("John");
          element(by.id("user-settings-last-name")).sendKeys("Noob");
          element(by.id("user-settings-phone")).sendKeys("000-000-0000");
          element(by.id("user-settings-email")).sendKeys("noobuser@somecompany.com");
          element(by.id("save-button")).click();
          assert.eventually.isFalse(element(by.css(".user-settings-modal")).isPresent(), "Add user dialog should hide");

          assert.eventually.strictEqual(element.all(by.css(".company-users-list-item")).count(), 35,
            "Loads up 35 users");
        });

        it("Company Users Dialog Should Close", function () {
          element(by.css("button.close-company-users-button")).click();
          assert.eventually.isFalse(element(by.css(".company-users-modal")).isPresent(),
            "Company Users dialog should hide");
        });
      });

      describe("Company Settings", function () {
        it("Opens Company Settings Dialog", function() {
          element(by.css(".company-buttons-icon")).click();
          assert.eventually.isTrue(element(by.css(".company-settings-menu-button")).isDisplayed(),
            "Company settings menu item should present");
          element(by.css(".company-settings-menu-button")).click();
          assert.eventually.isTrue(element(by.css(".company-settings-modal")).isDisplayed(),
            "Company settings dialog should show");
        });

        it("Company Settings Dialog Should Close", function () {
          element(by.css("button.close-company-settings-button")).click();
          assert.eventually.isFalse(element(by.css(".company-settings-modal")).isPresent(),
            "Company Settings dialog should hide");
        });
      });

  });
})();
