(function (angular){

  "use strict";

  angular.module("risevision.common.cache", [])
    .value("rvStorage", sessionStorage)

    .factory("userInfoCache", ["$cacheFactory", function ($cacheFactory) {
      return $cacheFactory("user-info-cache");
    }])

    .service("cacheService", ["rvStorage", function (rvStorage) {
      var products = [];
      this.clear = function () {
          rvStorage.clear();
      };

      this.getProduct = function (productId) {
          if (products && products.length > 0) {
              for (var i = 0; i < products.length; i++) {
                  if (products[i].id === productId) {
                      return products[i];
                  }
              }
          }
          return null;
      };

      this.get = function (key, defaultValue) {
          try {
              var res = rvStorage.getItem(key);
              if (res) {
                  return JSON.parse(res);
              } else {
                  return defaultValue;
              }
          }
          catch (e) {
              return defaultValue;
          }
      };

  } ]);

})(angular);
