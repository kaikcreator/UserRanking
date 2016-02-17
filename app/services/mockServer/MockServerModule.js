/* questionable trick to prevent $resource to return an empty object when using userService.load at bootstrap*/
angular.module('userRanking.usersModule')
    .decorator('usersService', ['$delegate', '$timeout', function($delegate, $timeout){
        var originalGetMethod = angular.copy($delegate.get);
        $delegate.get = function(){
            $timeout(function(){
                originalGetMethod();
            },100);
        };
        
        return $delegate;
}]);


angular.module('userRanking.mockServerModule', ['ngMockE2E', 'ngResource', 'userRanking.urlsModule'])

    .constant('fixturePaths', {
    "users": "fixtures/users.json"
})


    .run(['$httpBackend', 'urls', 'fixturePaths', '$resource', function($httpBackend, urls, fixturePaths, $resource){


        /* local calls */
        $httpBackend.whenGET(/fixtures\/.*/).passThrough();

        var regexFromUrlWithPlaceholders = function(url){
            for(var key in urls.usersplaceholders){
                url = url.replace(urls.usersplaceholders[key], '.*');
            }
            return new RegExp(url);
        };
        

        /*mocked data*/
        var usersResource = $resource(fixturePaths.users).query();
        $httpBackend.whenGET(urls.users).respond(function(method, url, data, headers){
            return [200, usersResource];
        });



        /* PROBABLY THIS ONE IS NOT NEEDED */
        $httpBackend.whenGET(regexFromUrlWithPlaceholders(urls.user))
            .respond([200, {
                "id":       "6",
                "name":     "Travis",
                "image": 	"user6.png",
                "points":   100
            }]);
        /* PROBABLY THIS ONE IS NOT NEEDED */



        $httpBackend.whenPUT(regexFromUrlWithPlaceholders(urls.user)).respond(
            function(method, url, data, headers){
                if(headers['Authorization'] === null || angular.isUndefined(headers['Authorization'])){
                    return [401, null, null];
                }
                else if(data.id === undefined && data.name === undefined && data.points === undefined && data.image ===undefined){
                    return [400, null, null];
                }
                else{
                    return [200, data, {}];
                }
            });


        $httpBackend.whenPOST(regexFromUrlWithPlaceholders(urls.user)).respond(
            function(method, url, data, headers){
                if(headers['Authorization'] === null || angular.isUndefined(headers['Authorization'])){
                    return [401, null, null];
                }
                else if(data.id === undefined || data.name === undefined){
                    return [400, null, null];
                }
                else{
                    return [200, data, {}];
                }
            });

    }])