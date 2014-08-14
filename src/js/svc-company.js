"use strict";

angular.module("risevision.common.company", ["risevision.common.gapi"])
  .service("companyService", [ "gapiLoader", "$q", "$log",
    function (gapiLoader, $q, $log) {

    this.getCompany = function (companyId) {
      var deferred = $q.defer();
      var obj = {
          "id": companyId
      };
      gapiLoader.get().then(function (gApi) {
        var request = gApi.client.store.company.get(obj);
        request.execute(function (resp) {
            $log.debug("getCompany resp", resp);
            deferred.resolve(resp);
        });
      });
      return deferred.promise;
    };

    this.getSubCompanies = function (companyId, search, cursor, count, sort) {
      var deferred = $q.defer();
      var obj = {
        "companyId": companyId,
        "search": search,
        "cursor": cursor,
        "count": count,
        "sort": sort
      };
      gapiLoader.get().then(function (gApi) {
        var request = gApi.client.store.subcompanies.get(obj);
        request.execute(function (resp) {
            deferred.resolve(resp);
        });
      });
      return deferred.promise;
    };

    this.loadSelectedCompany = function (selectedCompanyId, userCompany) {
        //this funtion assumes user and user.company are loaded
        var deferred = $q.defer();
        if (selectedCompanyId && selectedCompanyId !== userCompany.id) {
            this.getCompany(selectedCompanyId).then(function(res) {
                if (res.code === 0 && res.item) {
                    deferred.resolve(res.item);
                } else {
                    deferred.resolve(userCompany);
                }
            });
        } else {
            deferred.resolve(userCompany);
        }
        return deferred.promise;
    };

    this.validateAddressSimple = function(company) {
        var errors = [];
        if (!company.street) {
            errors.push("Missing Address (Line 1)");
        }
        if (!company.city) {
            errors.push("Missing City");
        }
        if (!company.country) {
            errors.push("Missing Country");
        }
        if (!company.province) {
            errors.push("Missing State / Province");
        }
        if (!company.postalCode) {
            errors.push("Missing Zip / Postal Code");
        }
        return errors;
    };


    this.updateAddress = function (company, validationRequired) {
        var deferred = $q.defer();
        var obj = {
            "id": company.id,
            "street": company.street,
            "unit": company.unit,
            "city": company.city,
            "country": company.country,
            "postalCode": company.postalCode,
            "province": company.province,
            "validate": validationRequired
        };
        gapiLoader.get().then(function (gApi) {
          var request = gApi.client.store.company.updateAddress(obj);
          request.execute(function (resp) {
              deferred.resolve(resp);
          });
        });

        return deferred.promise;
    };

    this.validateAddress = function (company) {
        var deferred = $q.defer();
        var obj = {
            "street": company.street,
            "unit": company.unit,
            "city": company.city,
            "country": company.country,
            "postalCode": company.postalCode,
            "province": company.province,
        };
        gapiLoader.get().then(function (gApi) {
          var request = gApi.client.store.company.validateAddress(obj);
          request.execute(function (resp) {
              deferred.resolve(resp);
          });
        });

        return deferred.promise;
    };

  }]);
