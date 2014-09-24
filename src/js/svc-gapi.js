/* jshint ignore:start */
var gapiLoadingStatus = null;
function handleClientJSLoad() {
    gapiLoadingStatus = "loaded";
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
  .factory("oauthAPILoader", ["gapiLoader", "$q", "$log",
   function (gapiLoader, $q, $log) {
    var deferred = $q.defer();
    var promise;

    return function () {
      if (!promise) {
        promise = deferred.promise;
        gapiLoader().then(function (gApi) {
          gApi.client.load("oauth2", "v2", function () {
              $log.info("OAuth2 API is loaded");
              deferred.resolve(gApi);
          });
        });
      }
      return promise;
    };

  }])
  .factory("gapiLoader", ["$q", "$window", function ($q, $window) {
    var deferred = $q.defer();

    return function () {
      var gapiLoaded;

      if($window.gapiLoadingStatus === "loaded") {
        deferred.resolve($window.gapi);
      }

      else if(!$window.gapiLoadingStatus) {
        $window.gapiLoadingStatus = "loading";

        var src = $window.gapiSrc || "//apis.google.com/js/client.js?onload=handleClientJSLoad";
        var fileref = document.createElement("script");
        fileref.setAttribute("type","text/javascript");
        fileref.setAttribute("src", src);
        if (typeof fileref!=="undefined") {
          document.getElementsByTagName("body")[0].appendChild(fileref);
        }

        gapiLoaded = function () {
          deferred.resolve($window.gapi);
          $window.removeEventListener("gapi.loaded", gapiLoaded, false);
        };
        $window.addEventListener("gapi.loaded", gapiLoaded, false);
      }
      return deferred.promise;
    };
  }])
  .factory("coreAPILoader", ["gapiLoader", "$q", "CORE_URL",
    "$location", "$log",
    function (gapiLoader, $q, CORE_URL, $location, $log) {
    var deferred = $q.defer();
    var baseUrl = $location.search().core_api_base_url ? $location.search().core_api_base_url + "/_ah/api": CORE_URL;
    return function () {
      gapiLoader().then(function (gApi) {
        if(gApi.client.core){
          //already loaded. return right away
          deferred.resolve(gApi.client.core);
        }
        else {
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
        }
      });
      return deferred.promise;
    };
  }])
  .factory("riseAPILoader", ["gapiLoader", "$q", "CORE_URL",
    "$location", "$log",
    function (gapiLoader, $q, CORE_URL, $location, $log) {
    var deferred = $q.defer();
    var baseUrl = $location.search().core_api_base_url ? $location.search().core_api_base_url + "/_ah/api": CORE_URL;
    return function () {
      gapiLoader().then(function (gApi) {
        if(gApi.client.rise){
          //already loaded. return right away
          deferred.resolve(gApi.client.rise);
        }
        else {
          gApi.client.load("rise", "v0", function () {
            if (gApi.client.core) {
              $log.info("Rise API Loaded");
              deferred.resolve(gApi.client.rise);
            } else {
              var errMsg = "Rise API Load Failed";
              $log.error(errMsg);
              deferred.reject(errMsg);
            }
          }, baseUrl);
        }
      });
      return deferred.promise;
    };
  }]);
