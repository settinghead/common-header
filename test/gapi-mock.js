(function (_, window, handleClientJSLoad) {
  "use strict";

  /*global _,gapi,handleClientJSLoad: false */

  window.gapi = {};

  var delayed = function () {
    if(arguments) {
      var cb = arguments[0];
      var restArgs = Array.prototype.slice.call(arguments, 1);
      if(!window.gapi._fakeDb.serverDelay) {
        cb.apply(null, restArgs);
      }
      else {
        setTimeout(function (){
          cb.apply(null, restArgs);
        }, window.gapi._fakeDb.serverDelay);
      }
    }
  };

  var guid = (function() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
                 .toString(16)
                 .substring(1);
    }
    return function() {
      return s4() + s4() + "-" + s4() + "-" + s4() + "-" +
             s4() + "-" + s4() + s4() + s4();
    };
  })();

  window.gapi.resetDb = function () {
    if(!window.gapi._fakeDb) {
      window.gapi._fakeDb = {serverDelay: 0};
    }
    window.gapi._fakeDb.companies = _.cloneDeep(companies);
    window.gapi._fakeDb.currentUser = _.cloneDeep(currentUser);
    window.gapi._fakeDb.currentAccount = _.cloneDeep(currentAccount);
    window.gapi._fakeDb.systemMessages = _.cloneDeep(systemMessages);
  };

  window.gapi.resetUser = function () {
    window.gapi._fakeDb.currentUser = _.cloneDeep(currentUser);
  };

  window.gapi.resetAccount = function () {
    window.gapi._fakeDb.currentAccount = _.cloneDeep(currentAccount);
  };

  window.gapi.resetCompanies = function () {
    window.gapi._fakeDb.companies = _.cloneDeep(companies);
  };

  window.gapi.clearCompanies = function () {
    while(window.gapi._fakeDb.companies.length > 0) {
      window.gapi._fakeDb.companies.pop();
    }
  };

  window.gapi.resetSystemMessages = function () {
    window.gapi._fakeDb.systemMessages = _.cloneDeep(systemMessages);
  };

  window.gapi.companyRespSkeleton = {
    "creationDate": "2012-04-03T20:52:05.000Z",
    "timeZoneOffset": -300,
    "authKey": "testKey",
    "settings": {
      "supportEmail": "http://community.risevision.com/rise_vision_inc",
      "mailSyncApiKey": "",
      "tutorialURL": "http://www.youtube.com/embed/XqGyHiKlJHA?list=PLfWX1mfZa-4QuNaKuW7k8bVCKTFmhzF_o",
      "adsenseServiceId": "",
      "allowCompanyRegistrations": "false",
      "analyticsID": "UA-11548828-1",
      "userStartPresentation": "6f19b1bd-c85a-45aa-be26-77cd5cd56ba7",
      "bannerTargetURL": "",
      "newsURL": "http://www.risevision.com/blog/",
      "mailSyncEnabled": "false",
      "mailSyncService": "MailChimp",
      "bannerBackgroundColor": "rgb(238, 238, 238)",
      "helpURL": "http://www.risevision.com/help/",
      "mailSyncListId": "",
      "logoURL": "http://c558385.r85.cf2.rackcdn.com/rise-logo.png",
      "adsenseServiceSlot": "",
      "salesEmail": "http://community.risevision.com/rise_vision_inc",
      "operatorStartPresentation": "6f19b1bd-c85a-45aa-be26-77cd5cd56ba7",
      "logoutURL": "",
      "bannerURL": "",
      "logoTargetURL": "http://www.risevision.com",
      "mailSyncApiUrl": ""
    },
    "mailSyncEnabled": false,
    "alertKey": "b0ed8df4-b49f-431b-a52e-e53ac2635c74",
    "alertSettings": {
      "enabled": true,
      "allowedStatuses": [
      "Actual",
      "Exercise",
      "System",
      "Test",
      "Draft"
      ],
      "allowedCategories": [
      "Geo",
      "Met",
      "Safety",
      "Security",
      "Rescue",
      "Fire",
      "Health",
      "Env",
      "Transport",
      "Infra",
      "CBRNE",
      "Other"
      ],
      "allowedUrgencies": [
      "Immediate",
      "Expected",
      "Future",
      "Past",
      "Unknown"
      ],
      "allowedSeverities": [
      "Extreme",
      "Severe",
      "Moderate",
      "Minor",
      "Unknown"
      ],
      "allowedCertainties": [
      "Observed",
      "Likely",
      "Possible",
      "Unlikely",
      "Unknown"
      ],
      "textFields": [
      "headline"
      ],
      "presentationId": "932a85ed-ddb4-4ac0-bd3c-431804c659a0",
      "defaultExpiry": 60
    },
    "claimId": "ZAK8JYTSAFZ5",
    "companyType": "serviceProvider",
    "servicesProvided": [
    "support",
    "Digital Signage"
    ],
    "marketSegments": [
    "education",
    "financial",
    "healthCare",
    "hospitality",
    "manufacturing",
    "technology",
    "nonprofit",
    "religious",
    "quickServe",
    "retail",
    "service"
    ],
    "viewsPerDisplay": "20",
    "adsEarn": false,
    "adsInterested": false,
  };

  var currentAccount = {
    "result": true,
    "code": 200,
    "message": "OK",
    "item": {
      "username": "michael.sanchez@awesome.io",
      "changedBy": "bloosbrock@gmail.com",
      "changeDate": "2014-07-18T11:38:24.668Z"
    },
    "etag": "\"MH7KOPL7ADNdruowVC6-7YuLjZw/-QiBW2KeCQy_zrNjQ2_iN6pdhkg\""
  };

  var currentUser = {
    "result": true,
    "code": 200,
    "message": "OK",
    "item": {
      "id": "c173f77e-7069-45bb-9d08-99bd2db7faf8",
      "companyId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
      "username": "michael.sanchez@awesome.io",
      "creationDate": "2014-05-12T15:45:20.289Z",
      "firstName": "Michael",
      "lastName": "Sanchez",
      "email": "michael.sanchez@awesome.io",
      "phone": "+1123-456-7890",
      "lastLogin": "2014-08-18T12:03:40.000Z",
      "status": 1,
      "roles": [
      "ce",
      "cp",
      "da",
      "ua",
      "pu",
      "ba",
      "sa"
      ],
      "termsAcceptanceDate": "2014-06-19T18:01:33.000Z",
      "showTutorial": false,
      "mailSyncEnabled": false,
      "changedBy": "bloosbrock@gmail.com",
      "changeDate": "2014-07-18T11:38:24.668Z"
    },
    "etag": "\"MH7KOPL7ADNdruowVC6-7YuLjZw/-QiBW2KeCQy_zrNjQ2_iN6pdhkg\""
  };

  var systemMessages = {
   "items": [
      {
       "text": "We have updated our <a href=\"http://www.risevision." +
         "com/terms-service-privacy/\" target=_blank>Service Agreement" +
         "</a> with you. Please <a href=\"http://www.risevision.com/" +
         "terms-service-privacy/\" target=_blank>CLICK HERE</a> here to" +
         " review. Thank You.",
       "startDate": "2001-01-01T00:00:00.000Z",
       "endDate": "2014-05-13T00:00:00.000Z",
       "kind": "core#systemmessageItem"
     },
     {
      "text": "Everything 10% Off in the next 10 seconds",
      "startDate": "2001-01-01T00:00:00.000Z",
      "endDate": "2014-09-13T00:00:00.000Z",
      "kind": "core#systemmessageItem"
     }
   ],
   "kind": "core#systemmessage",
   "etag": "\"DxU-6pohsdi2UIVUQMfQkq7ADWs/7wbH6LlcDW2l8ZyL1nAod1Q9wFE\""
 };

  var companies = [{
    "id": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
    "name": "Rise Vision Test Co.",
    "street": "302 The East Mall",
    "unit": "Suite 301",
    "city": "Etobicoke",
    "province": "ON",
    "country": "CA",
    "postalCode": "M9B 6C7",
    "telephone": "416-538-1291",
    "latitude": 43.6371538,
    "longitude": -79.5570762,
    "networkOperatorStatus": 1,
    "networkOperatorStatusChangeDate": "2010-05-13T20:15:01.000Z",
    "companyStatus": 1,
    "companyStatusChangeDate": "2010-05-13T20:15:01.000Z",
    "changedBy": "steve.sherrie@risevision.com",
    "changeDate": "2014-05-23T20:03:01.635Z",
    "kind": "core#userItem"
  },
  {
   "id": "5129927f-44dc-44ea-9f1e-83f6e86d8aa4",
   "name": "0ThrasherBeer0@gmail.com's Company",
   "street": "15 Toronto St",
   "unit": "#208",
   "city": "Toronto",
   "province": "ON",
   "country": "CA",
   "postalCode": "M5A 4P7",
   "address": "15 Toronto St, #208, Toronto, ON, CA, M5A 4P7",
   "timeZone": "(GMT  00:00) Dublin, Edinburgh, Lisbon, London",
   "parentId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
   "networkOperatorStatus": 1,
   "networkOperatorStatusChangeDate": "2013-10-07T15:37:25.858Z",
   "companyStatus": 1,
   "companyStatusChangeDate": "2013-10-07T15:37:25.858Z",
   "changedBy": "steve.sherrie@risevision.com",
   "changeDate": "2014-05-23T16:36:14.523Z",
   "kind": "core#companyItem"
  },
  {
   "id": "87717b9a-9dcc-4ea7-948c-028f03f62d01",
   "name": "2nd Child Company",
   "street": "15 Toronto St",
   "unit": "1101",
   "city": "Toronto",
   "province": "ON",
   "country": "CA",
   "postalCode": "M5A 2N7",
   "address": "15 Toronto St, 1101, Toronto, ON, CA, M5A 2N7",
   "timeZone": "(GMT  00:00) Dublin, Edinburgh, Lisbon, London",
   "parentId": "06fcbf8f-c1a2-4e3e-b4ad-48372650d74b",
   "networkOperatorStatus": 1,
   "networkOperatorStatusChangeDate": "2014-05-27T15:01:36.541Z",
   "companyStatus": 1,
   "companyStatusChangeDate": "2014-05-27T15:01:36.540Z",
   "changedBy": "System",
   "changeDate": "2014-05-28T19:28:03.263Z",
   "kind": "core#companyItem"
  },
  {
   "id": "029f2040-1126-4a30-9ca3-af33911ec753",
   "name": "32k Studios",
   "street": "760 Market St #733",
   "unit": "sdfsdfsdf",
   "city": "San",
   "province": "CA",
   "country": "US",
   "postalCode": "94102",
   "address": "760 Market St #733, sdfsdfsdf, San, CA, US, 94102",
   "timeZone": "(GMT -08:00) Pacific Time (US & Canada); Tijuana",
   "parentId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
   "networkOperatorStatus": 1,
   "networkOperatorStatusChangeDate": "2012-09-17T20:34:13.184Z",
   "companyStatus": 1,
   "companyStatusChangeDate": "2012-09-17T20:34:13.184Z",
   "changedBy": "steve.sherrie@risevision.com",
   "changeDate": "2014-05-08T18:36:38.977Z",
   "kind": "core#companyItem"
  },
  {
   "id": "818e8218-1337-4077-823b-476238992bf1",
   "name": "360sd1@gmail.com's Company",
   "street": "15 Toronto St",
   "unit": "1101",
   "city": "Toronto",
   "province": "ON",
   "country": "CA",
   "postalCode": "M5a 2n7",
   "address": "15 Toronto St, 1101, Toronto, ON, CA, M5a 2n7",
   "timeZone": "(GMT  00:00) Dublin, Edinburgh, Lisbon, London",
   "parentId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
   "networkOperatorStatus": 1,
   "networkOperatorStatusChangeDate": "2013-10-07T19:09:50.769Z",
   "companyStatus": 1,
   "companyStatusChangeDate": "2013-10-07T19:09:50.769Z",
   "changedBy": "steve.sherrie@risevision.com",
   "changeDate": "2014-05-28T16:16:48.162Z",
   "kind": "core#companyItem"
  },
  {
   "id": "ed4461f5-f689-4e78-a97a-4b58deeb3694",
   "name": "930test company",
   "street": "15 Toronto St",
   "unit": "1101",
   "city": "Toronto",
   "province": "ON",
   "country": "CA",
   "postalCode": "M5a 2n7",
   "address": "15 Toronto St, 1101, Toronto, ON, CA, M5a 2n7",
   "timeZone": "(GMT  00:00) Dublin, Edinburgh, Lisbon, London",
   "parentId": "02b4d323-58cd-408f-a7d3-b7fa57ddce07",
   "networkOperatorStatus": 1,
   "networkOperatorStatusChangeDate": "2013-11-14T20:24:20.666Z",
   "companyStatus": 1,
   "companyStatusChangeDate": "2013-11-14T20:24:20.660Z",
   "changedBy": "steve.sherrie@risevision.com",
   "changeDate": "2014-05-30T17:55:07.547Z",
   "kind": "core#companyItem"
  },
  {
   "id": "3be0ee48-6e94-4d68-be4e-23e4e99a1b9e",
   "name": "AB Pro Video",
   "province": "NY",
   "country": "US",
   "address": "NY, US",
   "timeZone": "(GMT -06:00) Central Time (US & Canada)",
   "parentId": "984ec29b-c284-477e-b674-fea446559234",
   "networkOperatorStatus": 1,
   "networkOperatorStatusChangeDate": "2013-08-09T20:14:06.239Z",
   "companyStatus": 1,
   "companyStatusChangeDate": "2013-08-09T20:14:06.239Z",
   "changedBy": "DSallander@gmail.com",
   "changeDate": "2013-08-09T20:24:02.559Z",
   "kind": "core#companyItem"
  },
  {
   "id": "27d5fa3d-a66a-47a9-9a6d-10041751ce09",
   "name": "ABBA Company",
   "street": "14 Hughes Court",
   "city": "Brampton",
   "province": "ON",
   "country": "CA",
   "postalCode": "L6S2C6",
   "address": "14 Hughes Court, Brampton, ON, CA, L6S2C6",
   "timeZone": "(GMT  00:00) Dublin, Edinburgh, Lisbon, London",
   "parentId": "1ee87dab-449c-4022-87b2-3daa3c027303",
   "networkOperatorStatus": 1,
   "networkOperatorStatusChangeDate": "2014-06-10T17:35:17.781Z",
   "companyStatus": 1,
   "companyStatusChangeDate": "2014-06-10T17:35:17.779Z",
   "changedBy": "rvacomp.m@gmail.com",
   "changeDate": "2014-06-10T17:41:46.592Z",
   "kind": "core#companyItem"
  },
  {
   "id": "752fdcc2-8a28-4567-b111-e7ed825bf341",
   "name": "AC DC Company",
   "street": "1600 Pennsylvania Avenue",
   "city": "Washington, DC",
   "province": "WA",
   "country": "US",
   "postalCode": "20500",
   "address": "1600 Pennsylvania Avenue, Washington, DC, WA, US, 20500",
   "timeZone": "(GMT  00:00) Dublin, Edinburgh, Lisbon, London",
   "parentId": "34843567-9413-4e3c-babc-f0d47adced57",
   "networkOperatorStatus": 1,
   "networkOperatorStatusChangeDate": "2014-05-23T13:32:33.185Z",
   "companyStatus": 1,
   "companyStatusChangeDate": "2014-05-23T13:32:33.184Z",
   "changedBy": "rvacomp.h@gmail.com",
   "changeDate": "2014-06-10T13:25:21.841Z",
   "kind": "core#companyItem"
  },
  {
   "id": "984ec29b-c284-477e-b674-fea446559234",
   "name": "AVAD",
   "province": "NY",
   "country": "US",
   "address": "NY, US",
   "timeZone": "(GMT -06:00) Central Time (US & Canada)",
   "parentId": "0d0f9bb6-8ca2-41ff-b201-71863b13dbdc",
   "networkOperatorStatus": 1,
   "networkOperatorStatusChangeDate": "2013-08-09T20:12:16.430Z",
   "companyStatus": 1,
   "companyStatusChangeDate": "2013-08-09T20:12:16.430Z",
   "changedBy": "DSallander@gmail.com",
   "changeDate": "2013-08-09T20:12:43.881Z",
   "kind": "core#companyItem"
  },
  {
   "id": "f059a036-9967-4811-b9a0-9bcc89ceabae",
   "name": "AbeUlibarri@gmail.com's Company",
   "timeZone": "(GMT  00:00) Dublin, Edinburgh, Lisbon, London",
   "parentId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
   "networkOperatorStatus": 1,
   "networkOperatorStatusChangeDate": "2013-06-25T20:34:44.513Z",
   "companyStatus": 1,
   "companyStatusChangeDate": "2013-06-25T20:34:44.513Z",
   "changedBy": "AbeUlibarri@gmail.com",
   "changeDate": "2013-06-25T20:34:44.516Z",
   "kind": "core#companyItem"
  },
  {
   "id": "ea6656be-dc19-49d2-85da-ea88be5a6693",
   "name": "Actionforblindpeople@gmail.com's Company",
   "timeZone": "(GMT  00:00) Dublin, Edinburgh, Lisbon, London",
   "parentId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
   "networkOperatorStatus": 1,
   "networkOperatorStatusChangeDate": "2012-10-01T14:33:28.786Z",
   "companyStatus": 1,
   "companyStatusChangeDate": "2012-10-01T14:33:28.785Z",
   "changedBy": "System",
   "changeDate": "2012-10-02T15:25:28.205Z",
   "kind": "core#companyItem"
  },
  {
   "id": "397defb6-1611-45bc-a693-52f2416da194",
   "name": "AdMe",
   "province": "NY",
   "country": "SI",
   "address": "NY, SI",
   "timeZone": "(GMT  00:00) Dublin, Edinburgh, Lisbon, London",
   "parentId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
   "networkOperatorStatus": 1,
   "networkOperatorStatusChangeDate": "2012-02-10T11:37:45.000Z",
   "companyStatus": 1,
   "companyStatusChangeDate": "2012-02-10T11:37:45.000Z",
   "changedBy": "System",
   "changeDate": "2013-09-23T18:09:40.907Z",
   "kind": "core#companyItem"
  },
  {
   "id": "ea0477ff-0293-43e1-92f6-3f5f80d7b993",
   "name": "AdammeLeBaron@gmail.com's Company",
   "timeZone": "(GMT  00:00) Dublin, Edinburgh, Lisbon, London",
   "parentId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
   "networkOperatorStatus": 1,
   "networkOperatorStatusChangeDate": "2012-11-05T10:07:22.450Z",
   "companyStatus": 1,
   "companyStatusChangeDate": "2012-11-05T10:07:22.449Z",
   "changedBy": "AdammeLeBaron@gmail.com",
   "changeDate": "2012-11-05T10:07:22.455Z",
   "kind": "core#companyItem"
  },
  {
   "id": "e21875a0-c80b-409e-a6a0-cc7d3a05ac9c",
   "name": "Agosto, Inc.",
   "street": "420 5th Street North ",
   "unit": "Suite 400",
   "city": "Minneapolis",
   "province": "MN",
   "country": "US",
   "postalCode": "55401",
   "address": "420 5th Street North , Suite 400, Minneapolis, MN, US, 55401",
   "timeZone": "(GMT -06:00) Central Time (US & Canada)",
   "telephone": "612-605-3520",
   "fax": "612-605-3511",
   "parentId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
   "networkOperatorStatus": 1,
   "networkOperatorStatusChangeDate": "2014-05-13T14:13:17.317Z",
   "companyStatus": 1,
   "companyStatusChangeDate": "2014-05-13T14:13:17.315Z",
   "notificationEmails": [
    "chris.bartling@agosto.com",
    "levi.tomes@agosto.com",
    "paul.lundberg@agosto.com"
   ],
   "changedBy": "System",
   "changeDate": "2014-05-13T14:24:41.691Z",
   "kind": "core#companyItem"
  },
  {
   "id": "6a438085-09dc-4bdc-953e-ed0317d3bdae",
   "name": "Alan Clayton",
   "street": "22109 West 83rd",
   "city": "Shawnee",
   "province": "KS",
   "country": "US",
   "postalCode": "66227",
   "address": "22109 West 83rd, Shawnee, KS, US, 66227",
   "timeZone": "(GMT -06:00) Central Time (US & Canada)",
   "parentId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
   "networkOperatorStatus": 1,
   "networkOperatorStatusChangeDate": "2012-09-26T14:04:23.439Z",
   "companyStatus": 1,
   "companyStatusChangeDate": "2012-09-26T14:04:23.439Z",
   "changedBy": "System",
   "changeDate": "2014-02-17T20:22:16.601Z",
   "kind": "core#companyItem"
  },
  {
   "id": "22c303cd-d3c4-4e11-9c5f-56282e5429ac",
   "name": "Alex Company",
   "city": "King City",
   "province": "ON",
   "country": "CA",
   "postalCode": "L7B 1A3",
   "address": "King City, ON, CA, L7B 1A3",
   "timeZone": "(GMT -05:00) Eastern Time (US & Canada)",
   "parentId": "b0002bf9-d7b3-4eab-a4fe-5bf56604d724",
   "networkOperatorStatus": 0,
   "networkOperatorStatusChangeDate": "2012-05-30T14:55:00.227Z",
   "companyStatus": 1,
   "companyStatusChangeDate": "2012-05-30T14:55:00.227Z",
   "changedBy": "System",
   "changeDate": "2013-05-17T15:26:30.626Z",
   "kind": "core#companyItem"
  },
  {
   "id": "17899fe3-db05-4ecd-ade4-a7106fe53784",
   "name": "Alex's QA",
   "city": "Toronto",
   "province": "ON",
   "country": "CA",
   "address": "Toronto, ON, CA",
   "timeZone": "(GMT -05:00) Eastern Time (US & Canada)",
   "parentId": "fb788f1f-7730-44fd-8e00-20066409f51f",
   "networkOperatorStatus": 0,
   "networkOperatorStatusChangeDate": "2012-04-03T21:24:01.000Z",
   "companyStatus": 1,
   "companyStatusChangeDate": "2011-06-30T20:08:57.000Z",
   "changedBy": "alex.deaconu@gmail.com",
   "changeDate": "2014-02-06T17:55:21.654Z",
   "kind": "core#companyItem"
  },
  {
   "id": "b8287203-13e1-4eba-99e6-ec21f37ed65a",
   "name": "Alex's QA PNO",
   "timeZone": "(GMT  00:00) Dublin, Edinburgh, Lisbon, London",
   "parentId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
   "networkOperatorStatus": 1,
   "networkOperatorStatusChangeDate": "2014-03-07T18:28:42.836Z",
   "companyStatus": 1,
   "companyStatusChangeDate": "2014-03-07T18:28:42.834Z",
   "changedBy": "alex.deaconu@gmail.com",
   "changeDate": "2014-03-27T17:13:47.080Z",
   "kind": "core#companyItem"
  },
  {
   "id": "6cff2085-ee68-48cc-901c-14128e8f04ca",
   "name": "AlexK Company",
   "province": "ON",
   "country": "CA",
   "address": "ON, CA",
   "timeZone": "(GMT -05:00) Eastern Time (US & Canada)",
   "parentId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
   "networkOperatorStatus": 1,
   "networkOperatorStatusChangeDate": "2014-01-29T18:12:15.671Z",
   "companyStatus": 1,
   "companyStatusChangeDate": "2014-01-29T18:12:15.619Z",
   "changedBy": "System",
   "changeDate": "2014-03-07T19:30:32.513Z",
   "kind": "core#companyItem"
  },
  {
   "id": "0aac9657-bfcc-4554-a94e-5ea6e55e5dcf",
   "name": "Alexey's Test Sub-company #1",
   "street": "582 King Edward St. TEST",
   "city": "Winnipeg",
   "province": "MB",
   "country": "CA",
   "postalCode": "R3H0P1",
   "address": "582 King Edward St. TEST, Winnipeg, MB, CA, R3H0P1",
   "timeZone": "(GMT -06:00) Central Time (US & Canada)",
   "parentId": "d3373042-d125-4f24-9608-9f0d04fc5c62",
   "networkOperatorStatus": 1,
   "networkOperatorStatusChangeDate": "2014-05-16T19:42:03.808Z",
   "companyStatus": 1,
   "companyStatusChangeDate": "2014-05-16T19:42:03.807Z",
   "changedBy": "steve.sherrie@risevision.com",
   "changeDate": "2014-05-26T19:42:38.440Z",
   "kind": "core#companyItem"
  },
  {
   "id": "ca1daa40-22dc-47d9-b03a-73c7037dfb1b",
   "name": "Alpha",
   "street": "5 Mulcaster",
   "city": "Barrie",
   "province": "ON",
   "country": "CA",
   "postalCode": "L4M3L9",
   "address": "5 Mulcaster, Barrie, ON, CA, L4M3L9",
   "timeZone": "(GMT  00:00) Dublin, Edinburgh, Lisbon, London",
   "parentId": "53f061cd-fd94-4c1f-b65f-0ff080b6cce7",
   "networkOperatorStatus": 1,
   "networkOperatorStatusChangeDate": "2014-05-21T19:44:07.679Z",
   "companyStatus": 1,
   "companyStatusChangeDate": "2014-05-21T19:44:07.678Z",
   "changedBy": "rvacomp.j@gmail.com",
   "changeDate": "2014-05-29T14:28:05.388Z",
   "kind": "core#companyItem"
  },
  {
   "id": "78a3ec26-115d-4822-915f-8b220b6df274",
   "name": "Amanzy",
   "province": "NY",
   "address": "NY",
   "timeZone": "(GMT +01:00) Amsterdam, Berlin, Bern, Rome, Paris, Stockholm, Vienna",
   "parentId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
   "networkOperatorStatus": 1,
   "networkOperatorStatusChangeDate": "2012-01-05T20:25:38.000Z",
   "companyStatus": 1,
   "companyStatusChangeDate": "2012-01-05T20:25:38.000Z",
   "changedBy": "System",
   "changeDate": "2014-05-21T18:53:49.085Z",
   "kind": "core#companyItem"
  },
  {
   "id": "1260d334-f081-4d6b-81d1-11e52d2243a0",
   "name": "Aminashamnath92@gmail.com's Company",
   "timeZone": "(GMT  00:00) Dublin, Edinburgh, Lisbon, London",
   "parentId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
   "networkOperatorStatus": 1,
   "networkOperatorStatusChangeDate": "2012-04-04T02:31:51.000Z",
   "companyStatus": 1,
   "companyStatusChangeDate": "2012-04-04T02:31:51.000Z",
   "changedBy": "Aminashamnath92@gmail.com",
   "changeDate": "2012-04-04T02:31:51.000Z",
   "kind": "core#companyItem"
  },
  {
   "id": "2b6034c0-8030-4caa-b39a-920b7b324e87",
   "name": "Anderson Passive - embedded presentations",
   "province": "NY",
   "address": "NY",
   "timeZone": "(GMT  00:00) Dublin, Edinburgh, Lisbon, London",
   "parentId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
   "networkOperatorStatus": 1,
   "networkOperatorStatusChangeDate": "2011-01-25T16:35:25.000Z",
   "companyStatus": 1,
   "companyStatusChangeDate": "2011-01-25T16:35:25.000Z",
   "changedBy": "neal.godbeer@risevision.com",
   "changeDate": "2012-04-03T20:52:13.000Z",
   "kind": "core#companyItem"
  },
  {
   "id": "857784b9-39d9-4cb3-bee4-a96036e66ced",
   "name": "Android Limited",
   "country": "UK",
   "address": "UK",
   "timeZone": "(GMT  00:00) Dublin, Edinburgh, Lisbon, London",
   "parentId": "8f393283-7f97-4bdd-9f94-28e40e8dbf0f",
   "networkOperatorStatus": 1,
   "networkOperatorStatusChangeDate": "2014-07-28T15:39:01.392Z",
   "companyStatus": 1,
   "companyStatusChangeDate": "2014-07-28T15:39:01.390Z",
   "changedBy": "System",
   "changeDate": "2014-07-28T15:47:14.990Z",
   "kind": "core#companyItem"
  },
  {
   "id": "fe3f1dd1-ccc2-4343-a796-c2a0a6a092ec",
   "name": "Applied Information Test Company",
   "province": "NY",
   "address": "NY",
   "timeZone": "(GMT  00:00) Dublin, Edinburgh, Lisbon, London",
   "parentId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
   "networkOperatorStatus": 1,
   "networkOperatorStatusChangeDate": "2011-12-14T14:47:52.000Z",
   "companyStatus": 1,
   "companyStatusChangeDate": "2011-12-14T14:47:52.000Z",
   "changedBy": "System",
   "changeDate": "2012-06-19T23:48:31.082Z",
   "kind": "core#companyItem"
  },
  {
   "id": "3509cd9b-e9ba-47d2-84bb-f954db4641b1",
   "name": "Aragorn Company",
   "timeZone": "(GMT  00:00) Dublin, Edinburgh, Lisbon, London",
   "parentId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
   "networkOperatorStatus": 1,
   "networkOperatorStatusChangeDate": "2014-05-22T20:48:21.651Z",
   "companyStatus": 1,
   "companyStatusChangeDate": "2014-05-22T20:48:21.650Z",
   "changedBy": "System",
   "changeDate": "2014-05-27T14:50:30.695Z",
   "kind": "core#companyItem"
  },
  {
   "id": "d6119f4b-09de-4aba-8c56-2a334a32e492",
   "name": "Automated Testing Sub Company",
   "timeZone": "(GMT  00:00) Dublin, Edinburgh, Lisbon, London",
   "parentId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
   "networkOperatorStatus": 1,
   "networkOperatorStatusChangeDate": "2013-01-17T16:42:13.188Z",
   "companyStatus": 1,
   "companyStatusChangeDate": "2013-01-17T16:42:13.188Z",
   "changedBy": "riseautomatedtesting4@gmail.com",
   "changeDate": "2013-05-07T17:41:09.876Z",
   "kind": "core#companyItem"
  },
  {
   "id": "4283485e-5b40-4c34-a7aa-e6fb1ad7bcf8",
   "name": "Automated Testing Sub company  (DO NOT DELETE)",
   "province": "NY",
   "address": "NY",
   "timeZone": "(GMT  00:00) Dublin, Edinburgh, Lisbon, London",
   "parentId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
   "networkOperatorStatus": 1,
   "networkOperatorStatusChangeDate": "2012-06-27T20:47:52.772Z",
   "companyStatus": 1,
   "companyStatusChangeDate": "2012-04-12T15:50:09.000Z",
   "notificationEmails": [
    "robb.price@risevision.com"
   ],
   "changedBy": "System",
   "changeDate": "2014-01-30T21:12:26.659Z",
   "kind": "core#companyItem"
  },
  {
   "id": "bfaf9b18-fd5b-475b-afe1-a511cd73662f",
   "name": "BOHEMEN2013@gmail.com's Company",
   "timeZone": "(GMT  00:00) Dublin, Edinburgh, Lisbon, London",
   "parentId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
   "networkOperatorStatus": 1,
   "networkOperatorStatusChangeDate": "2012-11-29T00:42:24.735Z",
   "companyStatus": 1,
   "companyStatusChangeDate": "2012-11-29T00:42:24.735Z",
   "changedBy": "BOHEMEN2013@gmail.com",
   "changeDate": "2012-11-29T00:42:24.781Z",
   "kind": "core#companyItem"
  },
  {
   "id": "38dbc98d-9f98-4fb3-8c1f-86a2b5a38733",
   "name": "Batman's badass company",
   "province": "NY",
   "address": "NY",
   "timeZone": "(GMT  00:00) Dublin, Edinburgh, Lisbon, London",
   "parentId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
   "networkOperatorStatus": 0,
   "networkOperatorStatusChangeDate": "2012-05-25T20:01:10.694Z",
   "companyStatus": 1,
   "companyStatusChangeDate": "2012-05-25T20:01:10.694Z",
   "changedBy": "System",
   "changeDate": "2013-12-13T17:00:35.199Z",
   "kind": "core#companyItem"
  },
  {
   "id": "fd07c488-3266-4d71-a5b1-6e7a82e642cd",
   "name": "Bernard.Bermejo@gmail.com's Company",
   "timeZone": "(GMT  00:00) Dublin, Edinburgh, Lisbon, London",
   "parentId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
   "networkOperatorStatus": 1,
   "networkOperatorStatusChangeDate": "2014-07-11T00:31:48.815Z",
   "companyStatus": 1,
   "companyStatusChangeDate": "2014-07-11T00:31:48.789Z",
   "changedBy": "Bernard.Bermejo@gmail.com",
   "changeDate": "2014-07-11T00:31:48.822Z",
   "kind": "core#companyItem"
  },
  {
   "id": "808bc4af-7b53-4637-af8a-51264406a64a",
   "name": "Beta",
   "timeZone": "(GMT  00:00) Dublin, Edinburgh, Lisbon, London",
   "parentId": "53f061cd-fd94-4c1f-b65f-0ff080b6cce7",
   "networkOperatorStatus": 1,
   "networkOperatorStatusChangeDate": "2014-05-21T19:44:23.614Z",
   "companyStatus": 1,
   "companyStatusChangeDate": "2014-05-21T19:44:23.609Z",
   "changedBy": "rvacomp.g@gmail.com",
   "changeDate": "2014-05-21T19:45:59.140Z",
   "kind": "core#companyItem"
  },
  {
   "id": "0f25159f-97bf-4197-afdb-b664fa77f155",
   "name": "Beta Platform Test Company",
   "street": "22109 W. 83rd St",
   "city": "Shawnee",
   "province": "KS",
   "country": "US",
   "postalCode": "66227",
   "address": "22109 W. 83rd St, Shawnee, KS, US, 66227",
   "timeZone": "(GMT -06:00) Central Time (US & Canada)",
   "parentId": "b0002bf9-d7b3-4eab-a4fe-5bf56604d724",
   "networkOperatorStatus": 0,
   "networkOperatorStatusChangeDate": "2010-12-15T21:39:10.000Z",
   "companyStatus": 1,
   "companyStatusChangeDate": "2010-12-15T21:39:10.000Z",
   "changedBy": "System",
   "changeDate": "2013-05-17T15:16:38.248Z",
   "kind": "core#companyItem"
  },
  {
   "id": "c7f3a27e-9760-44ff-b91d-5573ff128bc5",
   "name": "Bethel Community",
   "timeZone": "(GMT  00:00) Dublin, Edinburgh, Lisbon, London",
   "parentId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
   "networkOperatorStatus": 1,
   "networkOperatorStatusChangeDate": "2012-12-21T20:50:25.676Z",
   "companyStatus": 1,
   "companyStatusChangeDate": "2012-12-21T20:50:25.676Z",
   "changedBy": "mark@bethelrussianchurch.org",
   "changeDate": "2012-12-21T21:00:51.768Z",
   "kind": "core#companyItem"
  },
  {
   "id": "97c9c100-5388-4205-b5cc-c75e8e2edf01",
   "name": "Bilbo Company",
   "timeZone": "(GMT  00:00) Dublin, Edinburgh, Lisbon, London",
   "parentId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
   "networkOperatorStatus": 1,
   "networkOperatorStatusChangeDate": "2014-05-22T20:48:32.192Z",
   "companyStatus": 1,
   "companyStatusChangeDate": "2014-05-22T20:48:32.191Z",
   "changedBy": "System",
   "changeDate": "2014-05-27T14:50:30.799Z",
   "kind": "core#companyItem"
  },
  {
   "id": "3cd32297-1e65-4271-9068-ee1d5f44afbf",
   "name": "Bilodeau.FA@gmail.com's Company",
   "timeZone": "(GMT  00:00) Dublin, Edinburgh, Lisbon, London",
   "parentId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
   "networkOperatorStatus": 1,
   "networkOperatorStatusChangeDate": "2013-08-19T19:03:02.588Z",
   "companyStatus": 1,
   "companyStatusChangeDate": "2013-08-19T19:03:02.587Z",
   "changedBy": "Bilodeau.FA@gmail.com",
   "changeDate": "2013-08-19T19:03:02.591Z",
   "kind": "core#companyItem"
  },
  {
   "id": "3483aa5f-bb86-4751-b552-26297be824ad",
   "name": "BlueEbony@gmail.com's Company",
   "timeZone": "(GMT  00:00) Dublin, Edinburgh, Lisbon, London",
   "parentId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
   "networkOperatorStatus": 1,
   "networkOperatorStatusChangeDate": "2012-03-28T21:22:47.000Z",
   "companyStatus": 1,
   "companyStatusChangeDate": "2012-03-28T21:22:47.000Z",
   "changedBy": "BlueEbony@gmail.com",
   "changeDate": "2012-04-03T20:52:05.000Z",
   "kind": "core#companyItem"
  },
  {
   "id": "0d813505-5fb4-4326-b03e-1d3197e82cc0",
   "name": "Bob.Bermel@gmail.com's Company",
   "timeZone": "(GMT  00:00) Dublin, Edinburgh, Lisbon, London",
   "parentId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
   "networkOperatorStatus": 1,
   "networkOperatorStatusChangeDate": "2013-09-02T12:05:46.341Z",
   "companyStatus": 1,
   "companyStatusChangeDate": "2013-09-02T12:05:46.340Z",
   "changedBy": "Bob.Bermel@gmail.com",
   "changeDate": "2013-09-02T12:05:46.344Z",
   "kind": "core#companyItem"
  },
  {
   "id": "d8637d2d-7ac6-4da4-8947-4430d1ac169c",
   "name": "Brian Test Company",
   "province": "NY",
   "address": "NY",
   "timeZone": "(GMT  00:00) Dublin, Edinburgh, Lisbon, London",
   "parentId": "b0002bf9-d7b3-4eab-a4fe-5bf56604d724",
   "networkOperatorStatus": 0,
   "networkOperatorStatusChangeDate": "2012-04-03T22:43:23.000Z",
   "companyStatus": 1,
   "companyStatusChangeDate": "2012-04-03T22:43:23.000Z",
   "changedBy": "System",
   "changeDate": "2013-05-17T15:16:48.912Z",
   "kind": "core#companyItem"
  },
  {
   "id": "c18e1b29-2392-4c99-a4ef-79685fb40399",
   "name": "Bryant.Nielson@gmail.com's Company",
   "timeZone": "(GMT  00:00) Dublin, Edinburgh, Lisbon, London",
   "parentId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
   "networkOperatorStatus": 1,
   "networkOperatorStatusChangeDate": "2012-05-01T16:31:13.102Z",
   "companyStatus": 1,
   "companyStatusChangeDate": "2012-05-01T16:31:13.102Z",
   "changedBy": "Bryant.Nielson@gmail.com",
   "changeDate": "2012-05-01T16:31:13.105Z",
   "kind": "core#companyItem"
  },
  {
   "id": "f9b6c2e9-d850-4a1f-b685-cea62a6563b4",
   "name": "Bug Testing Company",
   "province": "ON",
   "address": "ON",
   "timeZone": "(GMT  00:00) Dublin, Edinburgh, Lisbon, London",
   "parentId": "fb788f1f-7730-44fd-8e00-20066409f51f",
   "networkOperatorStatus": 0,
   "networkOperatorStatusChangeDate": "2011-06-07T16:18:59.000Z",
   "companyStatus": 1,
   "companyStatusChangeDate": "2011-06-07T16:18:59.000Z",
   "changedBy": "System",
   "changeDate": "2014-03-13T15:19:25.205Z",
   "kind": "core#companyItem"
  },
  {
   "id": "9174c45d-69c6-474a-b9c1-a6367677895c",
   "name": "Bullet1337@gmail.com's Company",
   "timeZone": "(GMT  00:00) Dublin, Edinburgh, Lisbon, London",
   "parentId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
   "networkOperatorStatus": 1,
   "networkOperatorStatusChangeDate": "2013-10-04T13:26:38.756Z",
   "companyStatus": 1,
   "companyStatusChangeDate": "2013-10-04T13:26:38.756Z",
   "changedBy": "Bullet1337@gmail.com",
   "changeDate": "2013-10-04T13:26:38.763Z",
   "kind": "core#companyItem"
  },
  {
   "id": "85eb3648-c3c5-40e3-a93a-39b50d114cba",
   "name": "Buttner Company",
   "province": "NY",
   "address": "NY",
   "timeZone": "(GMT  00:00) Dublin, Edinburgh, Lisbon, London",
   "parentId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
   "networkOperatorStatus": 0,
   "networkOperatorStatusChangeDate": "2011-07-22T17:59:51.000Z",
   "companyStatus": 1,
   "companyStatusChangeDate": "2011-07-22T17:59:51.000Z",
   "changedBy": "riseqa8@gmail.com",
   "changeDate": "2012-04-03T20:52:11.000Z",
   "kind": "core#companyItem"
  },
  {
   "id": "24c243ab-3fa8-4a74-9e00-bbcb570c0a42",
   "name": "CJ@prodical.us's Company",
   "timeZone": "(GMT  00:00) Dublin, Edinburgh, Lisbon, London",
   "parentId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
   "networkOperatorStatus": 1,
   "networkOperatorStatusChangeDate": "2014-07-02T19:23:14.337Z",
   "companyStatus": 1,
   "companyStatusChangeDate": "2014-07-02T19:23:14.332Z",
   "changedBy": "CJ@prodical.us",
   "changeDate": "2014-07-02T19:23:14.344Z",
   "kind": "core#companyItem"
  },
  {
   "id": "301ba3aa-8d19-4344-b743-607c1af7d517",
   "name": "Can I reset after this",
   "timeZone": "(GMT  00:00) Dublin, Edinburgh, Lisbon, London",
   "parentId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
   "networkOperatorStatus": 1,
   "networkOperatorStatusChangeDate": "2013-02-08T21:11:21.304Z",
   "companyStatus": 1,
   "companyStatusChangeDate": "2013-02-08T21:11:21.304Z",
   "changedBy": "riseqa2@gmail.com",
   "changeDate": "2013-06-13T17:48:49.418Z",
   "kind": "core#companyItem"
  },
  {
   "id": "2d3ddce9-09a6-4137-9fdb-8d9b866c42d1",
   "name": "Carman660@gmail.com's Company",
   "timeZone": "(GMT  00:00) Dublin, Edinburgh, Lisbon, London",
   "parentId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
   "networkOperatorStatus": 1,
   "networkOperatorStatusChangeDate": "2011-05-01T05:08:32.000Z",
   "companyStatus": 1,
   "companyStatusChangeDate": "2011-05-01T05:08:32.000Z",
   "changedBy": "Carman660@gmail.com",
   "changeDate": "2012-04-03T20:52:12.000Z",
   "kind": "core#companyItem"
  },
  {
   "id": "c6ef4ad7-f294-4cb9-b861-339b277ea3ef",
   "name": "Celeborn Company",
   "timeZone": "(GMT  00:00) Dublin, Edinburgh, Lisbon, London",
   "parentId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
   "networkOperatorStatus": 1,
   "networkOperatorStatusChangeDate": "2014-05-22T20:49:35.396Z",
   "companyStatus": 1,
   "companyStatusChangeDate": "2014-05-22T20:49:35.395Z",
   "changedBy": "System",
   "changeDate": "2014-05-27T14:50:30.941Z",
   "kind": "core#companyItem"
  },
  {
   "id": "1e67e795-4df9-4aea-b9f2-6d2d76329b40",
   "name": "Charlie",
   "street": "56 Crawford Drive",
   "city": "Brampton",
   "province": "ON",
   "country": "CA",
   "postalCode": "L6V2C7",
   "address": "56 Crawford Drive, Brampton, ON, CA, L6V2C7",
   "timeZone": "(GMT  00:00) Dublin, Edinburgh, Lisbon, London",
   "parentId": "53f061cd-fd94-4c1f-b65f-0ff080b6cce7",
   "networkOperatorStatus": 1,
   "networkOperatorStatusChangeDate": "2014-05-21T19:46:52.208Z",
   "companyStatus": 1,
   "companyStatusChangeDate": "2014-05-21T19:46:52.206Z",
   "changedBy": "rvacomp.g@gmail.com",
   "changeDate": "2014-06-09T18:30:27.706Z",
   "kind": "core#companyItem"
  },
  {
   "id": "f21deea7-2394-46b3-86db-d0b860073d8b",
   "name": "ChristopherDeck@gmail.com's Company",
   "timeZone": "(GMT  00:00) Dublin, Edinburgh, Lisbon, London",
   "parentId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
   "networkOperatorStatus": 1,
   "networkOperatorStatusChangeDate": "2013-03-14T18:40:53.229Z",
   "companyStatus": 1,
   "companyStatusChangeDate": "2013-03-14T18:40:53.229Z",
   "changedBy": "ChristopherDeck@gmail.com",
   "changeDate": "2013-03-14T18:40:53.233Z",
   "kind": "core#companyItem"
  }
 ];

 if(localStorage.getItem("fakeGoogleDb")) {
   window.gapi._fakeDb = JSON.parse(localStorage.getItem("fakeGoogleDb"));
 }
 else {
   window.gapi.resetDb();
 }

  gapi.client = {
    load: function(path, version, cb) {
      delayed(cb);
    },
    core: {
      systemmessages: {
        list: function (obj) {
          obj = obj || {};
          return {
            execute : function (cb) {
              if(obj.companyId) {
                delayed(cb, _.cloneDeep(window.gapi._fakeDb.systemMessages));
              }
            }
          };
        }
      },
      company: {
        get: function (obj) {
          return {
            execute: function (cb) {
              var company;
              if(gapi.auth._token) {
                if(obj && obj.id) {
                  company = _.find(window.gapi._fakeDb.companies, function (company) {
                    return company.id === obj.id;
                  });
                }
                else if (window.gapi._fakeDb.currentUser.item.companyId){
                  company =
                  _.find(window.gapi._fakeDb.companies, function (company) {
                    return company.id === window.gapi._fakeDb.currentUser.item.companyId;
                  });
                }
                if(!company){
                  delayed(cb, {
                    "result": false,
                    "code": 404,
                    "message": "NOT FOUND"
                  });
                } else {
                  delayed(cb, {
                    "result": true,
                    "code": 200,
                    "message": "OK",
                    "item": _.extend(_.cloneDeep(window.gapi.companyRespSkeleton), company),
                  "kind": "core#companyItem",
                  "etag": "\"MH7KOPL7ADNdruowVC6-7YuLjZw/B1RYG_QUBrbTcuW6r700m7wrgBU\""
                  });
                }
              }
              else {
                delayed(cb, {
                  "result": false,
                  "code": 401,
                  "message": "NOT LOGGED IN"
                });
              }
          }
        };
      },
      update: function (fields) {
        return {
          execute: function (cb) {
            var company;
            if(fields.id) {
              company = _.find(window.gapi._fakeDb.companies, function (company) {
                return company.id === fields.id;
              });
              _.extend(company, fields);
            }
            else {
              company = _.cloneDeep(fields);
              company.id = guid();
              window.gapi._fakeDb.companies.push(company);
            }
            console.log("company created", company);
            delayed(cb, {
              "result": true,
              "code": 200,
              "message": "OK",
              "item": _.extend(_.cloneDeep(window.gapi.companyRespSkeleton), company),
            "kind": "core#companyItem",
            "etag": "\"MH7KOPL7ADNdruowVC6-7YuLjZw/B1RYG_QUBrbTcuW6r700m7wrgBU\""
          });
          }
        };
      },
      list: function () {
        return {
          execute: function (cb) {
            return delayed(cb, {
             "result": true,
             "code": 200,
             "message": "OK",
             "cursor": "false:Cq8ECpgCCvsBvJeNloyLkI-Xmo27mpyUv5iSnpaT0ZyQktiM37yQko" +
               "-ekYb_AP7__vcKlehA__r_14yBjYmenJCNmtKLmoyL_wB0baCgmYuMoKD_AF2ej4-" +
               "akZiWkZr_AHN0bZaRm5qH_wBdm5aNmpyLkI2G0YyKnZyQko-" +
               "ekZaajJ3Lzcedy5rH0pzHncbSy86bytLHns7P0p3LzsbMnMjHxsvLzP8Ac3Rtm5CcoJab" +
               "_wBdmc3Om5qansjSzczGy9LLyZ3M0sfJm53Sm8-dx8nPz8jMm8ed_wBzf5nNzpuamp7" +
               "I0s3MxsvSy8mdzNLHyZud0pvPncfJz8_IzJvHnf8A__" +
               "4QMiFMcw71s9sZvFAAWgsJVe1Ieq0Kl_oQARINRG9jdW1lbnRJbmRleBqzAShBTk" +
               "QgKElTICJjdXN0b21lcl9uYW1lIiAiYXBwZW5naW5lIikgKElTICJncm91cF9uYW1lIi" +
               "Aic35ydmFjb3JlLXRlc3QiKSAoSVMgIm5hbWVzcGFjZSIgIiIpIChJUyAiaW5kZXhfb" +
               "mFtZSIgImRpcmVjdG9yeS5zdWJjb21wYW5pZXNiNDI4YjRlOC1jOGI5LTQxZDUtOGE" +
               "xMC1iNDE5M2M3ODk0NDMiKSAoVFJVRSkpOhQKDihUIHN0ZXh0X25hbWUpEAAiAEocCAA6FXN0OmJ0aV9nZW5lcmljX3Njb3JlckDoB1IZCgwoTiBvcmRlcl9pZCkQARkAAAAAAADw_w",
             "items": window.gapi._fakeDb.companies,
             "kind": "core#company",
             "etag": "\"MH7KOPL7ADNdruowVC6-7YuLjZw/aU3KWpXBGvssoqWVjsHR5ngSZlU\""
            });
          }
        };
      }
    },
    account: {
      get: function () {
        return {
          execute: function (cb) {
            if(gapi.auth._token){
              if(window.gapi._fakeDb.currentAccount) {
                delayed(cb, _.cloneDeep(window.gapi._fakeDb.currentAccount));
              }
              else {
                delayed(cb, {
                  "result": false,
                  "code": 404,
                  "message": "NOT FOUND"
                });
              }
            }
            else {
              delayed(cb, {
                "result": false,
                "code": 401,
                "message": "NOT LOGGED IN"
              });
            }
          }
        };
      },
      add: function (obj) {
        return {
          execute: function (cb) {
            if(!obj) {obj = {}; }
            if(!window.gapi._fakeDb.currenAccount) {
              window.gapi._fakeDb.currentAccount.item = _.cloneDeep(obj);
            }

            _.extend(window.gapi._fakeDb.currentAccount.item, obj);
            return delayed(cb, _.cloneDeep(window.gapi._fakeDb.currentAccount));
          }
        };
      }
    },
    user: {
      get: function () {
        return {
          execute: function (cb) {
            if(gapi.auth._token){
              if(window.gapi._fakeDb.currentUser) {
                delayed(cb, _.cloneDeep(window.gapi._fakeDb.currentUser));
              }
              else {
                delayed(cb, {
                  "result": false,
                  "code": 404,
                  "message": "NOT FOUND"
                });
              }
            }
            else {
              delayed(cb, {
                "result": false,
                "code": 401,
                "message": "NOT LOGGED IN"
              });
            }
          }
        };
      },
      update: function (obj) {
        return {
          execute: function (cb) {
            if(!obj) {obj = {}; }
            if(!window.gapi._fakeDb.currentUser) {
              window.gapi.resetUser();
              window.gapi._fakeDb.currentUser.item = _.cloneDeep(obj);
            }

            _.extend(window.gapi._fakeDb.currentUser.item, obj);
            return delayed(cb, _.cloneDeep(window.gapi._fakeDb.currentUser));
          }
        };
      }
    }
  },
  oauth2: {
    userinfo: {
      get: function() {
        return {
          execute: function(cb) {
            if(gapi.auth._token) {
              delayed(cb, {
                "id":"1",
                "name":"Sergey Brin",
                "email" :"sergey.brin.fake@google.com",
                "picture" : "http://api.randomuser.me/portraits/med/men/22.jpg",
                "given_name":"Sergey",
                "family_name":"Brin",
                "link":"https://plus.google.com/1",
                "gender":"male",
                "locale":"en",
                "result":{
                  "id":"1",
                  "name":"Sergey Brin",
                  "given_name":"Sergey",
                  "family_name":"Brin",
                  "link":"https://plus.google.com/1",
                  "picture":"",
                  "gender":"male",
                  "locale":"en"
                }
              });
            }
            else {
              delayed(cb, {
                "code": 401,
                "message": "Invalid Credentials",
                "data": [
                  {
                    "domain": "global",
                    "reason": "authError",
                    "message": "Invalid Credentials",
                    "locationType": "header",
                    "location": "Authorization"
                  }
                ],
                "error": {
                  "code": 401,
                  "message": "Invalid Credentials",
                  "data": [
                    {
                      "domain": "global",
                      "reason": "authError",
                      "message": "Invalid Credentials",
                      "locationType": "header",
                      "location": "Authorization"
                    }
                  ]
                }
              });
            }
          }
        };
      }
    }
  },
  setApiKey: function() {
  },
  tasks: {
    tasks: {
      update: function() {
        return {
          execute: function(cb) {
            delayed(cb, {});
          }
        };
      },
      delete: function() {
        return {
          execute: function(cb) {
            delayed(cb);
          }
        };
      },
      insert: function() {
        return {
          execute: function() {
          }
        };
      },
      list: function() {
        return {
          execute: function(cb) {
            return delayed(cb, {
              "kind": "tasks#tasks",
              "items": [
              {
                "kind": "tasks#task",
                "id": "MDE5MzU2Njg4NDcyNjMxOTE4MzE6Njk1MzUzOTY2OjQ3NTg4MjQyMg",
                "title": "x1",
                "updated": "2012-08-10T22:07:22.000Z",
                "position": "00000000000000410311",
                "status": "needsAction"
              },
              {
                "kind": "tasks#task",
                "id": "MDE5MzU2Njg4NDcyNjMxOTE4MzE6Njk1MzUzOTY2OjE0ODU0NTE1NDc",
                "title": "x2",
                "updated": "2012-08-10T22:07:25.000Z",
                "position": "00000000000000615467",
                "status": "needsAction"
              },
              {
                "kind": "tasks#task",
                "id": "MDE5MzU2Njg4NDcyNjMxOTE4MzE6Njk1MzUzOTY2OjgxNTQ5MTA3Nw",
                "title": "x3",
                "updated": "2012-08-12T14:30:49.000Z",
                "position": "00000000000000820623",
                "status": "completed",
                "completed": "2012-08-12T14:30:49.000Z"
              }
              ],
              "result": {
                "kind": "tasks#tasks",
                "items": [
                {
                  "kind": "tasks#task",
                  "id": "MDE5MzU2Njg4NDcyNjMxOTE4MzE6Njk1MzUzOTY2OjQ3NTg4MjQyMg",
                  "title": "x1",
                  "updated": "2012-08-10T22:07:22.000Z",
                  "position": "00000000000000410311",
                  "status": "needsAction"
                },
                {
                  "kind": "tasks#task",
                  "id": "MDE5MzU2Njg4NDcyNjMxOTE4MzE6Njk1MzUzOTY2OjE0ODU0NTE1NDc",
                  "title": "x2",
                  "updated": "2012-08-10T22:07:25.000Z",
                  "position": "00000000000000615467",
                  "status": "needsAction"
                },
                {
                  "kind": "tasks#task",
                  "id": "MDE5MzU2Njg4NDcyNjMxOTE4MzE6Njk1MzUzOTY2OjgxNTQ5MTA3Nw",
                  "title": "x3",
                  "updated": "2012-08-12T14:30:49.000Z",
                  "position": "00000000000000820623",
                  "status": "completed",
                  "completed": "2012-08-12T14:30:49.000Z"
                }
                ]
              }
            });
          }
        };
      }
    },
    tasklists: {
      update: function() {
        return {
          execute: function(cb) {
            delayed(cb, {});
          }
        };
      },
      delete: function() {
        return {
          execute: function(cb) {
            delayed(cb, {});
          }
        };
      },
      insert: function() {
        return {
          execute: function(cb) {
            // Used for the 'Creating a list' test
            delayed(cb, {
              "id": "1",
              "kind": "tasks#taskList",
              "title": "Example list",
              "updated": "2013-01-14T13:58:48.000Z"
            });
          }
        };
      },
      list: function(options) {

        options = options || {};


        return {
          execute: function(cb) {
            delayed(cb, {
              "kind": "tasks#taskLists",
              "items": [
              {
                "kind": "tasks#taskList",
                "id": "MDE5MzU2Njg4NDcyNjMxOTE4MzE6MDow",
                "title": "Default List",
                "updated": "2012-08-14T13:58:48.000Z",
              },
              {
                "kind": "tasks#taskList",
                "id": "MDE5MzU2Njg4NDcyNjMxOTE4MzE6NDg3ODA5MzA2OjA",
                "title": "Writing",
                "updated": "2012-07-22T17:58:19.000Z",
              }
              ],
              "result": {
                "kind": "tasks#taskLists",
                "items": [
                {
                  "kind": "tasks#taskList",
                  "id": "MDE5MzU2Njg4NDcyNjMxOTE4MzE6MDow",
                  "title": "Default List",
                  "updated": "2012-08-14T13:58:48.000Z",
                },
                {
                  "kind": "tasks#taskList",
                  "id": "MDE5MzU2Njg4NDcyNjMxOTE4MzE6NDg3ODA5MzA2OjA",
                  "title": "Writing",
                  "updated": "2012-07-22T17:58:19.000Z",
                }
                ]
              }
            });
          }
        };
      }
    }
  }
};
gapi.auth = {
  authorize: function(options, cb) {
    var token = {
      "state": "",
      "access_token": "ya29.ZwAgQsgKffXb9iIAAACywIxIBmnB3GZZy-8ZF2nVT37cniK5PzKHxzWu6DQh8uyoRYpIjLYdneCEgYZb2U8",
      "token_type": "Bearer",
      "expires_in": "3600",
      "scope": "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
      "client_id": "614513768474.apps.googleusercontent.com",
      "g_user_cookie_policy": "http://localhost:8099",
      "cookie_policy": "http://localhost:8099",
      "response_type": "token",
      "issued_at": "1408530459",
      "expires_at": "1408534059",
      "g-oauth-window": {},
      "status": {
        "google_logged_in": false,
        "signed_in": true,
        "method": "PROMPT"
      }
    };
    gapi.auth._token = token;
    delayed(cb, _.cloneDeep(token));
  },
  setToken: function (token) {
    gapi.auth._token = token;
  },
  getToken: function () {
    delete gapi.auth._token;
  }
};

handleClientJSLoad();

})(_, window, handleClientJSLoad);
