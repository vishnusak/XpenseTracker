// The routes file has to be the first in the list of angular js files added in the html because this is where I am creating the angular 'app' object. All other elements (factory, controllers etc) are defined on the app object.

// Create the angular app and add 'ngRoute' as a dependency
var app = angular.module('XTapp', ['ngRoute'])

// Configure the routes that the app will handle using 'routeProvider'.
// Also include '$locationProvider' in dependencies. It will be used to prettify the angular urls by removing the '#' at the end. For this prettifying, we should also add a '<base href="/">' tag to the index.html inside the '<head>'
app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){
  $routeProvider
  .when('/',{
    templateUrl: '/landing.html',
    controller : 'landingController'
  })
  .when('/start',{
    templateUrl: '/start.html',
    controller : 'startController'
  })
  .when('/profile', {
    templateUrl: '/profile.html',
    controller : 'profileController'
  })
  .when('/resetPwd', {
    templateUrl: '/pwdreset.html',
    controller : 'resetPwdController'
  })
  .when('/sheet', {
    templateUrl: '/expenses.html',
    controller : 'expenseController'
  })
  .otherwise({
    templateUrl: '/placeholder.html'
  })

  $locationProvider.html5Mode(true)
}])
