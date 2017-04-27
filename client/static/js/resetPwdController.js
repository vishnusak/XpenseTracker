// This controller is to handle the reset password page, along with the nav bar

// create the controller on the angular "app" module created in the "routes" file
// Dependencies:
// $scope - for data binding
// $location - for path/route manipulation
// XTFactory - factory module for the site
app.controller('resetPwdController',['$scope', '$location', 'XTFactory', function($scope, $location, XTFactory){
  // initialise the $scope variables
  $scope.userDropdown   = {'display': 'none'}
  $scope.curUser        = {}
  $scope.user           = ''
  $scope.reset          = {
    curPwd : '',
    newPwd : '',
    cnewPwd: ''
  }
  $scope.err            = {
    curPwd : false,
    newPwd : false,
    cnewPwd: false
  }

  $scope.resetErr       = ''

  // get the current user details
  if (!XTFactory.isUserSignedIn()){
    $location.url('/')
  } else {
    $scope.curUser = XTFactory.getCurrentUser()
    $scope.user    = $scope.curUser['user']
  }

  function resetErr(){
    $scope.err['curPwd'] = false
    $scope.err['newPwd'] = false
    $scope.err['cnewPwd']= false

    $scope.resetErr     = ''
  }

  function validateReset(form){
    resetErr()

    let msg                = false
    if (!form['curPwd']){
      msg                  = true
      $scope.err['curPwd'] = true
    }

    if (!form['newPwd']){
      msg                  = true
      $scope.err['newPwd'] = true
    }

    if (!form['cnewPwd']){
      msg                  = true
      $scope.err['cnewPwd']= true
    }

    if (msg){
      $scope.resetErr = `The marked fields are required`
      return false
    }

    if (form['curPwd'] == form['newPwd']){
      $scope.resetErr = `New password same as current password`
      $scope.err['curPwd'] = true
      $scope.err['newPwd'] = true
      return false
    }

    if (form['newPwd'] != form['cnewPwd']){
      $scope.resetErr = `New password and confirmation do not match`
      $scope.err['newPwd'] = true
      $scope.err['cnewPwd']= true
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

  // reset the password
  $scope.resetPassword = function(){
    if (validateReset($scope.reset)){
      XTFactory.updateUser('password', $scope.curUser['user_id'], $scope.reset, function(updatedUser){
        if ('error' in updatedUser){
          $scope.resetErr = updatedUser['error']
        } else {
          $location.url('/')
        }
      })
    }
  }

  // close reset pwd screen
  $scope.closeResetPwd = function(){
    $location.url('/')
  }
}])
