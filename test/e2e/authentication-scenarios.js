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

  describe("Authentication", function() {
  var ptor;

      before(function() {
        ptor = protractor.getInstance();
        ptor.manage().deleteAllCookies();
        browser.get("/test/e2e/index.html");

        //clear local storage
        browser.executeScript("localStorage.clear();");
        ptor.driver.navigate().refresh();
      });

      it("should authorize", function() {
        expect(element(by.css("a.sign-in")).isDisplayed()).to.eventually.equal(true);
        //dialog does not show
        expect(element(by.css(".authorization-modal")).isPresent()).to.eventually.equal(false);
        //click on sign in button
        element(by.css("a.sign-in")).click();
        //dialog shows
        expect(element(by.css(".authorization-modal")).isDisplayed()).to.eventually.equal(true);
        expect(element(by.css(".authorize-button")).isDisplayed()).to.eventually.equal(true);
        //click authorize
        element(by.css(".authorize-button")).click();
        //auth dialog should disappear
        expect(element(by.css(".authorization-modal")).isPresent()).to.eventually.equal(false);

      });

      it("should log out", function() {

        // browser.takeScreenshot().then(function(png) {
        // var stream = fs.createWriteStream("/tmp/screenshot.png");
        //   stream.write(new Buffer(png, "base64"));
        //   stream.end();
        // });
        //
        assert.eventually.isFalse(element(by.css("a.sign-in")).isDisplayed(), "sign in button should not show");
        expect(element(by.css("img.profile-pic")).isDisplayed()).to.eventually.equal(true);
        expect(element(by.css(".sign-out-button")).isDisplayed()).to.eventually.equal(false);

        //click on profile pic
        element(by.css("img.profile-pic")).click();


        //shows sign-out menu item
        expect(element(by.css(".sign-out-button")).isDisplayed()).to.eventually.equal(true);

        //click sign out
        element(by.css(".sign-out-button")).click();

        //signed out; sign-in button shows
        expect(element(by.css("a.sign-in")).isDisplayed()).to.eventually.equal(true);

      });

  });
})();
