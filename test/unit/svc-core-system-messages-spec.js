/*jshint expr:true */

describe("Services: Core System Messages", function() {

  beforeEach(module("risevision.common.systemmessages"));

  it("should exist", function() {
    inject(function(getCoreSystemMessages, systemMessages) {
      expect(getCoreSystemMessages).be.defined;
      expect(systemMessages).be.defined;
    });
  });

  beforeEach(module(function ($provide) {
    //stub services
    $provide.service("$q", function() {return Q;});
    $provide.value("userState", {
      isRiseVisionUser: function () {return true; }
    });
  }));
});
