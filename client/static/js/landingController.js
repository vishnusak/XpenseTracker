// this controller is to handle the landing page. Since the landing page has the SignIN/SignUp screens, this will mainly handle those duties.

// create the controller on the angular "app" module created in the "routes" file
// Dependencies:
// $scope - for data binding
// $location - for path/route manipulation
// XTFactory - factory module for the site
app.controller('landingController', ['$scope', '$location', 'XTFactory', function($scope, $location, XTFactory){
  if (XTFactory.isUserSignedIn()){ $location.url('/start')}

  // scope fields for binding the data from login/registration screens
  $scope.login    = {
    userName: '',
    password: ''
  }
  $scope.register = {
    firstName: '',
    lastName : '',
    email    : '',
    userName : '',
    password : '',
    cpassword: ''
  }

  // scope fields for controlling the visibility of login/registration screens via ng-style
  $scope.displayLogin    = {display: 'none'}
  $scope.displayRegister = {display: 'none'}

  // scope error fields
  $scope.register['err'] = ''
  $scope.login['err']    = ''
  $scope.err             = {
    userName : false,
    password : false,
    firstName: false,
    lastName : false,
    email    : false,
    cpassword: false
  }

  // reset form fields
  function resetForms(){
    $scope.login['userName']          = ''
    $scope.login['password']          = ''
    $scope.register['firstName']      = ''
    $scope.register['lastName']       = ''
    $scope.register['email']          = ''
    $scope.register['userName']       = ''
    $scope.register['password']       = ''
    $scope.register['cpassword']      = ''
    $scope.displayLogin['display']    = 'none'
    $scope.displayRegister['display'] = 'none'
    resetErr()
  }

  // reset just the errors
  function resetErr(){
    $scope.register['err'] = ''
    $scope.login['err']    = ''
    $scope.err['userName'] = false
    $scope.err['password'] = false
    $scope.err['firstName']= false
    $scope.err['lastName'] = false
    $scope.err['email']    = false
    $scope.err['cpassword']= false
  }

  // validate the form inputs
  function validateForm(form){
    resetErr()
    let msg                    = false
    if ('userName' in form){
      if (!form['userName']){
        msg                    = true
        $scope.err['userName'] = true
      }
    }

    if ('firstName' in form){
      if (!form['firstName']){
        msg                    = true
        $scope.err['firstName']= true
      }
    }

    if ('lastName' in form){
      if (!form['lastName']){
        msg                    = true
        $scope.err['lastName'] = true
      }
    }

    if ('email' in form){
      if (!form['email']){
        msg                    = true
        $scope.err['email']    = true
      }
    }

    if ('password' in form){
      if (!form['password']){
        msg                    = true
        $scope.err['password'] = true
      }
    }

    if ('cpassword' in form){
      if (!form['cpassword']){
        msg                    = true
        $scope.err['cpassword']= true
      }
    }

    if (msg){
      form['err'] = `The marked fields are required`
      return false
    }

    if (('password' in form) && ('cpassword' in form)){
      if (form['password'] != form['cpassword']){
        msg                    = true
        $scope.err['password'] = true
        $scope.err['cpassword']= true
        form['err']            = `Password and Confirmation do not match`
        return false
      }
    }

    return true
  }

  // controller methods
  // display the login screen
  $scope.showLogin = function(){
    resetForms()
    $scope.displayLogin['display']    = 'flex'
    $scope.displayRegister['display'] = 'none'
  }

  // display the registration screen
  $scope.showRegister = function(){
    resetForms()
    $scope.displayLogin['display']    = 'none'
    $scope.displayRegister['display'] = 'flex'
  }

  // close the login/registration screens
  $scope.close = function(){
    resetForms()
  }

  // User Login.
  $scope.loginUser = function(){
    if (validateForm($scope.login)){
      XTFactory.signIn($scope.login, function(signInResp){
        if ('error' in signInResp){
          $scope.login['err'] = signInResp['error']
        } else {
          XTFactory.setCurrentUser(signInResp)
          $location.url('/start')
        }
      })
    }
  }

  $scope.registerUser = function(){
    if (validateForm($scope.register)){
      XTFactory.signUp($scope.register, function(signUpResp){
        if ('error' in signUpResp){
          $scope.register['err'] = signUpResp['error']
        } else {
          XTFactory.setCurrentUser(signUpResp)
          $location.url('/start')
        }
      })
    }
  }
}])
