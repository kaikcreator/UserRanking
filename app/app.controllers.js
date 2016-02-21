'use strict';

// Declare app level module which depends on views, and components
angular.module('userRanking')

.controller('MainCtrl', ['$scope', '$timeout', 'urls', 'usersService', function($scope, $timeout, urls, usersService){
    $scope.user = null;
    
    $scope.inputs = {};
    $scope.inputs.username = '';
    
    $scope.addUser = function(){
        usersService.newUser($scope.inputs.username)
            .then(
            function(response){
                $scope.user = usersService.user;
                $scope.inputs.username = '';
                //update users list
                usersService.get();
            },
            function(error){
                $scope.inputs.error = "Some error happened while trying to create user";
                $timeout(function(){$scope.inputs.error = null}, 2000);
                $scope.user = null;
            }
        );
    };
    
    $scope.increaseScore = function(){
        usersService.updateUserScore($scope.user.data.points + 20)
        .then(
            function(response){
                usersService.get();
            },
            function(error){
                console.log(error);
            }
        );
    };
    
    $scope.decreaseScore = function(){
        usersService.updateUserScore($scope.user.data.points - 20)
        .then(
            function(response){
                usersService.get();
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