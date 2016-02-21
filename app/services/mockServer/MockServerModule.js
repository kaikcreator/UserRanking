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

    .constant('lsMock', {
    "users": "ls-cached-users",
    "user": "ls-cached-user",
})


    .run(['$httpBackend', '$resource', '$window', 'urls', 'fixturePaths', 'lsMock', function($httpBackend, $resource, $window, urls, fixturePaths, lsMock){


        /* users object*/
        var cachedUsers = angular.fromJson($window.localStorage[lsMock.users]);
        
        var updateCacheAndGetUser = function(user){
            for(var i=0; i<cachedUsers.length; i++){
                //if user is found, update it and return
                if(cachedUsers[i].id == user.id){
                    cachedUsers[i].points = user.points;
                    return cachedUsers[i];
                }
            }
            //otherwise push user
            cachedUsers.push(user);
            return user;
        };
        
        var saveCachedUsers = function(){
            $window.localStorage[lsMock.users] = angular.toJson(cachedUsers);
        }
        

        /* local calls */
        $httpBackend.whenGET(/fixtures\/.*/).passThrough();

        /* regex allowing any user id in user url*/
        var anyUserUrl = new RegExp(urls.user('.*'));


        /*mocked users list*/
        var usersResource = $resource(fixturePaths.users).query();
        $httpBackend.whenGET(urls.users).respond(function(method, url, data, headers){
            if(!cachedUsers || cachedUsers.length === 0){
                cachedUsers = usersResource;
                saveCachedUsers();
            }
                return [200, cachedUsers];
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
                    data = updateCacheAndGetUser(data);
                    saveCachedUsers();
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
                        "id":       ''+ cachedUsers.length,
                        "name":     data.name,
                        "points":   0
                    };
                    user = updateCacheAndGetUser(user);
                    saveCachedUsers();
                    
                    return [200, user, {Authorization: "1234567890asdfghjklzxcvbnm"}];
                }
            });

    }])