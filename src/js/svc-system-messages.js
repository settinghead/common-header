(function (angular) {

  "use strict";

  angular.module("risevision.common.systemmessages", [])

    .factory("systemMessages", [function () {

      var messages = [];

      function pushMessage (m, list) {
        //TODO add more sophisticated, sorting-based logic here
        list.push(m);
      }

      messages.addMessages = function (newMessages) {
        if(newMessages && newMessages instanceof Array) {
          newMessages = (function filterNewMessages(items) {
            var _newItems = [];
            angular.forEach(items, function (msg) {
              var endDate = new Date(msg.endDate || "2199-12-31"),
                  startDate = new Date(msg.startDate || 0),
                  currentDate = new Date();
              if(currentDate > startDate && currentDate < endDate ) {
                _newItems.push(msg);
              }
            });
            return _newItems;
          })(newMessages);
          newMessages.forEach(function (m) {
            //temporary logic to avoid duplicate messages
            var duplicate = false;
            messages.forEach(function (um) {
              if(um.text === m.text) {duplicate = true; }
            });
            if(!duplicate) {
              pushMessage(m, messages);
            }
          });
        }
      };

      messages.clear = function () {
        messages.length = 0;
      };

      return messages;

    }]);

})(angular);
