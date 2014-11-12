/*jshint expr:true */

describe("Services: Core System Messages", function() {

  beforeEach(module("risevision.common.systemmessages"));

  beforeEach(module(function ($provide) {
    //stub services
    $provide.service("$q", function() {return Q;});
    $provide.value("userState", {
      isRiseVisionUser: function () {return true; },
      _restoreState: function () {}
    });
  }));

  it("should exist", function() {
    inject(function(systemMessages) {
      expect(systemMessages).to.be.ok;
    });
  });

});
