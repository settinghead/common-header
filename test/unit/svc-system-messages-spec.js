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

  it("should register system message retriever", function (done) {
    inject(function(systemMessages, $q) {
      systemMessages.registerRetriever(function () {
        var deferred = $q.defer();
        deferred.resolve([{text: "This is a timeless message"}]);
        return deferred.promise;
      });
      systemMessages.resetAndGetMessages().then(function () {
        expect(systemMessages.length).to.equal(1);
        done();
      }, done);
    });
  });
  
});
