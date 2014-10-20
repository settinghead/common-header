(function (angular) {
  "use strict";

angular.module("risevision.common.ui-status", [])

.constant("uiStatusDependencies", {
  _dependencies: {},
  addDependencies: function (deps) {
    angular.extend(this._dependencies, deps);
  }
})

.factory("uiStatusManager", ["$log", "$q", "$injector",
"uiStatusDependencies", "$rootScope",
  function ($log, $q, $injector, uiStatusDependencies, $rootScope) {

  var _status, _goalStatus;
  var _dependencyMap = uiStatusDependencies._dependencies;

  //internal method that attempt to reach a particular status
  var _attemptStatus = function(status){
    var lastD;
    $log.debug("Attempting to reach status", status, "...");
    var dependencies = _dependencyMap[status];

    if(dependencies) {
      if(!(dependencies instanceof Array)) {
        dependencies = [dependencies];
      }

      var prevD = $q.defer(), firstD = prevD; //chain sibling dependency together

      angular.forEach(dependencies, function(dep) {
        //iterate through dependencies
        var currentD = $q.defer();
        prevD.promise.then(currentD.resolve, function () {
          _attemptStatus(dep).then(function (){
            //should come here if any of the dependencies is satisfied
            if(_dependencyMap[dep]) {
              $log.debug("Deps for status", dep, "satisfied.");
            }
            //find factory function and check for satisfaction
            $injector.get(status)().then(
              function () {
                $log.debug("Status", status, "satisfied.");
                currentD.resolve(true);
              },
              function () {
                $log.debug("Status", status, "not satisfied.");
                currentD.reject(status);
              }
            );
          }, function (lastRej) {
            if(_dependencyMap[dep]) {
              $log.debug("Failed to reach status", dep, " because its dependencies are not satisfied. Last rejected dep: ", lastRej);
              currentD.reject(lastRej);
            }
            else {
              currentD.reject(dep);
            }

          });
        });
        lastD = prevD = currentD;
      });

      //commence the avalance
      firstD.reject();
    }
    else {
      //at deep level of termination status
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
    if(!desiredStatus) {
      if(_goalStatus) { desiredStatus = _goalStatus; }
      else { throw "You must specify an initial status to achieve. "; }
    }
    else {
      //register what the goal status it for subsequent attempts
      _goalStatus = desiredStatus;
    }
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
    cancelValidation: function () {
      _status = "";
      $rootScope.$broadcast("risevision.uiStatus.validationCancelled");
      $log.debug("UI status validation cancelled.");
    },
    getStatus: function () { return _status; },
    isStatusUndetermined: function () { return _status === "pendingCheck"; }
  };

  return uiStateManager;
}]);

})(angular);
