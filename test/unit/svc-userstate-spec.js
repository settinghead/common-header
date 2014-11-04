/*jshint expr:true */
"use strict";

describe("Services: auth & user state", function() {

  beforeEach(module("risevision.common.userstate"));

  it("should exist", function(done) {
    inject(function(userState) {
      expect(userState.authenticate).to.be.ok;
      expect(userState.signOut).to.be.ok;
      done();
    });
  });
});
