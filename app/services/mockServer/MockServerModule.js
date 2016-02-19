angular.module('userRanking.mockServerModule', ['ngMockE2E', 'ngResource', 'userRanking.urlsModule'])

/* questionable trick to prevent $resource to return an empty object when using userService.load at bootstrap*/
    .decorator('usersService', ['$delegate', '$timeout', function($delegate, $timeout){
        var originalGetMethod = angular.copy($delegate.get);
        $delegate.get = function(){
            $timeout(function(){
                originalGetMethod();
            },100);
        };

        return $delegate;
    }])    


    .constant('fixturePaths', {
    "users": "fixtures/users.json"
})


    .run(['$httpBackend', 'urls', 'fixturePaths', '$resource', function($httpBackend, urls, fixturePaths, $resource){


        /* local calls */
        $httpBackend.whenGET(/fixtures\/.*/).passThrough();

        /* regex allowing any user id in user url*/
        var anyUserUrl = new RegExp(urls.user('.*'));


        /*mocked users list*/
        var usersResource = $resource(fixturePaths.users).query();
        $httpBackend.whenGET(urls.users).respond(function(method, url, data, headers){
            return [200, usersResource];
        });


        /* mock update user*/
        $httpBackend.whenPUT(anyUserUrl).respond(
            function(method, url, data, headers){
                data = angular.fromJson(data);
                if(headers['Authorization'] !== "Token 1234567890asdfghjklzxcvbnm"){
                    return [401, null, null];
                }
                else if(data.name === undefined && data.points === undefined && data.image ===undefined){
                    return [400, null, null];
                }
                else{
                    return [200, data, {}];
                }
            });


        /* mock new user*/
        $httpBackend.whenPOST(anyUserUrl).respond(
            function(method, url, data, headers){
                data = angular.fromJson(data);
                if(data.name === undefined || !angular.isString(data.name) || data.name.length === 0){
                    return [400, null, null];
                }
                else{
                    var user =     {
                        "id":       "7",
                        "name":     data.name,
                        "points":   0
                    };
                    return [200, user, {Authorization: "1234567890asdfghjklzxcvbnm"}];
                }
            });

    }])