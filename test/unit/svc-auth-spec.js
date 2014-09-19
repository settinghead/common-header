/*jshint expr:true */
"use strict";

describe("Services: authentication", function() {

  beforeEach(module("risevision.common.auth"));

  it("should exist", function(done) {
    inject(function(authenticate, signOut) {
      expect(authenticate).be.defined;
      expect(signOut).be.defined;
      done();
    });
  });
});
