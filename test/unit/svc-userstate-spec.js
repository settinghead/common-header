/*jshint expr:true */
"use strict";

describe("Services: auth & user state", function() {

  beforeEach(module("risevision.common.userstate"));

  it("should exist", function(done) {
    inject(function(userState) {
      expect(userState.authenticate).be.defined;
      expect(userState.signOut).be.defined;
      done();
    });
  });
});
