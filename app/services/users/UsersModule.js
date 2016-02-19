angular.module('userRanking.usersModule', ['userRanking.urlsModule'])


    .factory('usersService', ['$q', '$http', 'urls', function($q, $http, urls){
        var service = {};

        service.users = {};
        service.user = {};



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


        service.newUser = function(username){
            var deferred = $q.defer();

            var req = {
                method: 'POST',
                url:urls.user(''),
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    "name": username
                },
            };

            $http(req)
                .then(
                function(response){
                    service.user.token = response.headers('Authorization');
                    service.user.data = response.data;
                    deferred.resolve(service.user);
                },
                function(error){
                    console.log("Some error occured");
                    deferred.reject(error);
                });

            return deferred.promise;
        };


        service.updateUserScore = function(points){
            var deferred = $q.defer();

            var req = {
                method: 'PUT',
                url:urls.user(service.user.data.id),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Token ' +  service.user.token
                },
                data: {
                    'points': points
                },
            };

            $http(req)
                .then(
                function(response){
                    service.user.data = response.data;
                    deferred.resolve(service.user);
                },
                function(error){
                    console.log("Some error occured");
                    deferred.reject(error);
                });

            return deferred.promise;
        };        


        return service;
    }]);