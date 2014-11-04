/*jshint expr:true */

describe("Services: uiStatusManager", function() {

  var world = {
    hasJobs: false,
    potBroken: false
  };

  beforeEach(module("risevision.common.ui-status"));

  beforeEach(module(function ($provide) {
    //stub services
    $provide.service("$q", function() {return Q;});
    $provide.constant("uiStatusDependencies", {
      _dependencies: {
        "canWakeUp": "canSleep",
        "canEarn": "canWakeUp",
        "canBuy": "canEarn",
        "canCook": "canBuy",
        "canEat" : ["canCook", "canGoOut"],
        "happy": "canEat"
      }
    });

    $provide.factory("canEarn", ["$q", function ($q) {
      var deferred = $q.defer();
      if(world.hasJobs) { deferred.resolve(); }
      else {deferred.reject("canEarn"); }
      return deferred.promise();
    }]);

    $provide.factory("canCook", ["$q", function ($q) {
      var deferred = $q.defer();
      if(world.potBroken) {deferred.reject("canCook"); }
      else { deferred.resolve(); }
      return deferred.promise();
    }]);

    $provide.value("$log", {
      debug: function () {
        // console.log.apply(null, arguments);
      }
    });
  }));

  it("should exist", function(done) {
    inject(function(uiStatusManager) {
      expect(uiStatusManager).to.be.ok;
      done();
    });
  });

  it("should get stuck at 'earn' if there are no job on the market", function (done) {
    world.hasJobs = false;
    inject(function (uiStatusManager) {
      uiStatusManager.invalidateStatus("happy").then(function () {
        expect(uiStatusManager.getStatus().to.be.equal("canEarn"));
        done();}, done).finally(done);
    });
  });

  it("should get stuck at eat if the pot is broken", function (done) {
    world.potBroken = true;
    inject(function (uiStatusManager) {
      uiStatusManager.invalidateStatus("happy").then(function () {
        expect(uiStatusManager.getStatus().to.be.equal("canCook"));
        done();}, done).finally(done);
    });
  });

  it("should allow me to be happy", function (done) {
    world.potBroken = false; world.hasJobs = true;
    inject(function (uiStatusManager) {
      uiStatusManager.invalidateStatus("happy").then(function () {
        expect(uiStatusManager.getStatus().to.be.equal("happy"));
        done();}, done).finally(done);
    });
  });



});
