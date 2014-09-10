(function (gapiMockData){
  gapiMockData.accounts = [{
    "username": "michael.sanchez@awesome.io",
    "changedBy": "bloosbrock@gmail.com",
    "changeDate": "2014-07-18T11:38:24.668Z"
  }];

  gapiMockData.oauthAccounts = [{
    "id":"1",
    "name":"Michael Sanchez",
    "email" :"michael.sanchez@awesome.io",
    "picture" : "http://api.randomuser.me/portraits/med/men/22.jpg",
    "given_name":"Michael",
    "family_name":"Sanchez",
    "link":"https://plus.google.com/1",
    "gender":"male",
    "locale":"en",
    "result":{
      "id":"1",
      "name":"Michael Sanchez",
      "given_name":"Michael",
      "family_name":"Sanchez",
      "link":"https://plus.google.com/1",
      "picture":"",
      "gender":"male",
      "locale":"en"
    }
  },
  {
    "id":"2",
    "name":"John Doe",
    "email" :"john.doe@awesome.io",
    "picture" : "http://api.randomuser.me/portraits/med/men/12.jpg",
    "given_name":"John",
    "family_name":"Doe",
    "link":"https://plus.google.com/2",
    "gender":"male",
    "locale":"en",
    "result":{
      "id":"1",
      "name":"John Doe",
      "given_name":"John",
      "family_name":"Doe",
      "link":"https://plus.google.com/2",
      "picture":"",
      "gender":"male",
      "locale":"en"
    }
  }];
})(window.gapiMockData);
