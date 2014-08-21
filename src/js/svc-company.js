"use strict";

angular.module("risevision.common.company",
  [
    "risevision.common.config",
    "risevision.common.gapi"
  ])
  .service("companyService", [ "coreAPILoader", "$q", "$log",
    function (coreAPILoader, $q, $log) {

    var that = this;
    this.getCompany = function (companyId) {
      var deferred = $q.defer();
      var obj = {
          "id": companyId
      };
      coreAPILoader.get().then(function (coreApi) {
        var request = coreApi.company.get(obj);
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
      coreAPILoader.get().then(function (coreApi) {
        var request = coreApi.subcompanies.get(obj);
        request.execute(function (resp) {
            deferred.resolve(resp);
        });
      });
      return deferred.promise;
    };

    this.getUserCompanies = function () {
        var deferred = $q.defer();
        coreAPILoader.get().then(function (client) {
          var request = client.company.list({});
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


    this.updateCompany = function (fields, validationRequired) {
        var deferred = $q.defer();
        // var obj = {
        //     "id": company.id,
        //     "street": company.street,
        //     "unit": company.unit,
        //     "city": company.city,
        //     "country": company.country,
        //     "postalCode": company.postalCode,
        //     "province": company.province,
        //     "validate": validationRequired
        // };
        fields.validate = validationRequired || false;
        coreAPILoader.get().then(function (coreApi) {
          var request = coreApi.company.update(fields);
          request.execute(function (resp) {
              deferred.resolve(resp);
          });
        });

        return deferred.promise;
    };

    this.createCompany = function (company) {
      var deferred = $q.defer();
      company.validate = true;
      coreAPILoader.get().then(function (coreApi) {
        var request = coreApi.company.add(company);
        request.execute(function (resp) {
            deferred.resolve(resp);
        });
      });
      return deferred.promise;
    };

    this.createOrUpdateCompany = function (company) {
      if(company.id) {
        return that.createCompany(company);
      }
      else{
        return that.updateCompany(company);
      }
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
        coreAPILoader.get().then(function (coreApi) {
          var request = coreApi.company.validateAddress(obj);
          request.execute(function (resp) {
              deferred.resolve(resp);
          });
        });

        return deferred.promise;
    };

  }]);
