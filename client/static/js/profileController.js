// This controller is to handle the profile page, along with the nav bar

// create the controller on the angular "app" module created in the "routes" file
// Dependencies:
// $scope - for data binding
// $location - for path/route manipulation
// XTFactory - factory module for the site
app.controller('profileController',['$scope', '$location', 'XTFactory', function($scope, $location, XTFactory){
  // initialise the $scope variables
  $scope.userDropdown   = {'display': 'none'}
  $scope.curUser        = {}
  $scope.user           = ''
  $scope.profile        = {
    firstName: '',
    lastName : '',
    email    : '',
    userName : ''
  }
  $scope.err            = {
    firstName: false,
    lastName : false,
    email    : false,
    userName : false
  }

  $scope.profileErr     = ''
  $scope.readOnlyClass  = 'readonly'
  $scope.formEditClass  = ''
  $scope.toggleEditSave = true
  $scope.readOnly       = true

  // get the current user details
  if (!XTFactory.isUserSignedIn()){
    $location.url('/')
  } else {
    $scope.curUser = XTFactory.getCurrentUser()
    $scope.user    = $scope.curUser['user']
    // Populate the profile information
    $scope.profile['firstName'] = $scope.curUser['firstName']
    $scope.profile['lastName']  = $scope.curUser['lastName']
    $scope.profile['email']     = $scope.curUser['email']
    $scope.profile['userName']  = $scope.curUser['user']
  }

  function resetErr(){
    $scope.err['firstName'] = false
    $scope.err['lastName']  = false
    $scope.err['email']     = false
    $scope.err['userName']  = false

    $scope.profileErr     = ''
  }

  function validateProfile(profile){
    resetErr()

    if ((profile['firstName'] == $scope.curUser['firstName']) && (profile['lastName']  == $scope.curUser['lastName']) && (profile['email']     == $scope.curUser['email']) && (profile['userName']  == $scope.curUser['user'])){
      $scope.profileErr = `No change in information. Nothing to Save`
      return false
    }

    let msg                    = false
    if (!profile['userName']){
      msg                      = true
      $scope.err['userName']   = true
    }

    if (!profile['firstName']){
      msg                      = true
      $scope.err['firstName']  = true
    }

    if (!profile['lastName']){
      msg                      = true
      $scope.err['lastName']   = true
    }

    if (!profile['email']){
      msg                      = true
      $scope.err['email']      = true
    }

    if (msg){
      $scope.profileErr = `The marked fields are required`
      return false
    }

    return true
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
    $scope.readOnlyClass  = ''
    $scope.formEditClass  = 'formedit'
  }

  // save profile
  $scope.saveProfile = function(){
    if (validateProfile($scope.profile)){
      XTFactory.updateUser('profile', $scope.curUser['user_id'], $scope.profile, function(updatedUser){
        if ('error' in updatedUser){
          $scope.profileErr = updatedUser['error']
        } else {
          let curUserUpdated = {
            user_id  : $scope.curUser['user_id'],
            userName : $scope.profile['userName'],
            email    : $scope.profile['email'],
            firstName: $scope.profile['firstName'],
            lastName : $scope.profile['lastName']
          }
          XTFactory.setCurrentUser(curUserUpdated)
          $location.url('/')
        }
      })
    }
  }

  // close profile
  $scope.closeProfile = function(){
    $location.url('/')
  }
}])
