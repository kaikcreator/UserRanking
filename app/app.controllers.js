'use strict';

// Declare app level module which depends on views, and components
angular.module('userRanking')

.controller('MainCtrl', ['$scope', 'urls', 'usersService', function($scope, urls, usersService){
    $scope.user = null;
    
    $scope.addUser = function(){
        usersService.newUser("New user name")
            .then(
            function(response){
                $scope.user = usersService.user;
            },
            function(error){
                console.log(error);
                $scope.user = null;
            }
        );
    };
    
    $scope.increaseScore = function(){
        usersService.updateUserScore($scope.user.data.points + 100)
        .then(
            function(response){
            },
            function(error){
                console.log(error);
            }
        );
    };
    
    $scope.decreaseScore = function(){
        usersService.updateUserScore($scope.user.data.points - 100)
        .then(
            function(response){
            },
            function(error){
                console.log(error);
            }
        );
    };
    
    $scope.forgetUser = function(){
        $scope.user = null;
    }
    
    
    usersService.get();
    $scope.users = usersService.users;
    
}])