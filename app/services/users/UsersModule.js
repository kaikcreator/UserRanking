angular.module('userRanking.usersModule', ['userRanking.urlsModule'])


    .factory('usersService', ['$http', 'urls', function($http, urls){
        var service = {};

        service.users = {};



        service.get = function(){
            $http.get(urls.users, {}).then(
                function(response){
                    service.users.list = response.data;
                },
                function(error){
                    console.log(error);
                }
            );
        };


        return service;
    }]);