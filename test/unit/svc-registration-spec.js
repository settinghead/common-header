/*jshint expr:true */

describe("Services: Registration", function() {

  beforeEach(module("risevision.ui-flow"));

  it("should exist", function(done) {
    inject(function(uiStatusDependencies) {
      expect(uiStatusDependencies).to.be.ok;
      done();
    });
  });

});
