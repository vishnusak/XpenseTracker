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
  $scope.showSheets      = false
  $scope.showGroups      = false
  $scope.nextSheet       = ''
  $scope.nextGroup       = ''
  $scope.prevSheet       = ''
  $scope.prevGroup       = ''
  $scope.sstartBtn       = true
  $scope.srenameBtn      = false
  $scope.gcreateBtn      = true
  $scope.gupdateNameBtn  = false
  $scope.gupdateFriendsBtn= false
  $scope.gupdateSheetsBtn= false
  $scope.gEditBtns       = false
  $scope.gNameShow       = true
  $scope.gFriendsShow    = true
  $scope.gSheetsShow     = true
  $scope.gSheetList      = true
  $scope.gAddFriendShow  = true
  $scope.gRemFriendShow  = true
  $scope.gSelectSheetShow= true
  $scope.readonlyClass   = ''
  $scope.readonly        = false
  $scope.sheetIdxArr     = []
  $scope.groupIdxArr     = []
  $scope.sheets          = []
  $scope.ownSheets       = []
  $scope.sheetsInGroup   = []
  $scope.groupFriends    = []
  $scope.sheetIdx        = ''
  $scope.groups          = []
  // addFriend - search for this email in the DB
  $scope.addFriend       = ''
  // groupSheetSelect - indicates which sheet(s) is(are) selected for sharing with a group
  $scope.groupSheetSelect= []
  // initialize the forms
  $scope.addSheet        = {
    sheetName: '',
    err      : ''
  }
  $scope.addGroup        = {
    groupName   : '',
    groupFriends: [],
    groupSheet  : [],
    err         : ''
  }
  let originalGroup   = {
    groupName   : '',
    groupFriends: [],
    groupSheet  : [],
  }

  // initialize the errors
  $scope.err             = {
    groupName  : false,
    groupFriend: false,
    groupSheet : false,
    sheetName  : false
  }

  let sheetStart         = 0,
      sheetLimit         = 5,
      groupStart         = 0,
      groupLimit         = 5

  // Populate the username in the nav bar
  if (!XTFactory.isUserSignedIn()){
    $location.url('/')
  } else {
    $scope.curUser   = XTFactory.getCurrentUser()
    $scope.user      = $scope.curUser['user']
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
      getOwnSheets()
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
      $scope.nextSheet = ''
      limit = $scope.sheets.length
    } else {
      $scope.nextSheet = 'show'
      limit = sheetStart + sheetLimit
    }

    $scope.sheetIdxArr = []
    for (let i = sheetStart; i < limit; i++){
      $scope.sheetIdxArr.push(i)
    }

    if (sheetStart == 0){
      $scope.prevSheet = ''
    } else {
      $scope.prevSheet = 'show'
    }
  }

  // generate an array of idices which will be used to display the groups
  function computeGroupIdxArr(){
    let limit = 0
    if ($scope.groups.length <= (groupStart + groupLimit)){
      $scope.nextGroup = ''
      limit = $scope.groups.length
    } else {
      $scope.nextGroup = 'show'
      limit = groupStart + groupLimit
    }

    $scope.groupIdxArr = []
    for (let i = groupStart; i < limit; i++){
      $scope.groupIdxArr.push(i)
    }

    if (groupStart == 0){
      $scope.prevGroup = ''
    } else {
      $scope.prevGroup = 'show'
    }
  }

  // remove group_id from sheets when a group is deleted
  function removeGrpIDFromSheets(grpId){
    for(let i = 0; i < $scope.sheets.length; i++){
      if ($scope.sheets[i]['group_id'] == grpId){
        $scope.sheets[i]['group_id'] = null
      }
    }
    getOwnSheets()
  }

  // filter the sheets to identify sheets owned by the current user (not shared sheets) to display them in the createGroup dialog
  function getOwnSheets(){
    for (let i = 0; i < $scope.sheets.length; i++){
      if ($scope.sheets[i]['creator_id'] == $scope.curUser['user_id']){
        $scope.ownSheets.push($scope.sheets[i])
      }
    }
  }

  // reset the form content
  function resetForms(){
    $scope.addSheet['sheetName']    = ''

    $scope.addGroup['groupName']    = ''
    $scope.addGroup['groupFriends'] = []
    $scope.addGroup['groupSheet']   = []

    $scope.groupFriends             = []
    $scope.groupSheetSelect         = []

    originalGroup['groupName']      = ''
    originalGroup['groupFriends']   = []
    originalGroup['groupSheet']     = []

    $scope.sstartBtn       = true
    $scope.srenameBtn      = false
    $scope.gcreateBtn      = true
    $scope.gupdateNameBtn  = false
    $scope.gupdateFriendsBtn= false
    $scope.gupdateSheetsBtn= false
    $scope.gEditBtns       = false
    $scope.gNameShow       = true
    $scope.gFriendsShow    = true
    $scope.gSheetsShow     = true
    $scope.gSheetList      = true
    $scope.readonlyClass   = ''
    $scope.readonly        = false
    $scope.gAddFriendShow  = true
    $scope.gSelectSheetShow= true
    $scope.gRemFriendShow  = true

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

    if ('groupSheet' in form){
      if (!form['groupSheet'].length){
        $scope.err['groupSheet'] = true
        form['err']              = `Please share a sheet with the group`
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
    $scope.gupdateNameBtn             = false
    $scope.gupdateFriendsBtn          = false
    $scope.gupdateSheetsBtn           = false
    $scope.gEditBtns                  = false
    $scope.gNameShow                  = true
    $scope.gFriendsShow               = true
    $scope.gSheetsShow                = true
    $scope.gSheetList                 = true
    $scope.readonlyClass              = ''
    $scope.readonly                   = false
    $scope.gAddFriendShow             = true
    $scope.gSelectSheetShow           = true
    $scope.gRemFriendShow             = true
  }

  // add friend(s) to the group being created
  $scope.addFriendToGroup = function(){
    if (validateFriendList($scope.groupFriends, $scope.addFriend)){
      XTFactory.getFriend($scope.addFriend, function(addedFriend){
        if ('error' in addedFriend){
          $scope.err['groupFriend'] = true
          $scope.addGroup['err']    = addedFriend['error']
        } else {
          let friend = {
            email: $scope.addFriend,
            id   : addedFriend['friendId']
          }
          // groupFriends is only for displaying on screen and it needs id + email
          $scope.groupFriends.push(friend)
          // addGroup['groupFriends'] is for passing on data to the server and this needs only the ids
          $scope.addGroup['groupFriends'].push(friend['id'])
          $scope.addFriend = ''
        }
      })
    }
  }

  // remove a friend email from the list
  $scope.remFromGroup = function(idx){
    $scope.groupFriends.splice(idx, 1)
    $scope.addGroup['groupFriends'].splice(idx, 1)
  }

  // toggle the sheet selection while editing a group
  $scope.toggleSelect = function(sheetId, sheetIdx){
    let idx = $scope.addGroup['groupSheet'].indexOf(sheetId)
    if (idx == -1){
      $scope.addGroup['groupSheet'].push(sheetId)
      $scope.groupSheetSelect[sheetIdx] = 'selected'
    } else {
      $scope.addGroup['groupSheet'].splice(idx, 1)
      $scope.groupSheetSelect[sheetIdx] = ''
    }
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
          $location.url('/')
        }
      })
    }
  }

  // delete a group. This removes the group and the user relations. Sheets belonging to the group will revert to sheet creators
  $scope.deleteGroup = function(group, groupIdx){
    XTFactory.deleteGroup(group['group_id'], function(delGrpResp){
      if ('error' in delGrpResp){
        console.log(delGrpResp['error'])
      } else {
        resetErr()
        removeGrpIDFromSheets(group['group_id'])
        $scope.groups.splice(groupIdx, 1)
        if ($scope.groups.length < 1){
          $scope.showGroups = false
        } else {
          computeGroupIdxArr()
        }
      }
    })
  }

  // check if the group is owned by current user or not and accordingly show the group edit menu
  $scope.isOwnGroup = function(curGroup){
    return (curGroup['creator_id'] == $scope.curUser['user_id'])
  }

  // Edit the group. can change group name, group members and sheets attached
  $scope.editGroupName = function(curGroup=null, groupIdx=null){

    if (!curGroup && !groupIdx){
      // if this is true it means that function is called from the group-details screen by clicking on the "Edit Name" button. Group details are already retrieved from the DB so there is no need to repeat the process again.
      curGroup = XTFactory.getCurrentGroup()
      groupIdx = curGroup['idx']
    } else {
      // if this is true, it means the function was called from the group menu bar to "Edit Name". Hence we have to do the full process here
      XTFactory.setCurrentGroup(curGroup, groupIdx)
      resetForms()
      // store details of group in originalGroup so that it can be compared during the update
      // populate the group name
      $scope.addGroup['groupName'] = curGroup['groupName']
      originalGroup['groupName']   = curGroup['groupName']
    }
    // show the create group screen with update button and only the group name
    $scope.displayAddGroup['display'] = 'flex'
    $scope.gcreateBtn                 = false
    $scope.gupdateNameBtn             = true
    $scope.gupdateFriendsBtn          = false
    $scope.gupdateSheetsBtn           = false
    $scope.gEditBtns                  = false
    $scope.gNameShow                  = true
    $scope.gFriendsShow               = false
    $scope.gSheetsShow                = false
    $scope.readonlyClass              = ''
    $scope.readonly                   = false
  }

  $scope.updateGroupName = function(){
    resetErr()
    if ($scope.addGroup['groupName'] == originalGroup['groupName']){
      $scope.addGroup['err'] = `No changes detected. Nothing to update.`
      $scope.err['groupName'] = true
    } else {
      let curGroup = XTFactory.getCurrentGroup()
      let data = {
        flag: 'name',
        id  : curGroup['group_id'],
        name: $scope.addGroup['groupName']
      }
      XTFactory.updateGroup(data, function(updGroup){
        if ('error' in updGroup){
          $scope.addGroup['err'] = updGroup['error']
          $scope.err['groupName']= true
        } else {
          $location.url('/')
        }
      })
    }
  }

  $scope.editGroupMember = function(curGroup=null, groupIdx=null){

    if (!curGroup && !groupIdx){
      // if this is true it means that function is called from the group-details screen by clicking on the "Edit Friends" button. Group details are already retrieved from the DB so there is no need to repeat the process again.
      curGroup = XTFactory.getCurrentGroup()
      groupIdx = curGroup['idx']
    } else {
      // if this is true, it means the function was called from the group menu bar to "Edit Members". Hence we have to do the full process here
      XTFactory.setCurrentGroup(curGroup, groupIdx)
      resetForms()

      $scope.addGroup['groupName'] = curGroup['groupName']
      originalGroup['groupName']   = curGroup['groupName']

      // get the friends email ids for a given group and store in groupFriends
      XTFactory.getMembers(curGroup['group_id'], function(members){
        if ('error' in members){
          $scope.addGroup['err'] = members['error']
        } else {
          resetErr()
          // store details of group in originalGroup so that it can be compared during the update
          // show list of friends/members
          let friends = members['members']
          for (let i = 0; i < friends.length; i++){
            if (friends[i]['user_id'] != $scope.curUser['user_id']){
              let each = {
                email: friends[i]['email'],
                id   : friends[i]['user_id']
              }
              $scope.groupFriends.push(each)
              $scope.addGroup['groupFriends'].push(each['id'])
              originalGroup['groupFriends'].push(each['id'])
            }
          }
        }
      })
    }

    // show the create group screen with update button and only the group members
    $scope.displayAddGroup['display'] = 'flex'
    $scope.gcreateBtn                 = false
    $scope.gupdateNameBtn             = false
    $scope.gupdateFriendsBtn          = true
    $scope.gupdateSheetsBtn           = false
    $scope.gEditBtns                  = false
    $scope.gNameShow                  = true
    $scope.gFriendsShow               = true
    $scope.gSheetsShow                = false
    $scope.readonlyClass              = 'readonly'
    $scope.readonly                   = true
    $scope.gAddFriendShow             = true
    $scope.gRemFriendShow             = true
  }

  $scope.updateGroupFriends = function(){
    resetErr()

    let idx            = 0
    let addedFriends   = []
    let removedFriends = originalGroup['groupFriends'].map((v) => {return v})

    for (let i = 0; i < $scope.addGroup['groupFriends'].length; i++){
      idx = removedFriends.indexOf($scope.addGroup['groupFriends'][i])
      if (idx < 0){
        addedFriends.push($scope.addGroup['groupFriends'][i])
      } else {
        removedFriends.splice(idx, 1)
      }
    }

    if (!addedFriends.length && !removedFriends.length){
      $scope.addGroup['err']    = `No changes detected. Nothing to update.`
      $scope.err['groupFriend'] = true
    } else if (!$scope.addGroup['groupFriends'].length){
      $scope.addGroup['err']    = `Please add friends to the group`
      $scope.err['groupFriend'] = true
    } else {
      let curGroup = XTFactory.getCurrentGroup()
      let data = {
        flag: 'friend',
        id  : curGroup['group_id'],
        addusers: addedFriends,
        remusers: removedFriends
      }
      XTFactory.updateGroup(data, function(updGroup){
        if ('error' in updGroup){
          $scope.addGroup['err'] = updGroup['error']
          $scope.err['groupFriend']= true
        } else {
          $location.url('/')
        }
      })
    }
  }

  $scope.editGroupSheet = function(curGroup, groupIdx){

    if (!curGroup && !groupIdx){
      // if this is true it means that function is called from the group-details screen by clicking on the "Edit Sheets" button. Group details are already retrieved from the DB so there is no need to repeat the process again.
      curGroup = XTFactory.getCurrentGroup()
      groupIdx = curGroup['idx']
    } else {
      // if this is true, it means the function was called from the group menu bar to "Edit Sheets". Hence we have to do the full process here
      XTFactory.setCurrentGroup(curGroup, groupIdx)
      resetForms()

      $scope.addGroup['groupName'] = curGroup['groupName']
      originalGroup['groupName']   = curGroup['groupName']

      // store details of group in originalGroup so that it can be compared during the update
      // get the group sheets given group
      for (let i = 0; i < $scope.ownSheets.length; i++){
        if ($scope.ownSheets[i]['group_id'] == curGroup['group_id']){
          $scope.addGroup['groupSheet'].push($scope.ownSheets[i]['sheet_id'])
          originalGroup['groupSheet'].push($scope.ownSheets[i]['sheet_id'])
          $scope.groupSheetSelect[i] = 'selected'
        }
      }
    }

    // show the create group screen with update button and only the group name
    $scope.displayAddGroup['display'] = 'flex'
    $scope.gcreateBtn                 = false
    $scope.gupdateNameBtn             = false
    $scope.gupdateFriendsBtn          = false
    $scope.gupdateSheetsBtn           = true
    $scope.gEditBtns                  = false
    $scope.gNameShow                  = true
    $scope.gFriendsShow               = false
    $scope.gSheetsShow                = true
    $scope.gSheetList                 = true
    $scope.readonlyClass              = 'readonly'
    $scope.readonly                   = true
    $scope.gSelectSheetShow           = true
  }

  $scope.updateGroupSheets = function(){
    resetErr()

    let idx            = 0
    let addedSheets    = []
    let removedSheets  = originalGroup['groupSheet'].map((v) => {return v})

    for (let i = 0; i < $scope.addGroup['groupSheet'].length; i++){
      idx = removedSheets.indexOf($scope.addGroup['groupSheet'][i])
      if (idx < 0){
        addedSheets.push($scope.addGroup['groupSheet'][i])
      } else {
        removedSheets.splice(idx, 1)
      }
    }

    if (!addedSheets.length && !removedSheets.length){
      $scope.addGroup['err']   = `No changes detected. Nothing to update.`
      $scope.err['groupSheet'] = true
    }  else if (!$scope.addGroup['groupSheet'].length){
      $scope.addGroup['err']   = `Please share a sheet with the group`
      $scope.err['groupSheet'] = true
    } else {
      let curGroup = XTFactory.getCurrentGroup()
      let data = {
        flag: 'sheet',
        id  : curGroup['group_id'],
        addsheets: addedSheets,
        remsheets: removedSheets
      }
      XTFactory.updateGroup(data, function(updGroup){
        if ('error' in updGroup){
          $scope.addGroup['err']  = updGroup['error']
          $scope.err['groupSheet']= true
        } else {
          $location.url('/')
        }
      })
    }
  }

  // show the details of a specific group when clicked on
  $scope.showGroup = function(curGroup, groupIdx){
    // show the create group screen without the save or update buttons and everything in readonly mode
    $scope.displayAddGroup['display'] = 'flex'
    $scope.gcreateBtn                 = false
    $scope.gupdateNameBtn             = false
    $scope.gupdateFriendsBtn          = false
    $scope.gupdateSheetsBtn           = false
    $scope.gNameShow                  = true
    $scope.gFriendsShow               = true
    $scope.gSheetsShow                = true
    $scope.gSheetList                 = false
    $scope.readonlyClass              = 'readonly'
    $scope.readonly                   = true
    $scope.gAddFriendShow             = false
    $scope.gRemFriendShow             = false
    $scope.gSelectSheetShow           = false

    if (curGroup['creator_id'] == $scope.curUser['user_id']){
      $scope.gEditBtns                = true
    } else {
      $scope.gEditBtns                = false
    }

    XTFactory.setCurrentGroup(curGroup, groupIdx)

    // reset the $scope.addGroup and originalGroup
    $scope.addGroup['groupName']    = ''
    $scope.addGroup['groupFriends'] = []
    $scope.addGroup['groupSheet']   = []
    $scope.groupFriends             = []
    $scope.groupSheetSelect         = []
    originalGroup['groupName']      = ''
    originalGroup['groupFriends']   = []
    originalGroup['groupSheet']     = []

    // groupName
    $scope.addGroup['groupName'] = curGroup['groupName']
    originalGroup['groupName']   = curGroup['groupName']

    // groupFriends
    XTFactory.getMembers(curGroup['group_id'], function(members){
      if ('error' in members){
        $scope.addGroup['err'] = members['error']
      } else {
        resetErr()
        let friends = members['members']
        for (let i = 0; i < friends.length; i++){
          if (friends[i]['user_id'] != $scope.curUser['user_id']){
            let each = {
              email: friends[i]['email'],
              id   : friends[i]['user_id']
            }
            $scope.groupFriends.push(each)
            $scope.addGroup['groupFriends'].push(each['id'])
            originalGroup['groupFriends'].push(each['id'])
          }
        }
      }
    })

    // groupSheet
    $scope.sheetsInGroup = []
    // this will determine which among the user-owned sheets have been selected to be shared with this group
    for (let i = 0; i < $scope.ownSheets.length; i++){
      if ($scope.ownSheets[i]['group_id'] == curGroup['group_id']){
        $scope.addGroup['groupSheet'].push($scope.ownSheets[i]['sheet_id'])
        originalGroup['groupSheet'].push($scope.ownSheets[i]['sheet_id'])
        $scope.groupSheetSelect[i] = 'selected'
        $scope.sheetsInGroup.push($scope.ownSheets[i])
      }
    }

    // this will determine which among all the sheets that the user can access belong to this group. This comes into play when seeing the details of a group not owned by the user
    if (!$scope.sheetsInGroup.length){
      for (let i = 0; i < $scope.sheets.length; i++){
        if ($scope.sheets[i]['group_id'] == curGroup['group_id']){
          $scope.sheetsInGroup.push($scope.sheets[i])
        }
      }
    }
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

// -------------------------------------------- //

  // Show the add new expense sheet dialog
  $scope.addNewSheet = function(){
    $scope.displayAddSheet['display'] = 'flex'
    $scope.srenameBtn                 = false
    $scope.sstartBtn                  = true
  }

  // Start a new sheet with the given name
  $scope.startSheet = function(){
    if (validateForm($scope.addSheet)){
      XTFactory.startSheet($scope.curUser['user_id'], $scope.addSheet['sheetName'], function(startSheetResp){
        if ('error' in startSheetResp){
          $scope.addSheet['err'] = startSheetResp['error']
        } else {
          $location.url('/')
        }
      })
    }
  }

  // check if the sheet is owned by current user or not and accordingly show the sheet edit menu
  $scope.isOwnSheet = function(curSheet){
    return (curSheet['creator_id'] == $scope.curUser['user_id'])
  }

  // check if the given sheet is shared with a group or not
  $scope.sharedSheet = function(curSheet){
    if (curSheet['group_id']){
      return true
    } else {
      return false
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
        if ($scope.sheets.length < 1){
          $scope.showSheets = false
        } else {
          computeSheetIdxArr()
        }
      }
    })
  }

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

  // Close the Add NewSheet/ NewGroup dialog
  $scope.close = function(){
    resetForms()
    $scope.displayAddGroup = {'display': 'none'}
    $scope.displayAddSheet = {'display': 'none'}
  }
}])
