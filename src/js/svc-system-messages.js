(function (angular) {

  "use strict";

  angular.module("risevision.common.systemmessages",
  ["risevision.common.gapi"])

    .factory("addSystemMessages", ["userState", function (userState) {

      function pushMessage (m, list) {
        //TODO add more sophisticated, sorting-based logic here
        list.push(m);
      }

      return function (messages) {
        if(!userState.messages) {
          userState.messages = [];
        }
        if(messages && messages instanceof Array) {
          messages.forEach(function (m) {
            //temporary logic to avoid duplicate messages
            var duplicate = false;
            userState.messages.forEach(function (um) {
              if(um.text === m.text) {duplicate = true; }
            });
            if(!duplicate) {
              pushMessage(m, userState.messages);
            }
          });
        }
      };
    }])

    .factory("getCoreSystemMessages", ["gapiLoader", "$q", "$log",
    function (gapiLoader, $q, $log) {
      return function (companyId) {
        var deferred = $q.defer();
        gapiLoader().then(function (gApi) {
          var request = gApi.client.core.systemmessage.list(
            { "companyId": companyId });
          request.execute(function (resp) {
            var items = resp;
            if(!(items instanceof Array) && items.items) { items = items.items; }
            $log.debug("getCoreSystemMessage resp", items);
            deferred.resolve(items);
          });
        });
        return deferred.promise;
      };
  }]);

})(angular);
