(function (angular){

  "use strict";

  angular.module("risevision.common.company", ["risevision.core.company",
  "risevision.common.userstate"])

    .service("selectedCompanyUrlHandler", ["$location", "userState",
      "getCompany", "$rootScope", "$log",
      function ($location, userState, getCompany, $rootScope, $log) {

        var that = this;
        if($location.search().cid && !userState.isLoggedIn()) {
          $log.debug("cid", $location.search().cid, "saved for later processing.");
          this.pendingSelectedCompany = $location.search().cid;
        }

        $rootScope.$on("risevision.user.userSignedIn", function () {
          if(that.pendingSelectedCompany) {
            $location.search("cid", that.pendingSelectedCompany);
            delete(that.pendingSelectedCompany);
            that.updateSelectedCompanyFromUrl();
          }
        });

        this.init = function () {
          // This parameter is only appended to the url if the user is logged in
          if (!$location.search().cid && userState.getSelectedCompanyId() &&
              userState.getSelectedCompanyId() !== userState.getUserCompanyId()) {
            $location.search("cid", userState.getSelectedCompanyId());
          }
          else if($location.search().cid &&
            userState.getSelectedCompanyId() !== userState.getUserCompanyId()) {
            $location.search("cid", null);
          }
          that.updateSelectedCompanyFromUrl();
        };

        this.updateUrl = function () {
          var selectedCompanyId = userState.getSelectedCompanyId();
          // This parameter is only appended to the url if the user is logged in
          if (selectedCompanyId) {
            if (selectedCompanyId !== userState.getUserCompanyId() &&
              $location.search().cid !== selectedCompanyId) {
              $location.search("cid", selectedCompanyId);
            }
          }
          else {
            if($location.search().cid) {
              $location.search({"cid" : null});
            }
          }
        };
        this.updateSelectedCompanyFromUrl = function () {
          var newCompanyId = $location.search().cid;
          if(userState.getSelectedCompanyId() &&
            newCompanyId && newCompanyId !== userState.getSelectedCompanyId()) {
            getCompany(newCompanyId).then(function (company) {
              userState.switchCompany(company);
            });
          }
        };
    }]);
  }
)(angular);
