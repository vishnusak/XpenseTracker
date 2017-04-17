// This controller is to handle the profile page, along with the nav bar

// create the controller on the angular "app" module created in the "routes" file
// Dependencies:
// $scope - for data binding
// $location - for path/route manipulation
// XTFactory - factory module for the site
app.controller('profileController',['$scope', '$location', 'XTFactory', function($scope, $location, XTFactory){
  // initialise the $scope variables
  $scope.userDropdown = {'display': 'none'}
  $scope.user      = ''
  $scope.firstName = ''
  $scope.lastName  = ''
  $scope.email     = ''
  $scope.userName  = ''
  $scope.toggleEditSave = true
  $scope.readOnly  = true

  // Populate the username in the nav bar and the profile information
  if (!XTFactory.isUserSignedIn()){
    $location.url('/')
  } else {
    $scope.user      = XTFactory.getCurrentUser()['user']
    $scope.firstName = XTFactory.getCurrentUser()['firstName']
    $scope.lastName  = XTFactory.getCurrentUser()['lastName']
    $scope.email     = XTFactory.getCurrentUser()['email']
    $scope.userName  = XTFactory.getCurrentUser()['user']
  }

  // controller methods
  // Home
  $scope.goHome = function(event){
    event.stopImmediatePropagation()
    $location.url('/')
  }

  // Toggle the dropdown from user name
  $scope.toggleDropdown = function(event, close = null){
    // since I am using nested ng-click events, am capturing the click event and stopping propagation so that the nested ng-click events dont get triggered automatically.
    event.stopImmediatePropagation()

    // Toggle the display of the user dropdown
    $scope.userDropdown['display'] = (($scope.userDropdown['display'] == 'none') ? 'flex' : 'none')

    // If the click event is from anywhere else on the page, make sure that the user dropdown is closed.
    if (close){
      $scope.userDropdown['display'] = 'none'
    }
  }

  // my Profile
  $scope.showProfile = function(event){
    event.stopImmediatePropagation()
    $location.url('/profile')
  }

  // Reset password
  $scope.resetPwd = function(event){
    event.stopImmediatePropagation()
    $location.url('/resetPwd')
  }

  // Signout
  $scope.signOut = function(event){
    event.stopImmediatePropagation()
    XTFactory.signOut()
    $location.url('/')
  }

  // edit profile
  $scope.editProfile = function(){
    $scope.toggleEditSave = false
    $scope.readOnly       = false
  }
}])
