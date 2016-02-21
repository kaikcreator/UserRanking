angular.module('userRanking.mockServerModule', ['ngMockE2E', 'ngResource', 'userRanking.urlsModule'])

/* questionable trick to prevent $resource to return an empty object when using userService.load at bootstrap*/
    .decorator('usersService', ['$delegate', '$timeout', function($delegate, $timeout){
        var originalGetMethod = angular.copy($delegate.get);
        $delegate.get = function(){
            $timeout(function(){
                originalGetMethod();
            },300);
        };

        return $delegate;
    }])    


    .constant('fixturePaths', {
    "users": "app/fixtures/users.json"
})

    .constant('lsMock', {
    "users": "ls-cached-users"
})


    .factory('mockedUsers', ['$window', '$resource', 'fixturePaths', 'lsMock', function($window, $resource, fixturePaths, lsMock){

        var service = {};

        /* get users from local storage */       
        service.list = angular.fromJson($window.localStorage[lsMock.users]);

        /* if nothing in LS, initialize from fixtures*/
        if(!service.list || service.list.length === 0){
            service.list = $resource(fixturePaths.users).query();
        }        

        service.save = function(){
            $window.localStorage[lsMock.users] = angular.toJson(service.list);
        };

        service.add = function(user){
            service.list.push(user);
            service.save();
        };

        service.update = function(user){
            for(var i=0; i<service.list.length; i++){
                //if user is found, update it
                if(service.list[i].id == user.id){
                    service.list[i].points = user.points;
                    service.save();
                    return;
                }
            }
        };

        service.getById = function(userId){
            for(var i=0; i<service.list.length; i++){
                if(service.list[i].id == userId){
                    return service.list[i];
                }
            }
            return null;            
        };


        return service;

    }])


    .run(['$httpBackend', '$resource', 'urls', 'mockedUsers', function($httpBackend, $resource, urls, mockedUsers){


        /* local calls */
        $httpBackend.whenGET(/fixtures\/.*/).passThrough();

        /* regex allowing any user id in user url*/
        var anyUserUrl = new RegExp(urls.user('.*'));


        /*mocked users list*/
        $httpBackend.whenGET(urls.users).respond(function(method, url, data, headers){
            return [200, mockedUsers.list];
        });


        /* mock update user*/
        $httpBackend.whenPUT(anyUserUrl).respond(
            function(method, url, data, headers){
                var userId = url.replace(urls.user(''), '');
                data = angular.fromJson(data);
                if(!data.id)
                    data.id = userId;
                if(headers['Authorization'] !== "Token 1234567890asdfghjklzxcvbnm"){
                    return [401, null, null];
                }
                else if(data.name === undefined && data.points === undefined && data.image ===undefined){
                    return [400, null, null];
                }
                else{
                    mockedUsers.update(data);
                    data = mockedUsers.getById(userId);
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
                        "id":       ''+ mockedUsers.list.length,
                        "name":     data.name,
                        "points":   0
                    };
                    mockedUsers.add(user);


                    return [200, user, {Authorization: "1234567890asdfghjklzxcvbnm"}];
                }
            });

    }])