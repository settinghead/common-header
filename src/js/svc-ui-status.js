(function (angular) {
  "use strict";

angular.module("risevision.common.ui-status", [])

.constant("uiStatusDependencies", {
  _dependencies: {},
  addDependencies: function (deps) {
    angular.extend(this._dependencies, deps);
  }
})

.factory("uiStatusManager", ["$log", "$q", "$injector", "uiStatusDependencies",
  function ($log, $q, $injector, uiStatusDependencies) {

  var _status;
  var _dependencies = uiStatusDependencies._dependencies;

  //internal method that attempt to reach a particular status
  var _attemptStatus = function(status){
    var lastD;
    $log.debug("Attempting to reach status", status, "...");
    var dependencies = _dependencies[status];

    if(dependencies) {
      if(!(dependencies instanceof Array)) {
        dependencies = [dependencies];
      }

      var prevD = $q.defer(), firstD = prevD;

      angular.forEach(dependencies, function(dep) {
        var currentD = $q.defer();
        prevD.promise.then(currentD.resolve, function () {
          _attemptStatus(dep).then(function (){
            //should go here if any of the dependencies is satisfied
            if(_dependencies[dep]) {
              $log.debug("Deps for status", dep, "satisfied.");
            }
            $injector.get(status)().then(
              function () {
                $log.debug("Status", status, "satisfied.");
                currentD.resolve(true);
              },
              function () {
                $log.debug("Status", status, "not satisfied.");
                currentD.reject(dep);
              }
            ).finally(currentD.resolve);
          }, function () {
            $log.debug("Failed to reach status", dep, ".");
            currentD.reject(dep);
          });
        });
        lastD = prevD = currentD;
      });

      //commence the avalance
      firstD.reject();
    }
    else {
      //terminal
      lastD = $q.defer();
      $injector.get(status)().then(
        function () {
          $log.debug("Termination status", status, "satisfied.");
          lastD.resolve(true);
        },
        function () {
          $log.debug("Termination status", status, "not satisfied.");
          lastD.reject(status);
        }
      );
    }

    return lastD.promise;
  };

  var _recheckStatus = function (desiredStatus) {
    if(!desiredStatus) {desiredStatus = "registrationComplete"; }
    return _attemptStatus(desiredStatus).then(
      function () {
        _status = desiredStatus;
      },
      function (status) {
        // if rejected at any given step,
        // show the dialog of that relevant step
        _status = status;
      });
  };


  var invalidateStatus = function (desiredStatus) {
    _status = "pendingCheck";
    return _recheckStatus(desiredStatus);
  };

  var uiStateManager = {
    invalidateStatus: invalidateStatus,
    getStatus: function () { return _status; },
    isStatusUndetermined: function () { return _status === "pendingCheck"; }
  };


  window.state = uiStateManager;

  return uiStateManager;
}]);

})(angular);
