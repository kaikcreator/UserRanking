'use strict';

// Declare app level module which depends on views, and components
angular.module('userRanking')

.controller('MainCtrl', ['$scope', 'urls', 'usersService', function($scope, urls, usersService){
    
    $scope.click = function(){
        console.log(urls.user(15));
    };
    
    usersService.get();
    $scope.users = usersService.users;
    
}])