(function (angular) {
  "use strict";

  angular.module("risevision.common.registration", [])

  .value("userStatusDependencies", {
    "termsConditionsAccepted": "registeredWithGoogle",
    "profileCreated": "termsConditionsAccepted",
    "companyCreated": "profileCreated",
    "registrationComplete": "companyCreated"
  })

  .factory("checkUserStatus", ["userStatusDependencies", "$injector",
    "$q",
    function (userStatusDependencies, $injector, $q) {

      var achieveStatus = function(status){
        var deferred = $q.defer();
        var dependency = userStatusDependencies[status];
        if(dependency) {
          achieveStatus(dependency).then(function (){
            $injector.get(status)().then(function (val){
              if(val === true) {
                deferred.resolve(status);
              }
              else {
                deferred.reject(status);
              }
            });
          }, function (haltingStatus) {
            deferred.reject(haltingStatus);
          });
        }
        else {
          //terminal
          $injector.get(status)().then(function (val){
            if(val === true) {
              deferred.resolve(status);
            }
            else {
              deferred.reject(status);
            }
          });
        }
        return deferred.promise;
      };

      return function (userState) {
        return achieveStatus("registrationComplete",
          function () {},
          function (status) {
            // if rejected at any given step,
            // show the dialog of that relevant step
            userState.status = status;
          });
      };
  }])

  .factory("registrationComplete", function () {
    return function () {return true;};
  })

  .factory("notLoggedIn", ["$q", function ($q) {
    return function (userState) {
      //TODO
    };
  }])

  .factory("termsConditionsAccepted", ["$q", function ($q) {
    return function (userState) {
      //TODO
    };
  }])

  .factory("termsConditionsAccepted", ["$q", function ($q) {
    return function (userState) {
      //TODO
    };
  }])

  .factory("registeredWithGoogle", [function () {
    return function (userState) {
      //TODO
    };
  }])

  .factory("profileCreated", [function () {
    return function (userState) {
      //TODO
    };
  }])

  .factory("companyCreated", [function () {
    return function (userState) {
      //TODO
    };
  }])

  .factory("notLoggedIn", [function () {
    return function (userState) {
      //TODO
    };
  }]);

})(angular);
