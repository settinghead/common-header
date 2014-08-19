/* jshint ignore:start */
var isClientJS = false;
function handleClientJSLoad() {
    isClientJS = true;
    console.log("ClientJS is loaded.");
    //Ready: create a generic event
    var evt = document.createEvent("Events");
    //Aim: initialize it to be the event we want
    evt.initEvent("gapi.loaded", true, true);
    //FIRE!
    window.dispatchEvent(evt);
}
/* jshint ignore:end */

angular.module("risevision.common.gapi", [])
  .factory("oauthAPILoader", ["gapiLoader", "$q", function (gapiLoader, $q) {
    var deferred = $q.defer();
    var promise;

    var factory = {
      get: function () {
        if (!promise) {
          promise = deferred.promise;
          gapiLoader.get().then(function (gApi) {
            gApi.client.load("oauth2", "v2", function () {
                console.log("OAuth2 API is loaded");
                deferred.resolve(gApi);
            });
          });
        }
        return promise;
      }
    };
    return factory;

  }])
  .factory("gapiLoader", ["$q", "$window", function ($q, $window) {
    return {
      get: function () {
        var deferred = $q.defer(), gapiLoaded;

        if($window.isClientJS) {
          deferred.resolve($window.gapi);
        }

        else {
          gapiLoaded = function () {
            deferred.resolve($window.gapi);
            $window.removeEventListener("gapi.loaded", gapiLoaded, false);
          };
          $window.addEventListener("gapi.loaded", gapiLoaded, false);
        }
        return deferred.promise;
      }
    };
  }])
  .factory("coreAPILoader", ["gapiLoader", "$q", "CORE_URL",
    "$location", "$log",
    function (gapiLoader, $q, CORE_URL, $location, $log) {
    var deferred = $q.defer();
    var baseUrl = $location.search().core_api_base_url ? $location.search().core_api_base_url + "/_ah/api": CORE_URL;
    var promise;
    var factory = {
      get: function () {
        if (!promise) {
          promise = deferred.promise;
          gapiLoader.get().then(function (gApi) {
            gApi.client.load("core", "v0", function () {
              if (gApi.client.core) {
                $log.info("Core API Loaded");
                deferred.resolve(gApi.client.core);
              } else {
                var errMsg = "Core API Load Failed";
                $log.error(errMsg);
                deferred.reject(errMsg);
              }
            }, baseUrl);
          });
        }
        return promise;
      }
    };
    return factory;

  }]);
