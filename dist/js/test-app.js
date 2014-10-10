(function ( root, factory ) {
    if ( typeof define === 'function' && define.amd ) {
        // AMD. Register as an anonymous module.
        define ( ['angular'], factory );
    } else if ( typeof exports === 'object' ) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory ( require ( 'angular' ) );
    } else {
        // Browser globals (root is window)
        root.returnExports = factory ( root.angular );
    }
} ( this, function ( angular ) {

    var app = angular.module ( 'JSONedit', ['ui.sortable'] );


    // override the default input to update on blur
    // from http://jsfiddle.net/cn8VF/
    app.directive ( 'ngModelOnblur', function () {
        return {
            priority:1,
            restrict: 'A',
            require: 'ngModel',
            link: function ( scope, elm, attr, ngModelCtrl ) {
                if ( attr.type === 'radio' || attr.type === 'checkbox' ) return;

                elm.off ( 'input keydown change' );
                elm.on ( 'blur', function () {
                    scope.$apply ( function () {
                        ngModelCtrl.$setViewValue ( elm.val () );
                    } );
                } );
            }
        };
    } );

    app.directive ( 'json', function ( $compile, $timeout ) {
        return {
            restrict: 'E',
            scope: {
                child: '=',
                type: '='
            },
            link: function ( scope, element, attributes ) {

                var stringName = "Text";
                var objectName = "Object"; // or technically more correct: Map
                var arrayName = "List";
                var refName = "Reference";

                scope.valueTypes = [stringName, objectName, arrayName, refName];

                //////
                // Helper functions
                //////

                var getType = function ( obj ) {

                    if ( angular.isArray ( obj ) ) {
                        return "Array";
                    }

                    if ( angular.isObject ( obj ) ) {
                        return "Object";
                    }

                    return "Literal";

                };

                scope.getType = function ( obj ) {
                    return getType ( obj );
                };
                scope.toggleCollapse = function () {
                    if ( scope.collapsed ) {
                        scope.collapsed = false;
                        scope.chevron = "glyphicon glyphicon-chevron-down";
                    } else {
                        scope.collapsed = true;
                        scope.chevron = "glyphicon glyphicon-chevron-right";
                    }
                };
                scope.moveKey = function ( obj, key, newkey ) {
                    //moves key to newkey in obj
                    obj[newkey] = obj[key];
                    delete obj[key];
                };
                scope.deleteKey = function ( obj, key ) {
                    if ( getType ( obj ) == "Object" ) {
                        if ( confirm ( 'Delete "' + key + '" and all it contains?' ) ) {
                            delete obj[key];
                        }
                    } else if ( getType ( obj ) == "Array" ) {
                        if ( confirm ( 'Delete "' + obj[key] + '"?' ) ) {
                            obj.splice ( key, 1 );
                        }
                    } else {
                        console.error ( "object to delete from was " + obj );
                    }
                };
                scope.addItem = function ( obj ) {
                    if ( getType ( obj ) == "Object" ) {
                        // check input for key
                        if ( scope.keyName == undefined || scope.keyName.length == 0 ) {
                            alert ( "Please fill in a name" );
                        } else if ( scope.keyName.indexOf ( "$" ) == 0 ) {
                            alert ( "The name may not start with $ (the dollar sign)" );
                        } else if ( scope.keyName.indexOf ( "_" ) == 0 ) {
                            alert ( "The name may not start with _ (the underscore)" );
                        } else {
                            if ( obj[scope.keyName] ) {
                                if ( !confirm ( 'An item with the name "' + scope.keyName
                                    + '" exists already. Do you really want to replace it?' ) ) {
                                    return;
                                }
                            }
                            // add item to object
                            switch ( scope.valueType ) {
                                case stringName:
                                    obj[scope.keyName] = scope.valueName ? scope.possibleNumber ( scope.valueName ) : "";
                                    break;
                                case objectName:
                                    obj[scope.keyName] = {};
                                    break;
                                case arrayName:
                                    obj[scope.keyName] = [];
                                    break;
                                case refName:
                                    obj[scope.keyName] = {"Reference!!!!": "todo"};
                                    break;
                            }
                            //clean-up
                            scope.keyName = "";
                            scope.valueName = "";
                            scope.showAddKey = false;
                        }
                    } else if ( getType ( obj ) == "Array" ) {
                        // add item to array
                        switch ( scope.valueType ) {
                            case stringName:
                                obj.push ( scope.valueName ? scope.valueName : "" );
                                break;
                            case objectName:
                                obj.push ( {} );
                                break;
                            case arrayName:
                                obj.push ( [] );
                                break;
                            case refName:
                                obj.push ( {"Reference!!!!": "todo"} );
                                break;
                        }
                        scope.valueName = "";
                        scope.showAddKey = false;
                    } else {
                        console.error ( "object to add to was " + obj );
                    }
                };
                scope.possibleNumber = function ( val ) {

                    return angular.isNumber ( val ) ? parseFloat ( val ) : val;
                };

                //////
                // Template Generation
                //////

                // Note:
                // sometimes having a different ng-model and then saving it on ng-change
                // into the object or array is necessary for all updates to work

                // recursion
                var switchTemplate =
                    '<span ng-switch on="getType(val)" >'
                    + '<json ng-switch-when="Object" child="val" type="\'object\'"></json>'
                    + '<json ng-switch-when="Array" child="val" type="\'array\'"></json>'
                    + '<span ng-switch-default class="jsonLiteral"><input type="text" ng-model="val" '
                    + 'placeholder="Empty" ng-model-onblur ng-change="child[key] = possibleNumber(val)"/>'
                    + '</span>'
                    + '</span>';

                // display either "plus button" or "key-value inputs"
                var addItemTemplate =
                    '<div ng-switch on="showAddKey" class="block showAdd" >'
                    + '<span ng-switch-when="true">';
                if ( scope.type == "object" ) {
                    // input key
                    addItemTemplate += '<input placeholder="Name" type="text" ui-keyup="{\'enter\':\'addItem(child)\'}" '
                        + 'class="input-sm addItemKeyInput" ng-model="$parent.keyName" />';
                }
                addItemTemplate +=
                    // value type dropdown
                    '<select ng-model="$parent.valueType" ng-options="option for option in valueTypes"'
                    + 'ng-init="$parent.valueType=\'' + stringName + '\'" ui-keydown="{\'enter\':\'addItem(child)\'}"></select>'
                    // input value
                    + '<span ng-show="$parent.valueType == \'' + stringName + '\'"> : <input type="text" placeholder="Value" '
                    + 'class="input-sm addItemValueInput" ng-model="$parent.valueName" ui-keyup="{\'enter\':\'addItem(child)\'}"/></span> '
                    // Add button
                    + '<button class="btn btn-sm btn-primary" ng-click="addItem(child)">Add</button> '
                    + '<button class="btn btn-sm" ng-click="$parent.showAddKey=false">Cancel</button>'
                    + '</span>'
                    + '<span ng-switch-default>'
                    // plus button
                    + '<button class="addObjectItemBtn" ng-click="$parent.showAddKey = true" title="Add new"><i class="glyphicon glyphicon-plus"></i></button>'
                    + '</span>'
                    + '</div>';

                // start template
                if ( scope.type == "object" ) {
                    var template = '<i ng-click="toggleCollapse()" ng-class="chevron"'
                        + ' ng-init="chevron = \'glyphicon glyphicon-chevron-down\'" title="Expand"></i>'
                        + '<span class="jsonItemDesc">' + objectName + '</span>'
                        + '<div class="jsonContents" ng-hide="collapsed">'
                        // repeat
                        + '<span class="block" ng-hide="key.indexOf(\'_\') == 0" ng-repeat="(key, val) in child">'
                        // object key
                        + '<span class="jsonObjectKey">'
                        + '<input class="keyinput" type="text" ng-model="newkey" ng-init="newkey=key" '
                        + 'ng-change="moveKey(child, key, newkey)"/>'
                        // delete button
                        + '<i class="deleteKeyBtn glyphicon glyphicon-trash" ng-click="deleteKey(child, key)" title="Delete item"></i>'
                        + '</span>'
                        // object value
                        + '<span class="jsonObjectValue">' + switchTemplate + '</span>'
                        + '</span>'
                        // repeat end
                        + addItemTemplate
                        + '</div>';
                } else if ( scope.type == "array" ) {
                    var template = '<i ng-click="toggleCollapse()" ng-class="chevron" ng-init="chevron = \'glyphicon glyphicon-chevron-down\'" title="Collapse"></i>'
                        + '<span class="jsonItemDesc">' + arrayName + '</span>'
                        + '<div class="jsonContents" ng-hide="collapsed">'
                        + '<ol class="arrayOl" ui-sortable ng-model="child">'
                        // repeat
                        + '<li class="arrayItem" ng-repeat="val in child">'
                        // delete button
                        + '<i class="deleteKeyBtn glyphicon glyphicon-trash" ng-click="deleteKey(child, $index)" title="Delete item"></i>'
                        + '<i class="moveArrayItemBtn glyphicon glyphicon-move"></i>'
                        + '<span>' + switchTemplate + '</span>'
                        + '</li>'
                        // repeat end
                        + '</ol>'
                        + addItemTemplate
                        + '</div>';
                } else {
                    console.error ( "scope.type was " + scope.type );
                }

                var newElement = angular.element ( template );
                $compile ( newElement ) ( scope );
                element.replaceWith ( newElement );
            }
        };
    } );

    //return the app
    return app;

} ));




(function (window){
  window.gapiMockData = {};
})(window);

(function (gapiMockData){
  gapiMockData.users = [{
      "id": "c173f77e-7069-45bb-9d08-99bd2db7faf8",
      "companyId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
      "username": "michael.sanchez@awesome.io",
      "creationDate": "2014-05-12T15:45:20.289Z",
      "firstName": "Michael",
      "lastName": "Sanchez",
      "email": "michael.sanchez@awesome.io",
      "telephone": "+1123-456-7890",
      "lastLogin": "2014-08-18T12:03:40.000Z",
      "status": 1,
      "roles": [
      "ce",
      "cp",
      "da",
      "ua",
      "pu"
      ],
      "termsAcceptanceDate": "2014-06-19T18:01:33.000Z",
      "showTutorial": false,
      "mailSyncEnabled": false,
      "changedBy": "bloosbrock@gmail.com",
      "changeDate": "2014-07-18T11:38:24.668Z"
    },
    {
     "id": "3ba4cafc-a1ed-42ac-aaea-28529f56ebf5",
     "companyId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
     "username": "alex.deaconu@gmail.com",
     "creationDate": "2012-03-12T15:11:34.000Z",
     "firstName": "Alex",
     "lastName": "Deaconu",
     "email": "alex.deaconu@gmail.com",
     "lastLogin": "2014-09-04T21:40:39.000Z",
     "status": 1,
     "roles": [
      "ce",
      "cp",
      "da",
      "ua",
      "sa"
     ],
     "termsAcceptanceDate": "2010-10-25T20:50:48.000Z",
     "showTutorial": false,
     "mailSyncEnabled": false,
     "changedBy": "alex.deaconu@gmail.com",
     "changeDate": "2014-06-02T15:19:14.229Z",
     "kind": "core#userItem"
    },
    {
     "id": "6818ccfe-8fb6-47b5-8d1f-8f158bd17346",
     "companyId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
     "username": "alex.kolenoff@risedisplay.com",
     "creationDate": "2014-05-20T20:13:29.942Z",
     "firstName": "Alex",
     "lastName": "Kolenoff",
     "email": "alex.kolenoff@risedisplay.com",
     "lastLogin": "2014-08-28T19:11:06.000Z",
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
     "termsAcceptanceDate": "2014-05-20T20:16:46.000Z",
     "showTutorial": false,
     "mailSyncEnabled": false,
     "changedBy": "alex.kolenoff@risedisplay.com",
     "changeDate": "2014-05-20T20:17:14.286Z",
     "kind": "core#userItem"
    },
    {
     "id": "48a1381e-d7b0-456e-a660-08faf0b0c953",
     "companyId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
     "username": "alexey.konovalov@risevision.com",
     "creationDate": "2012-09-27T21:38:52.778Z",
     "firstName": "Alexey",
     "lastName": "Konovalov",
     "email": "alexey.konovalov@risevision.com",
     "lastLogin": "2014-08-28T18:59:43.000Z",
     "status": 1,
     "roles": [
      "ce",
      "cp",
      "da",
      "ua",
      "ba",
      "sa"
     ],
     "termsAcceptanceDate": "2014-04-08T18:48:57.000Z",
     "showTutorial": false,
     "mailSyncEnabled": false,
     "changedBy": "alexey.konovalov@risevision.com",
     "changeDate": "2014-04-08T18:52:07.423Z",
     "kind": "core#userItem"
    },
    {
     "id": "a05a9a0c-9cd8-4cce-986d-a733646e8503",
     "companyId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
     "username": "asc@risedisplay.com",
     "creationDate": "2012-07-23T14:58:02.900Z",
     "firstName": "Alan",
     "lastName": "Clayton",
     "email": "asc@risedisplay.com",
     "lastLogin": "2014-05-20T23:04:39.000Z",
     "status": 1,
     "roles": [
      "ce",
      "cp",
      "da",
      "ua",
      "sa"
     ],
     "termsAcceptanceDate": "2012-07-23T19:07:22.000Z",
     "showTutorial": false,
     "mailSyncEnabled": true,
     "changedBy": "System",
     "changeDate": "2014-01-02T22:18:09.007Z",
     "kind": "core#userItem"
    },
    {
     "id": "4deaed13-376c-456d-802c-63809efa8de0",
     "companyId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
     "username": "asc@risevision.com",
     "creationDate": "2014-04-16T21:55:18.491Z",
     "email": "asc@risevision.com",
     "lastLogin": "2014-09-05T13:38:12.000Z",
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
     "termsAcceptanceDate": "2014-04-16T21:55:38.000Z",
     "showTutorial": false,
     "mailSyncEnabled": false,
     "changedBy": "asc@risevision.com",
     "changeDate": "2014-05-16T17:12:58.761Z",
     "kind": "core#userItem"
    },
    {
     "id": "bcd83e2d-49c8-4675-a94b-7da0698785f0",
     "companyId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
     "username": "bld@riseholdings.com",
     "creationDate": "2012-04-26T17:39:36.000Z",
     "firstName": "Byron",
     "lastName": "Darlison",
     "telephone": "416-602-2229",
     "email": "bld@riseholdings.com",
     "lastLogin": "2014-09-05T13:27:59.000Z",
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
     "termsAcceptanceDate": "2012-04-26T17:43:57.000Z",
     "showTutorial": true,
     "mailSyncEnabled": true,
     "changedBy": "bloosbrock@gmail.com",
     "changeDate": "2014-06-16T12:55:30.143Z",
     "kind": "core#userItem"
    },
    {
     "id": "843f5780-624d-46de-abbf-0c26475f45a8",
     "companyId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
     "username": "bloosbrock@gmail.com",
     "creationDate": "2012-03-21T21:21:34.000Z",
     "firstName": "Brian",
     "lastName": "Loosbrock",
     "email": "bloosbrock@gmail.com",
     "lastLogin": "2014-09-02T13:32:36.000Z",
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
     "termsAcceptanceDate": "2012-03-21T21:21:59.000Z",
     "showTutorial": false,
     "mailSyncEnabled": true,
     "changedBy": "bloosbrock@gmail.com",
     "changeDate": "2014-07-18T11:36:45.875Z",
     "kind": "core#userItem"
    },
    {
     "id": "7dfe567a-3e04-4e6c-8263-730ea12e7db4",
     "companyId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
     "username": "byron.darlison@gmail.com",
     "creationDate": "2011-07-23T10:34:49.000Z",
     "firstName": "Byron",
     "lastName": "Darlison",
     "telephone": "416-602-2229",
     "email": "byron.darlison@gmail.com",
     "lastLogin": "2012-09-08T09:58:50.000Z",
     "status": 1,
     "roles": [
      "da",
      "ua",
      "sa",
      "ce",
      "cp"
     ],
     "termsAcceptanceDate": "2010-09-28T17:02:20.000Z",
     "showTutorial": false,
     "mailSyncEnabled": true,
     "changedBy": "System",
     "changeDate": "2012-09-15T10:02:52.889Z",
     "kind": "core#userItem"
    },
    {
     "id": "b598ad16-9d5f-43db-b72f-6f7b7c8a9c5b",
     "companyId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
     "username": "del@risedisplay.com",
     "creationDate": "2013-01-14T22:51:01.396Z",
     "firstName": "David",
     "lastName": "Lugo",
     "email": "del@risedisplay.com",
     "lastLogin": "2014-08-28T22:31:02.000Z",
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
     "termsAcceptanceDate": "2013-01-15T14:24:46.000Z",
     "showTutorial": false,
     "mailSyncEnabled": false,
     "changedBy": "bloosbrock@gmail.com",
     "changeDate": "2014-06-23T16:04:36.169Z",
     "kind": "core#userItem"
    },
    {
     "id": "8967ccb0-b721-4cef-a6bb-6d970bee3406",
     "companyId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
     "username": "dlichtenauer82@gmail.com",
     "creationDate": "2011-04-22T16:27:27.000Z",
     "firstName": "Derek",
     "lastName": "Lichtenauer",
     "email": "dlichtenauer82@gmail.com",
     "lastLogin": "2012-08-02T13:49:31.000Z",
     "status": 1,
     "roles": [
      "da",
      "ua",
      "sa",
      "ce",
      "cp"
     ],
     "termsAcceptanceDate": "2011-04-22T16:27:27.000Z",
     "showTutorial": false,
     "mailSyncEnabled": true,
     "changedBy": "System",
     "changeDate": "2012-08-09T13:51:53.444Z",
     "kind": "core#userItem"
    },
    {
     "id": "55d556ba-7e3e-454b-890b-151ee8299638",
     "companyId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
     "username": "donnapep@gmail.com",
     "creationDate": "2011-07-19T02:20:57.000Z",
     "firstName": "Donna",
     "lastName": "Peplinskie",
     "email": "donnapep@gmail.com",
     "lastLogin": "2014-09-08T20:40:56.000Z",
     "status": 1,
     "roles": [
      "ce",
      "cp",
      "da",
      "ua",
      "ba",
      "sa"
     ],
     "termsAcceptanceDate": "2010-12-10T14:39:29.000Z",
     "showTutorial": false,
     "mailSyncEnabled": true,
     "changedBy": "donnapep@gmail.com",
     "changeDate": "2014-05-13T17:10:14.519Z",
     "kind": "core#userItem"
    },
    {
     "id": "ea2c683c-d9f1-4b26-a5d5-04129397acbc",
     "companyId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
     "username": "grant.matabaran@risedisplay.com",
     "creationDate": "2014-03-03T20:52:59.593Z",
     "email": "grant.matabaran@risedisplay.com",
     "lastLogin": "2014-03-04T13:19:54.000Z",
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
     "termsAcceptanceDate": "2014-03-05T03:09:18.000Z",
     "showTutorial": false,
     "mailSyncEnabled": true,
     "changedBy": "grant.matabaran@risedisplay.com",
     "changeDate": "2014-03-04T10:56:37.448Z",
     "kind": "core#userItem"
    },
    {
     "id": "c093cb5b-b9a2-412d-a54e-bd392f06ea6d",
     "companyId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
     "username": "joncoedisko@gmail.com",
     "creationDate": "2013-11-20T22:08:28.951Z",
     "firstName": "Jon",
     "lastName": "Coe",
     "email": "joncoedisko@gmail.com",
     "lastLogin": "2013-11-27T16:29:39.000Z",
     "status": 1,
     "roles": [
      "ce",
      "cp",
      "da",
      "ua"
     ],
     "termsAcceptanceDate": "2013-11-27T16:31:04.000Z",
     "showTutorial": true,
     "mailSyncEnabled": true,
     "changedBy": "System",
     "changeDate": "2013-12-04T16:32:29.607Z",
     "kind": "core#userItem"
    },
    {
     "id": "8a3d4cba-5f96-46a0-88bf-6f3621b755c2",
     "companyId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
     "username": "jrs@risevision.com",
     "creationDate": "2014-05-14T19:12:09.775Z",
     "firstName": "Justin",
     "lastName": "Smith",
     "email": "jrs@risevision.com",
     "lastLogin": "2014-08-28T19:17:29.000Z",
     "status": 1,
     "roles": [
      "ce",
      "cp",
      "da",
      "ua",
      "sa"
     ],
     "termsAcceptanceDate": "2014-05-14T19:12:16.000Z",
     "showTutorial": false,
     "mailSyncEnabled": true,
     "changedBy": "jrs@risevision.com",
     "changeDate": "2014-05-14T19:12:46.051Z",
     "kind": "core#userItem"
    },
    {
     "id": "8127afe4-2c43-46fc-959d-3add2d959b7e",
     "companyId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
     "username": "m.farooq2000@gmail.com",
     "creationDate": "2014-03-12T19:16:13.843Z",
     "email": "m.farooq2000@gmail.com",
     "lastLogin": "2014-08-30T23:32:41.000Z",
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
     "termsAcceptanceDate": "2014-03-12T19:17:36.000Z",
     "showTutorial": false,
     "mailSyncEnabled": false,
     "changedBy": "m.farooq2000@gmail.com",
     "changeDate": "2014-04-17T01:30:56.272Z",
     "kind": "core#userItem"
    },
    {
     "id": "2b4711f9-c200-4513-9162-299737453c7a",
     "companyId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
     "username": "mlm@risedisplay.com",
     "creationDate": "2011-04-26T21:19:56.000Z",
     "firstName": "Mat",
     "lastName": "Meiers",
     "email": "mlm@risedisplay.com",
     "lastLogin": "2014-08-20T13:23:50.000Z",
     "status": 1,
     "roles": [
      "da",
      "ua",
      "sa",
      "ce",
      "cp"
     ],
     "termsAcceptanceDate": "2011-04-26T21:20:06.000Z",
     "showTutorial": false,
     "mailSyncEnabled": true,
     "changedBy": "System",
     "changeDate": "2014-01-22T20:39:30.403Z",
     "kind": "core#userItem"
    },
    {
     "id": "e2521f10-4bd5-4a88-a9fd-5e785428e32c",
     "companyId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
     "username": "mona.hotnsweet@gmail.com",
     "creationDate": "2011-07-14T00:21:34.000Z",
     "firstName": "Moneka",
     "email": "Mona.hotnsweet@gmail.com",
     "lastLogin": "2011-09-12T05:58:12.000Z",
     "status": 1,
     "roles": [
      "da",
      "ua",
      "ce",
      "cp"
     ],
     "termsAcceptanceDate": "2011-06-19T15:46:45.000Z",
     "showTutorial": false,
     "mailSyncEnabled": true,
     "changedBy": "mona.hotnsweet@gmail.com",
     "changeDate": "2012-04-03T20:52:52.000Z",
     "kind": "core#userItem"
    },
    {
     "id": "0b9fcaa9-aa34-4062-add4-c59ba55cd07c",
     "companyId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
     "username": "neal.godbeer@risevision.com",
     "creationDate": "2011-07-21T19:22:03.000Z",
     "firstName": "Neal",
     "lastName": "Godbeer",
     "email": "neal.godbeer@risevision.com",
     "lastLogin": "2014-09-08T14:44:31.000Z",
     "status": 1,
     "roles": [
      "da",
      "ua",
      "sa",
      "ce",
      "cp"
     ],
     "termsAcceptanceDate": "2010-11-22T14:42:32.000Z",
     "showTutorial": false,
     "mailSyncEnabled": true,
     "changedBy": "System",
     "changeDate": "2014-01-24T21:56:01.730Z",
     "kind": "core#userItem"
    },
    {
     "id": "86494257-ce0d-4ec2-acfc-f5e07999b9d0",
     "companyId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
     "username": "oleg.khasimkhanov@gmail.com",
     "creationDate": "2010-11-26T21:27:09.000Z",
     "firstName": "Oleg",
     "lastName": "K",
     "email": "oleg.khasimkhanov@risevision.com",
     "lastLogin": "2014-06-09T20:13:48.000Z",
     "status": 1,
     "roles": [
      "da",
      "ua",
      "sa",
      "ce",
      "cp"
     ],
     "termsAcceptanceDate": "2014-06-09T20:10:58.000Z",
     "showTutorial": false,
     "mailSyncEnabled": false,
     "changedBy": "oleg.khasimkhanov@gmail.com",
     "changeDate": "2014-06-09T20:10:58.347Z",
     "kind": "core#userItem"
    },
    {
     "id": "5b830b65-dd83-4e03-9005-53e630897f54",
     "companyId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
     "username": "oleg.khasimkhanov@risevision.com",
     "creationDate": "2010-09-24T14:33:45.000Z",
     "firstName": "Oleg",
     "lastName": "K",
     "email": "oleg.khasimkhanov@risevision.com",
     "lastLogin": "2014-08-18T14:48:00.000Z",
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
     "termsAcceptanceDate": "2010-09-24T14:33:35.000Z",
     "showTutorial": false,
     "mailSyncEnabled": true,
     "changedBy": "oleg.khasimkhanov@risevision.com",
     "changeDate": "2014-03-26T19:32:19.623Z",
     "kind": "core#userItem"
    },
    {
     "id": "17167611-4598-42fb-847a-0b8ce1434ce3",
     "companyId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
     "username": "riseqa1@gmail.com",
     "creationDate": "2013-11-19T16:45:54.453Z",
     "firstName": "Rise",
     "lastName": "QA",
     "email": "riseqa1@gmail.com",
     "lastLogin": "2013-11-20T16:28:58.000Z",
     "status": 1,
     "roles": [
      "ce",
      "cp",
      "da",
      "ua"
     ],
     "termsAcceptanceDate": "1970-01-01T00:00:00.000Z",
     "showTutorial": true,
     "mailSyncEnabled": true,
     "changedBy": "System",
     "changeDate": "2013-11-27T16:29:21.270Z",
     "kind": "core#userItem"
    },
    {
     "id": "33a8c657-3fc5-4549-89bc-27b44ae656b2",
     "companyId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
     "username": "rjcahoy@gmail.com",
     "creationDate": "2012-02-01T13:36:32.000Z",
     "email": "rjcahoy@gmail.com",
     "lastLogin": "2013-10-24T19:52:39.000Z",
     "status": 1,
     "roles": [
      "ce",
      "cp",
      "da",
      "ua",
      "sa"
     ],
     "termsAcceptanceDate": "2012-02-01T13:37:05.000Z",
     "showTutorial": true,
     "mailSyncEnabled": true,
     "changedBy": "System",
     "changeDate": "2013-10-31T19:55:20.069Z",
     "kind": "core#userItem"
    },
    {
     "id": "cb6c1ba7-8b74-45ae-bfb1-4d7ee4acdf92",
     "companyId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
     "username": "robb.price@risevision.com",
     "creationDate": "2011-08-04T20:20:09.000Z",
     "firstName": "Robb",
     "lastName": "Price",
     "email": "robb.price@risevision.com",
     "lastLogin": "2014-09-08T15:35:21.000Z",
     "status": 1,
     "roles": [
      "ce",
      "cp",
      "da",
      "ua",
      "ba",
      "sa"
     ],
     "termsAcceptanceDate": "2010-10-28T14:03:39.000Z",
     "showTutorial": false,
     "mailSyncEnabled": true,
     "changedBy": "robb.price@risevision.com",
     "changeDate": "2014-06-11T20:47:45.586Z",
     "kind": "core#userItem"
    },
    {
     "id": "4c4f5d13-90fe-4cba-948e-20fae8ff5d1a",
     "companyId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
     "username": "sethspencerbalugo@gmail.com",
     "creationDate": "2013-07-16T16:39:58.480Z",
     "firstName": "Seth",
     "email": "sethspencerbalugo@gmail.com",
     "lastLogin": "2013-08-20T03:12:50.000Z",
     "status": 1,
     "roles": [
      "ce",
      "cp"
     ],
     "termsAcceptanceDate": "1970-01-01T00:00:00.000Z",
     "showTutorial": true,
     "mailSyncEnabled": true,
     "changedBy": "System",
     "changeDate": "2013-08-27T03:15:44.471Z",
     "kind": "core#userItem"
    },
    {
     "id": "113f7770-bcf9-49cd-8e35-6eb23354247f",
     "companyId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
     "username": "steve.sherrie@risevision.com",
     "creationDate": "2014-04-30T13:46:53.268Z",
     "firstName": "Steve",
     "lastName": "Sherrie",
     "email": "steve.sherrie@risevision.com",
     "lastLogin": "2014-08-28T18:39:36.000Z",
     "status": 1,
     "roles": [
      "ce",
      "ua",
      "ba"
     ],
     "termsAcceptanceDate": "2014-05-06T14:19:57.000Z",
     "showTutorial": false,
     "mailSyncEnabled": false,
     "changedBy": "steve.sherrie@risevision.com",
     "changeDate": "2014-08-28T18:39:30.513Z",
     "kind": "core#userItem"
    },
    {
     "id": "58eb416d-7eb2-44d3-8cde-c3d71db56171",
     "companyId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
     "username": "stuart.lees@risevision.com",
     "creationDate": "2014-04-24T13:08:06.944Z",
     "firstName": "Stu",
     "lastName": "Lees",
     "email": "stuart.lees@risevision.com",
     "lastLogin": "2014-09-05T19:54:17.000Z",
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
     "termsAcceptanceDate": "2014-04-28T16:48:36.000Z",
     "showTutorial": false,
     "mailSyncEnabled": false,
     "changedBy": "stuart.lees@risevision.com",
     "changeDate": "2014-04-28T16:48:36.831Z",
     "kind": "core#userItem"
    },
    {
     "id": "efdb88d5-40d7-4bd1-b1bb-48d4735b0ec8",
     "companyId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
     "username": "todd.hemme@gmail.com",
     "creationDate": "2012-02-07T20:54:46.000Z",
     "firstName": "Todd",
     "lastName": "Hemme",
     "email": "todd.hemme@gmail.com",
     "lastLogin": "2013-07-31T21:46:00.000Z",
     "status": 1,
     "roles": [
      "ce",
      "cp",
      "da",
      "ua",
      "pu",
      "sa"
     ],
     "termsAcceptanceDate": "2012-03-06T00:23:07.000Z",
     "showTutorial": true,
     "mailSyncEnabled": true,
     "changedBy": "bloosbrock@gmail.com",
     "changeDate": "2014-02-18T15:02:24.669Z",
     "kind": "core#userItem"
    },
    {
     "id": "906e7fe1-32a2-46d6-93d9-649bc2fffc55",
     "companyId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
     "username": "todd.hemme@risevision.com",
     "creationDate": "2011-05-18T15:40:15.000Z",
     "firstName": "Todd",
     "lastName": "Hemme",
     "email": "todd.hemme@risevision.com",
     "lastLogin": "2013-04-18T18:45:38.000Z",
     "status": 1,
     "roles": [
      "ce",
      "cp",
      "da",
      "ua",
      "pu",
      "sa"
     ],
     "termsAcceptanceDate": "2011-05-18T15:40:14.000Z",
     "showTutorial": false,
     "mailSyncEnabled": true,
     "changedBy": "bloosbrock@gmail.com",
     "changeDate": "2014-02-18T15:02:03.809Z",
     "kind": "core#userItem"
    },
    {
     "id": "700da7cd-2a35-484b-ab0b-cb41c44dfcf2",
     "companyId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
     "username": "tyler.johnson@risevision.com",
     "creationDate": "2014-05-01T14:21:29.978Z",
     "firstName": "Tyler",
     "email": "tyler.johnson@risevision.com",
     "lastLogin": "2014-09-08T21:07:35.000Z",
     "status": 1,
     "roles": [
      "ce",
      "cp",
      "da",
      "ua",
      "ba",
      "sa"
     ],
     "termsAcceptanceDate": "2014-05-06T13:35:55.000Z",
     "showTutorial": false,
     "mailSyncEnabled": false,
     "changedBy": "tyler.johnson@risevision.com",
     "changeDate": "2014-07-30T21:43:39.598Z",
     "kind": "core#userItem"
    },
    {
     "id": "fc599d9b-4688-456e-a318-1df36cd9df54",
     "companyId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
     "username": "ufomurphy@gmail.com",
     "creationDate": "2011-02-06T07:06:39.000Z",
     "firstName": "Bill",
     "lastName": "Murphy",
     "email": "ufomurphy@gmail.com",
     "lastLogin": "2011-04-28T03:57:35.000Z",
     "status": 1,
     "roles": [
      "da",
      "ce",
      "cp"
     ],
     "termsAcceptanceDate": "2011-02-06T07:06:39.000Z",
     "showTutorial": false,
     "mailSyncEnabled": true,
     "changedBy": "ufomurphy@gmail.com",
     "changeDate": "2012-04-03T20:52:49.000Z",
     "kind": "core#userItem"
    },
    {
     "id": "23a7465c-08d9-4a14-9fa4-2a12fc039927",
     "companyId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
     "username": "varun@rangle.io",
     "creationDate": "2014-07-18T11:37:39.910Z",
     "firstName": "Varun",
     "lastName": "Vachhar",
     "email": "varun@rangle.io",
     "lastLogin": "2014-09-03T23:33:29.000Z",
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
     "termsAcceptanceDate": "2014-07-30T21:10:26.000Z",
     "showTutorial": false,
     "mailSyncEnabled": false,
     "changedBy": "varun@rangle.io",
     "changeDate": "2014-07-30T21:10:26.768Z",
     "kind": "core#userItem"
    },
    {
     "id": "99656071-b827-4e39-8f65-8831c698dae1",
     "companyId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
     "username": "web.worker.82@gmail.com",
     "creationDate": "2011-03-11T22:25:49.000Z",
     "firstName": "Alex",
     "lastName": "Babut",
     "email": "web.worker.82@gmail.com",
     "lastLogin": "2011-03-13T21:10:24.000Z",
     "status": 1,
     "roles": [
      "da",
      "ua",
      "sa",
      "ce",
      "cp"
     ],
     "termsAcceptanceDate": "2011-03-11T22:25:50.000Z",
     "showTutorial": false,
     "mailSyncEnabled": true,
     "changedBy": "web.worker.82@gmail.com",
     "changeDate": "2012-04-03T20:52:50.000Z",
     "kind": "core#userItem"
    },
    {
     "id": "c173f77e-7069-45bb-9d08-99bd2db7faf8",
     "companyId": "b428b4e8-c8b9-41d5-8a10-b4193c789443",
     "username": "xiyang@rangle.io",
     "creationDate": "2014-05-12T15:45:20.289Z",
     "firstName": "Xiyang",
     "lastName": "Chen",
     "email": "xiyang@rangle.io",
     "lastLogin": "2014-09-08T21:11:37.424Z",
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
     "changeDate": "2014-07-18T11:38:24.668Z",
     "kind": "core#userItem"
    }
   ];
})(window.gapiMockData);

(function (gapiMockData) {
  "use strict";

gapiMockData.companies = [
  {
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
    "kind": "core#userItem",
    "authKey": "b428b4e8-c8b9-41d5-8a10-b4193c789443"
  },
  {
    "id": "5129927f-44dc-44ea-9f1e-83f6e86d8aa4",
    "authKey": "5129927f-44dc-44ea-9f1e-83f6e86d8aa4",
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
    "kind": "core#companyItem",
    "authKey": "87717b9a-9dcc-4ea7-948c-028f03f62d01"
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
    "kind": "core#companyItem",
    "authKey": "029f2040-1126-4a30-9ca3-af33911ec753"
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
    "kind": "core#companyItem",
    "authKey": "818e8218-1337-4077-823b-476238992bf1"
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
    "kind": "core#companyItem",
    "authKey": "ed4461f5-f689-4e78-a97a-4b58deeb3694"
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
    "kind": "core#companyItem",
    "authKey": "3be0ee48-6e94-4d68-be4e-23e4e99a1b9e"
  },
  {
    "id": "27d5fa3d-a66a-47a9-9a6d-10041751ce09",
    "authKey": "27d5fa3d-a66a-47a9-9a6d-10041751ce09",
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
    "kind": "core#companyItem",
    "authKey": "752fdcc2-8a28-4567-b111-e7ed825bf341"
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
    "kind": "core#companyItem",
    "authKey": "984ec29b-c284-477e-b674-fea446559234"
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
    "kind": "core#companyItem",
    "authKey": "f059a036-9967-4811-b9a0-9bcc89ceabae"
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
    "kind": "core#companyItem",
    "authKey": "ea6656be-dc19-49d2-85da-ea88be5a6693"
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
    "kind": "core#companyItem",
    "authKey": "397defb6-1611-45bc-a693-52f2416da194"
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
    "kind": "core#companyItem",
    "authKey": "ea0477ff-0293-43e1-92f6-3f5f80d7b993"
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
    "kind": "core#companyItem",
    "authKey": "e21875a0-c80b-409e-a6a0-cc7d3a05ac9c"
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
    "kind": "core#companyItem",
    "authKey": "6a438085-09dc-4bdc-953e-ed0317d3bdae"
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
    "kind": "core#companyItem",
    "authKey": "22c303cd-d3c4-4e11-9c5f-56282e5429ac"
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
    "kind": "core#companyItem",
    "authKey": "17899fe3-db05-4ecd-ade4-a7106fe53784"
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
    "kind": "core#companyItem",
    "authKey": "b8287203-13e1-4eba-99e6-ec21f37ed65a"
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
    "kind": "core#companyItem",
    "authKey": "6cff2085-ee68-48cc-901c-14128e8f04ca"
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
    "kind": "core#companyItem",
    "authKey": "0aac9657-bfcc-4554-a94e-5ea6e55e5dcf"
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
    "kind": "core#companyItem",
    "authKey": "ca1daa40-22dc-47d9-b03a-73c7037dfb1b"
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
    "kind": "core#companyItem",
    "authKey": "78a3ec26-115d-4822-915f-8b220b6df274"
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
    "kind": "core#companyItem",
    "authKey": "1260d334-f081-4d6b-81d1-11e52d2243a0"
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
    "kind": "core#companyItem",
    "authKey": "2b6034c0-8030-4caa-b39a-920b7b324e87"
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
    "kind": "core#companyItem",
    "authKey": "857784b9-39d9-4cb3-bee4-a96036e66ced"
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
    "kind": "core#companyItem",
    "authKey": "fe3f1dd1-ccc2-4343-a796-c2a0a6a092ec"
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
    "kind": "core#companyItem",
    "authKey": "3509cd9b-e9ba-47d2-84bb-f954db4641b1"
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
    "kind": "core#companyItem",
    "authKey": "d6119f4b-09de-4aba-8c56-2a334a32e492"
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
    "kind": "core#companyItem",
    "authKey": "4283485e-5b40-4c34-a7aa-e6fb1ad7bcf8"
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
    "kind": "core#companyItem",
    "authKey": "bfaf9b18-fd5b-475b-afe1-a511cd73662f"
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
    "kind": "core#companyItem",
    "authKey": "38dbc98d-9f98-4fb3-8c1f-86a2b5a38733"
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
    "kind": "core#companyItem",
    "authKey": "fd07c488-3266-4d71-a5b1-6e7a82e642cd"
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
    "kind": "core#companyItem",
    "authKey": "808bc4af-7b53-4637-af8a-51264406a64a"
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
    "kind": "core#companyItem",
    "authKey": "0f25159f-97bf-4197-afdb-b664fa77f155"
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
    "kind": "core#companyItem",
    "authKey": "c7f3a27e-9760-44ff-b91d-5573ff128bc5"
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
    "kind": "core#companyItem",
    "authKey": "97c9c100-5388-4205-b5cc-c75e8e2edf01"
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
    "kind": "core#companyItem",
    "authKey": "3cd32297-1e65-4271-9068-ee1d5f44afbf"
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
    "kind": "core#companyItem",
    "authKey": "3483aa5f-bb86-4751-b552-26297be824ad"
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
    "kind": "core#companyItem",
    "authKey": "0d813505-5fb4-4326-b03e-1d3197e82cc0"
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
    "kind": "core#companyItem",
    "authKey": "d8637d2d-7ac6-4da4-8947-4430d1ac169c"
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
    "kind": "core#companyItem",
    "authKey": "c18e1b29-2392-4c99-a4ef-79685fb40399"
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
    "kind": "core#companyItem",
    "authKey": "f9b6c2e9-d850-4a1f-b685-cea62a6563b4"
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
    "kind": "core#companyItem",
    "authKey": "9174c45d-69c6-474a-b9c1-a6367677895c"
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
    "kind": "core#companyItem",
    "authKey": "85eb3648-c3c5-40e3-a93a-39b50d114cba"
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
    "kind": "core#companyItem",
    "authKey": "24c243ab-3fa8-4a74-9e00-bbcb570c0a42"
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
    "kind": "core#companyItem",
    "authKey": "301ba3aa-8d19-4344-b743-607c1af7d517"
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
    "kind": "core#companyItem",
    "authKey": "2d3ddce9-09a6-4137-9fdb-8d9b866c42d1"
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
    "kind": "core#companyItem",
    "authKey": "c6ef4ad7-f294-4cb9-b861-339b277ea3ef"
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
    "kind": "core#companyItem",
    "authKey": "1e67e795-4df9-4aea-b9f2-6d2d76329b40"
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
    "kind": "core#companyItem",
    "authKey": "f21deea7-2394-46b3-86db-d0b860073d8b"
  }
];

  gapiMockData.companyRespSkeleton = {
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


})(window.gapiMockData);

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

/*!
 * mustache.js - Logic-less {{mustache}} templates with JavaScript
 * http://github.com/janl/mustache.js
 */

/*global define: false*/

(function (root, factory) {
  if (typeof exports === "object" && exports) {
    factory(exports); // CommonJS
  } else {
    var mustache = {};
    factory(mustache);
    if (typeof define === "function" && define.amd) {
      define(mustache); // AMD
    } else {
      root.Mustache = mustache; // <script>
    }
  }
}(this, function (mustache) {

  // Workaround for https://issues.apache.org/jira/browse/COUCHDB-577
  // See https://github.com/janl/mustache.js/issues/189
  var RegExp_test = RegExp.prototype.test;
  function testRegExp(re, string) {
    return RegExp_test.call(re, string);
  }

  var nonSpaceRe = /\S/;
  function isWhitespace(string) {
    return !testRegExp(nonSpaceRe, string);
  }

  var Object_toString = Object.prototype.toString;
  var isArray = Array.isArray || function (object) {
    return Object_toString.call(object) === '[object Array]';
  };

  function isFunction(object) {
    return typeof object === 'function';
  }

  function escapeRegExp(string) {
    return string.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
  }

  var entityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": '&#39;',
    "/": '&#x2F;'
  };

  function escapeHtml(string) {
    return String(string).replace(/[&<>"'\/]/g, function (s) {
      return entityMap[s];
    });
  }

  function escapeTags(tags) {
    if (!isArray(tags) || tags.length !== 2) {
      throw new Error('Invalid tags: ' + tags);
    }

    return [
      new RegExp(escapeRegExp(tags[0]) + "\\s*"),
      new RegExp("\\s*" + escapeRegExp(tags[1]))
    ];
  }

  var whiteRe = /\s*/;
  var spaceRe = /\s+/;
  var equalsRe = /\s*=/;
  var curlyRe = /\s*\}/;
  var tagRe = /#|\^|\/|>|\{|&|=|!/;

  /**
   * Breaks up the given `template` string into a tree of tokens. If the `tags`
   * argument is given here it must be an array with two string values: the
   * opening and closing tags used in the template (e.g. [ "<%", "%>" ]). Of
   * course, the default is to use mustaches (i.e. mustache.tags).
   *
   * A token is an array with at least 4 elements. The first element is the
   * mustache symbol that was used inside the tag, e.g. "#" or "&". If the tag
   * did not contain a symbol (i.e. {{myValue}}) this element is "name". For
   * all text that appears outside a symbol this element is "text".
   *
   * The second element of a token is its "value". For mustache tags this is
   * whatever else was inside the tag besides the opening symbol. For text tokens
   * this is the text itself.
   *
   * The third and fourth elements of the token are the start and end indices,
   * respectively, of the token in the original template.
   *
   * Tokens that are the root node of a subtree contain two more elements: 1) an
   * array of tokens in the subtree and 2) the index in the original template at
   * which the closing tag for that section begins.
   */
  function parseTemplate(template, tags) {
    tags = tags || mustache.tags;
    template = template || '';

    if (typeof tags === 'string') {
      tags = tags.split(spaceRe);
    }

    var tagRes = escapeTags(tags);
    var scanner = new Scanner(template);

    var sections = [];     // Stack to hold section tokens
    var tokens = [];       // Buffer to hold the tokens
    var spaces = [];       // Indices of whitespace tokens on the current line
    var hasTag = false;    // Is there a {{tag}} on the current line?
    var nonSpace = false;  // Is there a non-space char on the current line?

    // Strips all whitespace tokens array for the current line
    // if there was a {{#tag}} on it and otherwise only space.
    function stripSpace() {
      if (hasTag && !nonSpace) {
        while (spaces.length) {
          delete tokens[spaces.pop()];
        }
      } else {
        spaces = [];
      }

      hasTag = false;
      nonSpace = false;
    }

    var start, type, value, chr, token, openSection;
    while (!scanner.eos()) {
      start = scanner.pos;

      // Match any text between tags.
      value = scanner.scanUntil(tagRes[0]);
      if (value) {
        for (var i = 0, len = value.length; i < len; ++i) {
          chr = value.charAt(i);

          if (isWhitespace(chr)) {
            spaces.push(tokens.length);
          } else {
            nonSpace = true;
          }

          tokens.push(['text', chr, start, start + 1]);
          start += 1;

          // Check for whitespace on the current line.
          if (chr === '\n') {
            stripSpace();
          }
        }
      }

      // Match the opening tag.
      if (!scanner.scan(tagRes[0])) break;
      hasTag = true;

      // Get the tag type.
      type = scanner.scan(tagRe) || 'name';
      scanner.scan(whiteRe);

      // Get the tag value.
      if (type === '=') {
        value = scanner.scanUntil(equalsRe);
        scanner.scan(equalsRe);
        scanner.scanUntil(tagRes[1]);
      } else if (type === '{') {
        value = scanner.scanUntil(new RegExp('\\s*' + escapeRegExp('}' + tags[1])));
        scanner.scan(curlyRe);
        scanner.scanUntil(tagRes[1]);
        type = '&';
      } else {
        value = scanner.scanUntil(tagRes[1]);
      }

      // Match the closing tag.
      if (!scanner.scan(tagRes[1])) {
        throw new Error('Unclosed tag at ' + scanner.pos);
      }

      token = [ type, value, start, scanner.pos ];
      tokens.push(token);

      if (type === '#' || type === '^') {
        sections.push(token);
      } else if (type === '/') {
        // Check section nesting.
        openSection = sections.pop();

        if (!openSection) {
          throw new Error('Unopened section "' + value + '" at ' + start);
        }
        if (openSection[1] !== value) {
          throw new Error('Unclosed section "' + openSection[1] + '" at ' + start);
        }
      } else if (type === 'name' || type === '{' || type === '&') {
        nonSpace = true;
      } else if (type === '=') {
        // Set the tags for the next time around.
        tagRes = escapeTags(tags = value.split(spaceRe));
      }
    }

    // Make sure there are no open sections when we're done.
    openSection = sections.pop();
    if (openSection) {
      throw new Error('Unclosed section "' + openSection[1] + '" at ' + scanner.pos);
    }

    return nestTokens(squashTokens(tokens));
  }

  /**
   * Combines the values of consecutive text tokens in the given `tokens` array
   * to a single token.
   */
  function squashTokens(tokens) {
    var squashedTokens = [];

    var token, lastToken;
    for (var i = 0, len = tokens.length; i < len; ++i) {
      token = tokens[i];

      if (token) {
        if (token[0] === 'text' && lastToken && lastToken[0] === 'text') {
          lastToken[1] += token[1];
          lastToken[3] = token[3];
        } else {
          squashedTokens.push(token);
          lastToken = token;
        }
      }
    }

    return squashedTokens;
  }

  /**
   * Forms the given array of `tokens` into a nested tree structure where
   * tokens that represent a section have two additional items: 1) an array of
   * all tokens that appear in that section and 2) the index in the original
   * template that represents the end of that section.
   */
  function nestTokens(tokens) {
    var nestedTokens = [];
    var collector = nestedTokens;
    var sections = [];

    var token, section;
    for (var i = 0, len = tokens.length; i < len; ++i) {
      token = tokens[i];

      switch (token[0]) {
      case '#':
      case '^':
        collector.push(token);
        sections.push(token);
        collector = token[4] = [];
        break;
      case '/':
        section = sections.pop();
        section[5] = token[2];
        collector = sections.length > 0 ? sections[sections.length - 1][4] : nestedTokens;
        break;
      default:
        collector.push(token);
      }
    }

    return nestedTokens;
  }

  /**
   * A simple string scanner that is used by the template parser to find
   * tokens in template strings.
   */
  function Scanner(string) {
    this.string = string;
    this.tail = string;
    this.pos = 0;
  }

  /**
   * Returns `true` if the tail is empty (end of string).
   */
  Scanner.prototype.eos = function () {
    return this.tail === "";
  };

  /**
   * Tries to match the given regular expression at the current position.
   * Returns the matched text if it can match, the empty string otherwise.
   */
  Scanner.prototype.scan = function (re) {
    var match = this.tail.match(re);

    if (match && match.index === 0) {
      var string = match[0];
      this.tail = this.tail.substring(string.length);
      this.pos += string.length;
      return string;
    }

    return "";
  };

  /**
   * Skips all text until the given regular expression can be matched. Returns
   * the skipped string, which is the entire tail if no match can be made.
   */
  Scanner.prototype.scanUntil = function (re) {
    var index = this.tail.search(re), match;

    switch (index) {
    case -1:
      match = this.tail;
      this.tail = "";
      break;
    case 0:
      match = "";
      break;
    default:
      match = this.tail.substring(0, index);
      this.tail = this.tail.substring(index);
    }

    this.pos += match.length;

    return match;
  };

  /**
   * Represents a rendering context by wrapping a view object and
   * maintaining a reference to the parent context.
   */
  function Context(view, parentContext) {
    this.view = view == null ? {} : view;
    this.cache = { '.': this.view };
    this.parent = parentContext;
  }

  /**
   * Creates a new context using the given view with this context
   * as the parent.
   */
  Context.prototype.push = function (view) {
    return new Context(view, this);
  };

  /**
   * Returns the value of the given name in this context, traversing
   * up the context hierarchy if the value is absent in this context's view.
   */
  Context.prototype.lookup = function (name) {
    var value;
    if (name in this.cache) {
      value = this.cache[name];
    } else {
      var context = this;

      while (context) {
        if (name.indexOf('.') > 0) {
          value = context.view;

          var names = name.split('.'), i = 0;
          while (value != null && i < names.length) {
            value = value[names[i++]];
          }
        } else {
          value = context.view[name];
        }

        if (value != null) break;

        context = context.parent;
      }

      this.cache[name] = value;
    }

    if (isFunction(value)) {
      value = value.call(this.view);
    }

    return value;
  };

  /**
   * A Writer knows how to take a stream of tokens and render them to a
   * string, given a context. It also maintains a cache of templates to
   * avoid the need to parse the same template twice.
   */
  function Writer() {
    this.cache = {};
  }

  /**
   * Clears all cached templates in this writer.
   */
  Writer.prototype.clearCache = function () {
    this.cache = {};
  };

  /**
   * Parses and caches the given `template` and returns the array of tokens
   * that is generated from the parse.
   */
  Writer.prototype.parse = function (template, tags) {
    var cache = this.cache;
    var tokens = cache[template];

    if (tokens == null) {
      tokens = cache[template] = parseTemplate(template, tags);
    }

    return tokens;
  };

  /**
   * High-level method that is used to render the given `template` with
   * the given `view`.
   *
   * The optional `partials` argument may be an object that contains the
   * names and templates of partials that are used in the template. It may
   * also be a function that is used to load partial templates on the fly
   * that takes a single argument: the name of the partial.
   */
  Writer.prototype.render = function (template, view, partials) {
    var tokens = this.parse(template);
    var context = (view instanceof Context) ? view : new Context(view);
    return this.renderTokens(tokens, context, partials, template);
  };

  /**
   * Low-level method that renders the given array of `tokens` using
   * the given `context` and `partials`.
   *
   * Note: The `originalTemplate` is only ever used to extract the portion
   * of the original template that was contained in a higher-order section.
   * If the template doesn't use higher-order sections, this argument may
   * be omitted.
   */
  Writer.prototype.renderTokens = function (tokens, context, partials, originalTemplate) {
    var buffer = '';

    // This function is used to render an arbitrary template
    // in the current context by higher-order sections.
    var self = this;
    function subRender(template) {
      return self.render(template, context, partials);
    }

    var token, value;
    for (var i = 0, len = tokens.length; i < len; ++i) {
      token = tokens[i];

      switch (token[0]) {
      case '#':
        value = context.lookup(token[1]);
        if (!value) continue;

        if (isArray(value)) {
          for (var j = 0, jlen = value.length; j < jlen; ++j) {
            buffer += this.renderTokens(token[4], context.push(value[j]), partials, originalTemplate);
          }
        } else if (typeof value === 'object' || typeof value === 'string') {
          buffer += this.renderTokens(token[4], context.push(value), partials, originalTemplate);
        } else if (isFunction(value)) {
          if (typeof originalTemplate !== 'string') {
            throw new Error('Cannot use higher-order sections without the original template');
          }

          // Extract the portion of the original template that the section contains.
          value = value.call(context.view, originalTemplate.slice(token[3], token[5]), subRender);

          if (value != null) buffer += value;
        } else {
          buffer += this.renderTokens(token[4], context, partials, originalTemplate);
        }

        break;
      case '^':
        value = context.lookup(token[1]);

        // Use JavaScript's definition of falsy. Include empty arrays.
        // See https://github.com/janl/mustache.js/issues/186
        if (!value || (isArray(value) && value.length === 0)) {
          buffer += this.renderTokens(token[4], context, partials, originalTemplate);
        }

        break;
      case '>':
        if (!partials) continue;
        value = isFunction(partials) ? partials(token[1]) : partials[token[1]];
        if (value != null) buffer += this.renderTokens(this.parse(value), context, partials, value);
        break;
      case '&':
        value = context.lookup(token[1]);
        if (value != null) buffer += value;
        break;
      case 'name':
        value = context.lookup(token[1]);
        if (value != null) buffer += mustache.escape(value);
        break;
      case 'text':
        buffer += token[1];
        break;
      }
    }

    return buffer;
  };

  mustache.name = "mustache.js";
  mustache.version = "0.8.1";
  mustache.tags = [ "{{", "}}" ];

  // All high-level mustache.* functions use this writer.
  var defaultWriter = new Writer();

  /**
   * Clears all cached templates in the default writer.
   */
  mustache.clearCache = function () {
    return defaultWriter.clearCache();
  };

  /**
   * Parses and caches the given template in the default writer and returns the
   * array of tokens it contains. Doing this ahead of time avoids the need to
   * parse templates on the fly as they are rendered.
   */
  mustache.parse = function (template, tags) {
    return defaultWriter.parse(template, tags);
  };

  /**
   * Renders the `template` with the given `view` and `partials` using the
   * default writer.
   */
  mustache.render = function (template, view, partials) {
    return defaultWriter.render(template, view, partials);
  };

  // This is here for backwards compatibility with 0.4.x.
  mustache.to_html = function (template, view, partials, send) {
    var result = mustache.render(template, view, partials);

    if (isFunction(send)) {
      send(result);
    } else {
      return result;
    }
  };

  // Export the escaping function so that the user may override it.
  // See https://github.com/janl/mustache.js/issues/244
  mustache.escape = escapeHtml;

  // Export these mainly for testing, but also for advanced usage.
  mustache.Scanner = Scanner;
  mustache.Context = Context;
  mustache.Writer = Writer;

}));

(function (_, $, window, gapiMockData, Mustache, document) {
  "use strict";

  /*global _,gapi,Mustache: false */

  var kvp = document.location.search.substr(1).split("&");
  var real = false;
  var i=kvp.length; var x; while(i--)
  {
      x = kvp[i].split("=");
      if (x[0]==="realGapi" && x[1])
      {
        real = true;
      }
  }

  if(real) {

    //mark as real GAPI (actual GAPI is loaded by common header)

    window.realGapiLoaded = true;
  }
  else {

    window.gapiLoadingStatus = "loaded"; //surpress the loading of real gapi
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

    var getCurrentUsername = function () {
      if(gapi.auth._token) {
        return fakeDb.tokenMap[gapi.auth._token.access_token];
      }
      else {
        return null;
      }
    };

    var getCurrentUser = function () {
      var currentUsername = getCurrentUsername();

      if(currentUsername) {
        return _.find(fakeDb.users, function (user) {
          return currentUsername === user.username;
        });
      }
      else {
        return null;
      }

    };

    var fakeDb;

    window.gapi.resetDb = function () {
      if(!window.gapi._fakeDb) {
        fakeDb = window.gapi._fakeDb = {serverDelay: 0};
      }
      fakeDb.companies = _.cloneDeep(gapiMockData.companies);
      fakeDb.accounts = _.cloneDeep(gapiMockData.accounts);
      fakeDb.oauthAccounts = _.cloneDeep(gapiMockData.oauthAccounts);

      fakeDb.users = _.cloneDeep(gapiMockData.users);
      fakeDb.systemMessages = _.cloneDeep(systemMessages);
      fakeDb.tokenMap = {};
    };

    window.gapi.resetUsers = function () {
      window.gapi._fakeDb.users = _.cloneDeep(gapiMockData.users);
    };

    window.gapi.resetAccounts = function () {
      fakeDb.accounts = _.cloneDeep(gapiMockData.accounts);
    };

    window.gapi.clearAccounts = function () {
      fakeDb.accounts = [];
    };

    window.gapi.resetCompanies = function () {
      window.gapi._fakeDb.companies = _.cloneDeep(gapiMockData.companies);
    };

    window.gapi.clearCompanies = function () {
      while(fakeDb.companies.length > 0) {
        fakeDb.companies.pop();
      }
    };

    window.gapi.clearUsers = function () {
      window.gapi._fakeDb.users = [];
    };

    window.gapi.resetSystemMessages = function () {
      window.gapi._fakeDb.systemMessages = _.cloneDeep(systemMessages);
    };

    window.gapi.clearSystemMessages = function () {
      window.gapi._fakeDb.systemMessages = [];
    };

    window.gapi.setPendingSignInUser = function (username) {
      window.gapi._pendingUser = username;
    };

    var resp = function (item) {
      var copyOfitem = _.cloneDeep(item);
      return {
        "result": {item: copyOfitem},
        "code": 200,
        "message": "OK",
        "item": copyOfitem,
        "etag": "\"MH7KOPL7ADNdruowVC6-7YuLjZw/-QiBW2KeCQy_zrNjQ2_iN6pdhkg\""
      };
    };

    var respList = function (items) {
      var copyOfItems = _.cloneDeep(items);
      return {
        "result": {items: copyOfItems},
        "code": 200,
        "message": "OK",
        "items": copyOfItems,
        "etag": "\"MH7KOPL7ADNdruowVC6-7YuLjZw/-QiBW2KeCQy_zrNjQ2_iN6pdhkg\""
      };
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

   if(localStorage.getItem("fakeGoogleDb")) {
     fakeDb = window.gapi._fakeDb = JSON.parse(localStorage.getItem("fakeGoogleDb"));
   }
   else {
     window.gapi.resetDb();
   }

    gapi.client = {
      load: function(path, version, cb) {
        delayed(cb);
      },
      rise: {
        account: {
          add: function () {
            return {
              execute: function (cb) {
                var username = getCurrentUsername();
                var existingAccount = _.findWhere(fakeDb.accounts, {username: username});
                if(!existingAccount) {
                  //200 success
                  fakeDb.accounts.push({
                    username: username,
                    changeDate: new Date().toISOString(),
                    changedBy: "bloosbrock@gmail.com"
                  });

                  var companyId = guid();
                  fakeDb.companies.push({
                    name: username + "'s Company'",
                    id: companyId,
                    changeDate: new Date().toISOString(),
                    changedBy: "bloosbrock@gmail.com"
                  });

                  var existingUser = _.findWhere(fakeDb.users, {username: username});
                  if(!existingUser) {
                    fakeDb.users.push({
                      username: username,
                      changeDate: new Date().toISOString(),
                      changedBy: "bloosbrock@gmail.com",
                      companyId: companyId
                    });
                  }

                  //200 success
                  delayed(cb, resp({}));
                }
                else {
                  delayed(cb, {
                   "error": {
                    "errors": [
                     {
                      "domain": "global",
                      "reason": "conflict",
                      "message": "User already has an account"
                     }
                    ],
                    "code": 409,
                    "message": "User already has an account"
                   }
                  });
                }
              }
            };
          },
          agreeToTerms: function () {
            return {
              execute: function (cb) {
                var username = getCurrentUsername();
                var user = _.findWhere(fakeDb.users, {username: username});
                if(!user.termsAcceptanceDate) {
                  user.termsAcceptanceDate = new Date().toISOString();
                  delayed(cb, resp({}));
                }
                else {
                  delayed(cb, {
                   "error": {
                    "errors": [
                     {
                      "domain": "global",
                      "reason": "conflict",
                      "message": "User has already accepted the terms"
                     }
                    ],
                    "code": 409,
                    "message": "User has already accepted the terms"
                   }
                 });
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
                obj = obj || {};
                if(gapi.auth._token) {
                  if(obj.id) {
                    company = _.findWhere(fakeDb.companies, obj);
                  }
                  else if (getCurrentUser().companyId){
                    company =
                    _.findWhere(fakeDb.companies, {id: getCurrentUser().companyId});
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
                      "item": _.extend(_.cloneDeep(gapiMockData.companyRespSkeleton), company),
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
          }
        }
      },
      core: {
        systemmessage: {
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
                obj = obj || {};
                if(gapi.auth._token) {
                  if(obj.id) {
                    company = _.findWhere(fakeDb.companies, obj);
                  }
                  else if (getCurrentUser().companyId){
                    company =
                    _.findWhere(fakeDb.companies, {id: getCurrentUser().companyId});
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
                      "item": _.extend(_.cloneDeep(gapiMockData.companyRespSkeleton), company),
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
         lookup: function (obj) {
           return {
             execute: function (cb) {
               var company;
               obj = obj || {};
               if(gapi.auth._token) {
                 if(obj.authKey) {
                   company = _.findWhere(fakeDb.companies, obj);
                 }
                 else if (getCurrentUser().companyId){
                   company =
                   _.findWhere(fakeDb.companies, {id: getCurrentUser().companyId});
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
                     "item": _.extend(_.cloneDeep(gapiMockData.companyRespSkeleton), company),
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
        move: function (obj) {
          return {
            execute: function (cb) {
              var company;
              obj = obj || {};
              if(gapi.auth._token) {
                if(obj.authKey) {
                  if(obj.id || obj.authKey) {
                    company = _.findWhere(window.gapi._fakeDb.companies, {authKey: obj.authKey});
                    company.parentId = getCurrentUser().companyId;
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
                      "item": _.extend(_.cloneDeep(gapiMockData.companyRespSkeleton), company),
                    "kind": "core#companyItem",
                    "etag": "\"MH7KOPL7ADNdruowVC6-7YuLjZw/B1RYG_QUBrbTcuW6r700m7wrgBU\""
                    });
                  }
                }
                else {
                  delayed(cb, {
                   "error": {
                    "errors": [
                     {
                      "domain": "global",
                      "reason": "required",
                      "message": "Required parameter: authKey",
                      "locationType": "parameter",
                      "location": "authKey"
                     }
                    ],
                    "code": 400,
                    "message": "Required parameter: authKey"
                   }
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
        add: function (fields) {
          return {
            execute: function (cb) {
              var company;
              company = _.cloneDeep(fields);
              company.id = guid();
              window.gapi._fakeDb.companies.push(company);
              console.log("company created", company);
              delayed(cb, {
                "result": true,
                "code": 200,
                "message": "OK",
                "item": company,
              "kind": "core#companyItem",
              "etag": "\"MH7KOPL7ADNdruowVC6-7YuLjZw/B1RYG_QUBrbTcuW6r700m7wrgBU\""
            });
            }
          };
        },
        update: function (obj) {
          return {
            execute: function (cb) {
              var company;
              if(obj.id) {
                company = _.find(window.gapi._fakeDb.companies, function (company) {
                  return company.id === obj.id;
                });
                _.extend(company, obj.data);
              }
              else {
                company = _.cloneDeep(obj.data);
                company.id = guid();
                window.gapi._fakeDb.companies.push(company);
              }
              console.log("company created", company);
              delayed(cb, {
                "result": true,
                "code": 200,
                "message": "OK",
                "item": company,
              "kind": "core#companyItem",
              "etag": "\"MH7KOPL7ADNdruowVC6-7YuLjZw/B1RYG_QUBrbTcuW6r700m7wrgBU\""
            });
            }
          };
        },
        list: function (opt) {
          opt = _.extend({count: 20, cursor: 0}, opt);
          return {
            execute: function (cb) {
              var currentUser = getCurrentUser();
              var parentCompany = _.findWhere(window.gapi._fakeDb.companies, {id: currentUser.companyId});
              var subcompanies = _.where(window.gapi._fakeDb.companies, {parentId: currentUser.companyId});
              var companies = [parentCompany].concat(subcompanies);
              if(opt.search) {
                companies = _.filter(window.gapi._fakeDb.companies,
                  function (company) {
                    return company.name.toLowerCase().indexOf(opt.search.toLowerCase()) >= 0;
                  });
              }

              if(opt.cursor) {
                companies = companies.slice(opt.cursor);
              }
              if(opt.count) {
                companies = companies.slice(0, opt.count);
              }

              return delayed(cb, {
               "result": true,
               "code": 200,
               "message": "OK",
               "cursor": 0,
               "items": companies,
               "kind": "core#company",
               "etag": "\"MH7KOPL7ADNdruowVC6-7YuLjZw/aU3KWpXBGvssoqWVjsHR5ngSZlU\""
              });
            }
          };
        }
      },
      user: {
        get: function (obj) {
          return {
            execute: function (cb) {
              obj = obj || {};
              if(gapi.auth._token){
                var user;
                if(obj.username) {
                  user = _.findWhere(fakeDb.users, {username: obj.username});
                }
                else {
                  user =  getCurrentUser();
                }
                if(user) {
                  delayed(cb, resp(user));
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
              if (!obj) {obj = {}; }
              var user;
              if (obj.username) {
                user = _.find(fakeDb.users,
                  function (u) {return obj.username === u.username; });
              }
              else {
                user = getCurrentUser();
              }
              if (user) {
                _.extend(user, JSON.parse(obj.data));
                delayed(cb, resp(user));
              }
              else {
                delayed(cb, {
                  "result": false,
                  "code": 404,
                  "message": "NOT FOUND"
                });
              }
            }
          };
        },
        delete: function (obj) {
          return {
            execute: function (cb) {
              if(!obj || !obj.username) {
                delayed(cb, {
                 "error": {
                  "errors": [
                   {
                    "domain": "global",
                    "reason": "required",
                    "message": "Required parameter: username",
                    "locationType": "parameter",
                    "location": "username"
                   }
                  ],
                  "code": 400,
                  "message": "Required parameter: username"
                 }
                });
              }
              else{
                var user = _.findWhere(fakeDb.users, {username: obj.username});
                if(!user) {
                  delayed(cb, {
                   "error": {
                    "errors": [
                     {
                      "domain": "global",
                      "reason": "notFound",
                      "message": "User not found."
                     }
                    ],
                    "code": 404,
                    "message": "User not found."
                   }
                 });
                }
                else {
                  fakeDb.users = _.without(fakeDb.users, user);
                  delayed(cb, resp({}));
                }
              }
            }
          };
        },
        add: function (obj) {
          return {
            execute: function (cb) {
              if(obj && obj.username || obj.companyId) {
                var existingUser = _.findWhere(fakeDb.users, {username: obj.username});
                if(existingUser) {
                  delayed(cb, {
                    "result": false,
                    "code": 400,
                    "message": "USER ALREADY EXISTS"
                  });
                }
                else {
                  var user = _.extend({
                    username: obj.username,
                    companyId: obj.companyId
                  }, JSON.parse(obj.data));
                  fakeDb.users.push(user);
                  delayed(cb, resp(user));
                }
              }
              else {
                delayed(cb, {
                  "result": false,
                  "code": 400,
                  "message": "USERNAME OR COMPANY ID MISSING"
                });
              }
            }
          };
        },
        list: function (obj) {
          return {
            execute: function (cb) {
              if(!obj) {obj = {}; }
              var users = fakeDb.users;
              if(obj.companyId) {
                users = _.where(users, {companyId: obj.companyId});
              }
              if(obj.search) {
                users = _.filter(users,
                  function (user) {
                    return (user.firstName || "").toLowerCase().indexOf(obj.search.toLowerCase()) >= 0 ||
                    (user.lastName || "").toLowerCase().indexOf(obj.search.toLowerCase()) >= 0 ||
                    user.email.toLowerCase().indexOf(obj.search.toLowerCase()) >= 0;
                  });
              }
              if(obj.count) {
                users = users.slice(0, obj.count);
              }
              delayed(cb, respList(users));
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
                var username = getCurrentUsername();
                var oauthAccount = _.findWhere(fakeDb.oauthAccounts, {email: username});
                delayed(cb, oauthAccount);
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

  var googleAuthDialogTemplate = "<div class=\"modal\">" +
    "<div class=\"modal-dialog\">" +
    "  <div class=\"modal-content\">" +
    "    <div class=\"modal-header\">" +
    "      <button type=\"button\" class=\"close\" data-dismiss=\"modal\">" +
    "<span aria-hidden=\"true\">&times;</span><span class=\"sr-only\">Close</span></button>" +
    "      <h4 class=\"modal-title\">Fake Google Cloud Login</h4>" +
    "    </div>" +
    "    <div class=\"modal-body\">" + "<p>Click one to Sign In, or cancel.</p>" +
    "<ul>{{#accounts}}" + "<li><img src=\"{{picture}}\" style=\"width: 30px; height: 30px; \" />" +
    "<button class=\"login-account-button\" data-username=\"{{email}}\">{{email}}</button></li>" + "{{/accounts}}</ul>" +
    "    </div>" +
    "    <div class=\"modal-footer\">" +
    "      <button type=\"button\" class=\"btn btn-default\" data-dismiss=\"modal\">Cancel</button>" +
    "    </div>" +
    "  </div>" +
    "</div>" +
    "</div>";

  gapi.auth = {
    authorize: function(options, cb) {
      options = options || {};

      var generateToken = function (username) {
        var accessToken = guid();

        //clear existing token from db
        var existingToken;
        _.each(fakeDb.tokenMap, function (v, k) {if (v === username) {existingToken = k; }});
        if(existingToken) {
          delete fakeDb.tokenMap[existingToken];
        }

        fakeDb.tokenMap[accessToken] = username;
        return {
          "state": "",
          "access_token": accessToken,
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
            "google_logged_in": true,
            "signed_in": true,
            "method": "PROMPT"
          }
        };
      };

      if(!options.immediate) {
        var modalStr = Mustache.render(googleAuthDialogTemplate, {accounts: fakeDb.oauthAccounts});

        var tokenResult;

          var signInAs = function (username, next) {
            tokenResult = generateToken(username);
            next(function () {
              if(!tokenResult) {
                delayed(cb, {error: "User cancelled login."});
              }
              else {
                delayed(cb, tokenResult);
              }
            });
          };

          if(window.gapi._pendingUser) {
            signInAs(window.gapi._pendingUser, function(cb1) {
              cb1();
            });
            delete window.gapi._pendingUser;
          }
          else {
            var modal = $(modalStr).modal({
              show: false, backdrop: "static"});
            var returnResultCb;
            modal.find(".login-account-button").on("click", function (e) {
              var username = $(e.target).data("username");
              signInAs(username, function (fn) {
                returnResultCb = fn;
              });

              modal.modal("hide");
            });
            modal.on("hidden.bs.modal", function () {
              //destroy modal
              $(this).data("bs.modal", null);
              modal.remove();
              returnResultCb();
            });
            modal.modal("show");
          }


      }
      else {
        delayed(cb, gapi.auth._token);
      }
    },
    signOut: function (cb) {
      this.setToken(null);
      if(cb) {
        delayed(cb);
      }
    },
    setToken: function (token) {
      gapi.auth._token = token;
    },
    getToken: function () {
      delete gapi.auth._token;
    }
  };

  window.handleClientJSLoad();
  }


})(_, $, window, window.gapiMockData, Mustache, document);
