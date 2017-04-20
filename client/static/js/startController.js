// This controller is to handle the start page, along with the nav bar

// create the controller on the angular "app" module created in the "routes" file
// Dependencies:
// $scope - for data binding
// $location - for path/route manipulation
// XTFactory - factory module for the site
app.controller('startController',['$scope', '$location', 'XTFactory', function($scope, $location, XTFactory){
  // initialise the $scope variables
  $scope.userDropdown    = {'display': 'none'}
  $scope.displayAddSheet = {'display': 'none'}
  $scope.displayAddGroup = {'display': 'none'}
  $scope.curUser         = ''
  $scope.user            = ''
  $scope.userGroup       = ''
  $scope.showSheets      = false
  $scope.showGroups      = false
  $scope.nextSheet       = false
  $scope.nextGroup       = false
  $scope.prevSheet       = false
  $scope.prevGroup       = false
  $scope.sstartBtn       = true
  $scope.srenameBtn      = false
  $scope.gcreateBtn      = true
  $scope.gupdateBtn      = false
  $scope.sheetIdxArr     = []
  $scope.groupIdxArr     = []
  $scope.sheets          = []
  $scope.sheetIdx        = ''
  $scope.groups          = []
  // addFriend - search for this email in the DB
  $scope.addFriend       = ''

  // initialize the forms
  $scope.addSheet        = {
    sheetName: '',
    err      : ''
  }
  $scope.addGroup        = {
    groupName   : '',
    groupFriends: [],
    groupSheet  : '',
    err         : ''
  }

  // initialize the errors
  $scope.err             = {
    groupName  : false,
    groupFriend: false,
    groupSheet : false,
    sheetName  : false
  }

  var sheetStart         = 0,
      sheetLimit         = 5,
      groupStart         = 0,
      groupLimit         = 5

  // Populate the username in the nav bar
  if (!XTFactory.isUserSignedIn()){
    $location.url('/')
  } else {
    $scope.curUser   = XTFactory.getCurrentUser()
    $scope.user      = $scope.curUser['user']
    $scope.userGroup = $scope.curUser['group_id']
  }

  // Get all the sheets / groups that the user has access to
  XTFactory.getUserInfo($scope.curUser['user_id'], $scope.curUser['group_id'], function(userInfoList){
    if ('error' in userInfoList){
      console.log(userInfoList['error'])
      $scope.showSheets   = false
    } else {
      $scope.sheets       = userInfoList['sheets']
      if ($scope.sheets.length > 0){
        $scope.showSheets = true
      }
      computeSheetIdxArr()
      $scope.groups       = userInfoList['groups']
      if ($scope.groups.length > 0){
        $scope.showGroups = true
      }
      computeGroupIdxArr()
    }
  })

  // generate an array of idices which will be used to display the sheets
  function computeSheetIdxArr(){
    let limit = 0
    if ($scope.sheets.length <= (sheetStart + sheetLimit)){
      $scope.nextSheet = false
      limit = $scope.sheets.length
    } else {
      $scope.nextSheet = true
      limit = sheetStart + sheetLimit
    }

    $scope.sheetIdxArr = []
    for (let i = sheetStart; i < limit; i++){
      $scope.sheetIdxArr.push(i)
    }

    if (sheetStart == 0){
      $scope.prevSheet = false
    } else {
      $scope.prevSheet = true
    }
  }

  // generate an array of idices which will be used to display the groups
  function computeGroupIdxArr(){
    let limit = 0
    if ($scope.groups.length <= (groupStart + groupLimit)){
      $scope.nextGroup = false
      limit = $scope.groups.length
    } else {
      $scope.nextGroup = true
      limit = groupStart + groupLimit
    }

    $scope.groupIdxArr = []
    for (let i = groupStart; i < limit; i++){
      $scope.groupIdxArr.push(i)
    }

    if (groupStart == 0){
      $scope.prevGroup = false
    } else {
      $scope.prevGroup = true
    }
  }

  // reset the form content
  function resetForms(){
    $scope.addSheet['sheetName']    = ''
    $scope.addGroup['groupName']    = ''
    $scope.addGroup['groupFriends'] = []
    $scope.addGroup['groupSheet']   = ''

    resetErr()
  }

  // reset the errors on the forms
  function resetErr(){
    $scope.err['groupName']   = false
    $scope.err['groupSheet']  = false
    $scope.err['groupFriend'] = false
    $scope.err['sheetName']   = false
    $scope.addSheet['err']    = ''
    $scope.addGroup['err']    = ''
  }

  // validate form inputs
  function validateForm(form){
    resetErr()
    if ('groupName' in form){
      if (!form['groupName']){
        $scope.err['groupName'] = true
        form['err']             = `Group Name must be filled`
        return false
      }

      if (/[^0-9a-zA-Z]/.test(form['groupName'])){
        $scope.err['groupName'] = true
        form['err']             = `Group Name must have only AlphaNumeric characters`
        return false
      }
    }

    if ('groupFriends' in form){
      if (!form['groupFriends'].length){
        $scope.err['groupFriend']= true
        form['err']              = `Please add friends to the group`
        return false
      }
    }

    if ('sheetName' in form){
      if (!form['sheetName']){
        $scope.err['sheetName'] = true
        form['err']             = `Sheet Name must be filled`
        return false
      }

      if (/[^0-9a-zA-Z]/.test(form['sheetName'])){
        $scope.err['sheetName'] = true
        form['err']             = `Sheet Name must have only AlphaNumeric characters`
        return false
      }
    }

    return true
  }

  // validate the friends being added to a group
  // -current user shouldn't be added explicitly
  // -adding a friend who is already on the list
  function validateFriendList(list, friend=''){
    resetErr()

    if (!friend){
      $scope.err['groupFriend'] = true
      $scope.addGroup['err']    = `Please type in a friend's "Mail Id"`
      return false
    }

    if (friend == $scope.curUser['email']){
      $scope.err['groupFriend'] = true
      $scope.addGroup['err']    = `You don't need to add yourself`
      return false
    }

    let exists = list.reduce((s, v) => {return s += ((v['email'] == friend) ? 1 : 0)}, 0)

    if (exists){
      $scope.err['groupFriend'] = true
      $scope.addGroup['err']    = `${friend} already in the list`
      return false
    }

    return true
  }

  // controller methods
  // show the next set of sheets - increment by 1
  $scope.showNextSheet = function(){
    sheetStart += 1
    computeSheetIdxArr()
  }

  // show the prev set of sheets - decrement by 1
  $scope.showPrevSheet = function(){
    sheetStart -= 1
    computeSheetIdxArr()
  }

  // show the next set of groups - increment by 1
  $scope.showNextGroup = function(){
    groupStart += 1
    computeGroupIdxArr()
  }

  // show the prev set of groups - decrement by 1
  $scope.showPrevGroup = function(){
    groupStart -= 1
    computeGroupIdxArr()
  }

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

  // Show the add new group dialog
  $scope.addNewGroup = function(){
    $scope.displayAddGroup['display'] = 'flex'
    $scope.gcreateBtn                 = true
    $scope.gupdateBtn                 = false
  }

  // add friend(s) to the group being created
  $scope.addFriendToGroup = function(){
    if (validateFriendList($scope.addGroup['groupFriends'], $scope.addFriend)){
      XTFactory.getFriend($scope.addFriend, function(addedFriend){
        if ('error' in addedFriend){
          $scope.err['groupFriend'] = true
          $scope.addGroup['err']    = addedFriend['error']
        } else {
          let friend = {
            email: $scope.addFriend,
            id   : addedFriend['friendId']
          }
          $scope.addGroup['groupFriends'].push(friend)
          $scope.addFriend = ''
        }
      })
    }
  }

  // remove a friend email from the list
  $scope.remFromGroup = function(idx){
    $scope.addGroup['groupFriends'].splice(idx, 1)
  }

  // Create a new group.
  // New group must have following:
  // -GroupName
  // -Creating user's user id
  // -List of friends to add to group. This must be an array of userids
  // Optional inputs to new group:
  // -A sheet to share with this group. This should be a sheetId
  // Sheet Id is being made optional since it can be added to the group at a later stage also.
  $scope.createGroup = function(){
    if (validateForm($scope.addGroup)){
      XTFactory.createGroup($scope.addGroup, $scope.curUser['user_id'], function(createGroupResp){
        if ('error' in createGroupResp){
          $scope.addGroup['err'] = createGroupResp['error']
        } else {
          console.log(createGroupResp)
        }
      })
    }
  }

  // Show the add new expense sheet dialog
  $scope.addNewSheet = function(){
    $scope.displayAddSheet['display'] = 'flex'
    $scope.srenameBtn                 = false
    $scope.sstartBtn                  = true
  }

  // Start a new sheet with the given name
  $scope.startSheet = function(){
    if (validateForm($scope.addSheet)){
      XTFactory.startSheet($scope.curUser['group_id'], $scope.curUser['user_id'], $scope.addSheet['sheetName'], function(startSheetResp){
        if ('error' in startSheetResp){
          $scope.addSheet['err'] = startSheetResp['error']
        } else {
          let newSheet = {
            sheet_id : startSheetResp['sheetid'],
            sheetName: $scope.addSheet['sheetName'],
            group_id : $scope.curUser['group_id'],
            user_id  : $scope.curUser['user_id']
          }
          XTFactory.setCurrentSheet(newSheet)
          $location.url('/sheet')
        }
      })
    }
  }

  // Show the sheet and expenses
  $scope.showSheet = function(curSheet){
    XTFactory.setCurrentSheet(curSheet)
    $location.url('/sheet')
  }

  // Change the sheet name
  $scope.renameSheet = function(curSheet, sheetIdx){
    XTFactory.setCurrentSheet(curSheet)
    resetErr()
    $scope.sheetIdx                   = sheetIdx
    $scope.displayAddSheet['display'] = 'flex'
    $scope.addSheet['sheetName']      = curSheet['sheetName']
    $scope.srenameBtn                 = true
    $scope.sstartBtn                  = false
  }

  // Update the sheet name in the DB
  $scope.updateSheet = function(){
    let curSheet                 = XTFactory.getCurrentSheet()
    if ($scope.addSheet['sheetName'] == curSheet['sheetName']){
      $scope.addSheet['err']  = `Same name as before`
      $scope.err['sheetName'] = true
    } else {
      resetErr()
      XTFactory.updateSheet(curSheet['sheet_id'], $scope.addSheet['sheetName'], function(updateSheetResp){
        if ('error' in updateSheetResp){
          $scope.addSheet['err'] = updateSheetResp['error']
          $scope.err['sheetName']= true
        } else {
          resetErr()
          $scope.sheets[$scope.sheetIdx]['sheetName'] = $scope.addSheet['sheetName']
          resetForms()
          $scope.displayAddSheet['display'] = 'none'
        }
      })
    }
  }

  // Delete a specific sheet
  $scope.deleteSheet = function(curSheet, sheetIdx){
    XTFactory.deleteSheet(curSheet['sheet_id'], function(deleteSheetResp){
      if ('error' in deleteSheetResp){
      } else {
        resetErr()
        $scope.sheets.splice(sheetIdx, 1)
        computeSheetIdxArr()
      }
    })
  }

  // Close the Add NewSheet/ NewGroup dialog
  $scope.close = function(){
    resetForms()
    $scope.displayAddGroup = {'display': 'none'}
    $scope.displayAddSheet = {'display': 'none'}
  }
}])
