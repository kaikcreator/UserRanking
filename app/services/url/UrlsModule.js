angular.module('userRanking.urlsModule', [])

.constant('urlConst', (function(){
    var protocol = 'http://';
    var domain = 'www.userRanking.com';
    var base = '/api';
    var version = '/v1';
    var placeholders = {
        userId: '[userId]'
    }
    
    return {
        user:   protocol + domain + base + version + '/user/' + placeholders.userId,
        users:  protocol + domain + base + version + '/users',
        placeholders: placeholders
    };

})())


.factory('urls', ['urlConst', function(urlConst){
    var urls = angular.copy(urlConst);
    
    var replacePlaceholders = function(url, placeholders){
        for(var key in placeholders){
            url = url.replace(urlConst.placeholders[key], placeholders[key]);
        }
        return url;
    };
    
    
    //generate dinamic urls here    
    urls.user = function(id){
        return replacePlaceholders(urlConst.user, {userId: id});
    };
    
    //urls.users = 'fixtures/users.json'
    
    
    return urls;
}]);