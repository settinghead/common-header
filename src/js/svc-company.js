"use strict";

angular.module("risevision.common.company",
  [
    "risevision.common.config",
    "risevision.common.gapi",
    "risevision.common.cache",
    "risevision.common.oauth2"
  ])

  .factory("switchCompany", ["userState", function (userState) {
    return function (company) {
      userState.selectedCompanyId = company.id;
      userState.selectedCompanyName = company.name;
    };
  }])

  .factory("moveCompany", ["$q", "$log", "coreAPILoader",
  function ($q, $log, coreAPILoader) {
    return function (companyId, parentCompanyId) {
      var deferred = $q.defer();
      coreAPILoader().then(function (coreApi) {
        var request = coreApi.company.move({id: companyId, newParentId: parentCompanyId});
        request.execute(function (resp) {
          if(resp.result) {
            deferred.resolve(resp.item);
          }
          else {
            deferred.reject(resp);
          }
        }, deferred.reject);
      });
      return deferred.promise;
    };
  }])

  .factory("createCompany", ["$q", "coreAPILoader", function ($q, coreAPILoader) {
    return function (company) {
      var deferred = $q.defer();
      company.validate = true;
      coreAPILoader().then(function (coreApi) {
        var request = coreApi.company.add(company);
        request.execute(function (resp) {
          if(resp.result) {
            deferred.resolve(resp.item);
          }
          else {
            deferred.reject(resp);
          }
        }, deferred.reject);
      });
      return deferred.promise;
    };
  }])

  .factory("getUserCompanies", ["$q", "$log", "coreAPILoader", "userState",
  "getOAuthUserInfo", "createCompany",
  function ($q, $log, coreAPILoader, userState, getOAuthUserInfo, createCompany) {
    return function () {
      var deferred = $q.defer();
      $log.debug("getUserCompanies called");

      coreAPILoader().then(function (client) {
        var request = client.company.list({});
        request.execute(function (resp) {
          $log.debug("client.company.list resp", resp);
          if(resp.result === true) {
            deferred.resolve(resp);
            //update user state if supplied
            var updateState = function (c) {
              $log.debug("selectedCompany", c);
              userState.user.company = c;
              userState.isAuthed = true;
              userState.user.company = c;

              //release 1 simpification - everyone is Purchaser ("pu" role)
              userState.isRiseUser = true;
              userState.isRiseAdmin = c.userRoles && c.userRoles.indexOf("ba") > -1;

              userState.selectedCompanyName = c.name;
              userState.selectedCompanyId = c.id;
            };
            if (resp.items && resp.items.length > 0) {
              updateState(resp.items[0]);
            }
            else {
              getOAuthUserInfo().then(function (userInfo) {
                createCompany({
                  name: userInfo.email + "'s Company"}).then(updateState, deferred.reject);
              }, deferred.reject);
            }
          }
          else {
            delete userState.selectedCompanyName;
            delete userState.selectedCompanyId;
            deferred.reject();
          }
        });
      }, deferred.reject);
      return deferred.promise;
    };
  }])

  .service("companyService", ["coreAPILoader", "$q", "$log",
    function (coreAPILoader, $q, $log) {

    this.getCompany = function (companyId) {
      var deferred = $q.defer();
      if(companyId) {
        var obj = {
            "id": companyId
        };
        coreAPILoader().then(function (coreApi) {
          var request = coreApi.company.get(obj);
          request.execute(function (resp) {
              $log.debug("getCompany resp", resp);
              if(resp.result) {
                deferred.resolve(resp.item);
              }
              else {
                deferred.reject(resp);
              }
          });
        });
      }
      else {
        deferred.resolve({});
      }
      return deferred.promise;
    };

    this.getCompanies = function (companyId, search, cursor, count, sort) {
      var deferred = $q.defer();
      var obj = {
        "companyId": companyId,
        "search": search,
        "cursor": cursor,
        "count": count,
        "sort": sort
      };
      $log.debug("getCompanies called with", obj);
      coreAPILoader().then(function (coreApi) {
        var request = coreApi.company.list(obj);
        request.execute(function (resp) {
            $log.debug("getCompanies resp", resp);
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
        coreAPILoader().then(function (coreApi) {
          var request = coreApi.company.update(fields);
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
        coreAPILoader().then(function (coreApi) {
          var request = coreApi.company.validateAddress(obj);
          request.execute(function (resp) {
              deferred.resolve(resp);
          });
        });

        return deferred.promise;
    };

  }]);
