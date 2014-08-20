/*jshint expr:true */

describe("Services: Registration", function() {

  beforeEach(module("risevision.common.registration"));

  it("should exist", function(done) {
    inject(function(userStatusDependencies) {
      expect(userStatusDependencies).be.defined;
      done();
    });
  });

});
