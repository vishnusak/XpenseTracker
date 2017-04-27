// This is the XT factory module which I will use for:
// - Methods which facilitate all interactions with the server
// - Storing site wide values
// - getter/setter methods for site wide values

// create the factory on the angular "app" module created in the "routes" file
// Dependencies:
// $http - for http req/resp handling with the server
app.factory('XTFactory', ['$http', function($http){
  var factory      = {},
      currentUser  = {},
      currentSheet = {},
      currentGroup = {},
      months       = {
        0 : 'Jan',
        1 : 'Feb',
        2 : 'Mar',
        3 : 'Apr',
        4 : 'May',
        5 : 'Jun',
        6 : 'Jul',
        7 : 'Aug',
        8 : 'Sep',
        9 : 'Oct',
        10: 'Nov',
        11: 'Dec'
      }

  // Factory methods
  // Return all months as an array of key/value pairs
  factory.getMonths = function(){
    let allmonths = []
    for (let i = 0; i < 12; i++){
      allmonths.push({'id': i, 'name': months[i]})
    }
    return allmonths
  }

  // Return the abbr for the current month
  factory.getCurrentMonth = function(mon){
    return months[mon]
  }

  // Check if the user is already signed in.
  factory.isUserSignedIn = function(){
    return (('user' in currentUser) ? true : false)
  }

  // save the sheet details of the current sheet being opened/used
  factory.setCurrentSheet = function(sheet){
    currentSheet['sheet_id']  = sheet['sheet_id']
    currentSheet['sheetName'] = sheet['sheetName']
    currentSheet['group_id']  = sheet['group_id']
    currentSheet['creator_id']= sheet['creator_id']
  }

  // return the current sheet id
  factory.getCurrentSheet = function(){
    return currentSheet
  }

  // save the group id of the current sheet being opened/used
  factory.setCurrentGroup = function(group, idx){
    currentGroup['group_id']   = group['group_id']
    currentGroup['groupName']  = group['groupName']
    currentGroup['creator_id'] = group['creator_id']
    currentGroup['idx']        = idx
  }

  // return the group id of the current sheet
  factory.getCurrentGroup = function(){
    return currentGroup
  }

  // Set the currentUser once the signIn/signUp process is successful
  factory.setCurrentUser = function(user){
    currentUser['user_id']   = user['user_id']
    currentUser['user']      = user['userName']
    currentUser['email']     = user['email']
    currentUser['firstName'] = user['firstName']
    currentUser['lastName']  = user['lastName']
  }

  // Return the current user.
  factory.getCurrentUser = function(){
    return currentUser
  }

  // Get the list of sheets that the current user has access to
  factory.getUserInfo  = function(userId, groupId, cb){
    $http({
      method: 'GET',
      url   : `/start/${userId}-${groupId}`
    }).then(function(userInfoResp){
      cb(userInfoResp.data)
    }, function(err){
      cb({'error': 'Unable to retrieve user info'})
    })
  }

  // Get userid detail of user-mail for adding into group
  factory.getFriend = function(email, cb){
    $http({
      method: 'GET',
      url   : `/users/${email}`
    }).then(function(friend){
      cb(friend.data)
    }, function(err){
      cb({'error': 'Unable to add friend'})
    })
  }

  // signIn (login). 'cb' is the callback sent from the controller since the $http request is an async request. It returns a promise which takes in two functions, first one for success and second one for error response
  factory.signIn = function(login, cb){
    $http({
      method: 'POST',
      url   : '/login',
      data  : login
    }).then(function(signInResp){
      cb(signInResp.data)
    }, function(err){
      cb({'error': 'Unable to SignIn. Please try later'})
    })
  }

  // signUp (registration). 'cb' is the callback sent from the controller since the $http request is an async request. It returns a promise which takes in two functions, first one for success and second one for error response
  factory.signUp = function(register, cb){
    $http({
      method: 'POST',
      url   : '/register',
      data  : register
    }).then(function(signUpResp){
      cb(signUpResp.data)
    }, function(err){
      cb({'error': 'Unable to SignUp. Please try later'})
    })
  }

  // signOut. A simple sign out method which initializes the 'currentUser' factory variable.
  factory.signOut = function(){
    currentUser = {}
  }

  // updateUser - update changes in current users name / email / username.
  factory.updateUser = function(action, id, updateUserData, cb){
    updateUserData['action']  = action
    updateUserData['user_id'] = id
    $http({
      method: 'PUT',
      url   : '/users',
      data  : updateUserData
    }).then(function(updatedUser){
      cb(updatedUser.data)
    }, function(err){
      console.log(err)
      cb({'error': 'Unable to update user'})
    })
  }

  // startSheet. create new sheet on the backend, associate it with the user and get back the sheet id
  factory.startSheet = function(userId, sheetName, cb){
    var newSheetData = {
      'userId'   : userId,
      'sheetName': sheetName
    }
    $http({
      method: 'POST',
      url   : '/sheet',
      data  : newSheetData
    }).then(function(newSheetResp){
      cb(newSheetResp.data)
    }, function(err){
      console.log(err)
      cb({'error': 'Unable to create new sheet'})
    })
  }

  // updateSheet. Update the sheet with new name.
  factory.updateSheet = function(sheetId, sheetName, cb){
    let updatedSheetData = {
      'sheetId'  : sheetId,
      'sheetName': sheetName
    }
    $http({
      method: 'PUT',
      url   : '/sheet',
      data  : updatedSheetData
    }).then(function(updatedSheetResp){
      cb(updatedSheetResp.data)
    }, function(err){
      console.log(err)
      cb({'error': 'Unable to update sheet info'})
    })
  }

  // deleteSheet. Delete a specific sheet
  factory.deleteSheet = function(sheetId, cb){
    $http({
      method: 'DELETE',
      url   : `/sheet/${sheetId}`
    }).then(function(deleteSheetResp){
      cb(deleteSheetResp.data)
    }, function(err){
      console.log(err)
      cb({'error': 'Unable to delete sheet'})
    })
  }

  // saveExpense. save the new expense detail and return the updated list of expenses
  factory.saveExpense = function(expense, cb){
    $http({
      method: 'POST',
      url   : '/expense',
      data  : expense
    }).then(function(updatedExpenses){
      cb(updatedExpenses.data)
    }, function(err){
      console.log(err)
      cb({'error': 'Unable to retrieve expense details'})
    })
  }

  // updateExpense. Save an updated expense detail and return the updated list of expenses
  factory.updateExpense = function(expense, cb){
    $http({
      method: 'PUT',
      url   : '/expense',
      data  : expense
    }).then(function(updatedExpenses){
      cb(updatedExpenses.data)
    }, function(err){
      cb({'error': 'Unable to retrieve expense details'})
    })
  }

  // deleteExpense. Delete a specific expense row
  factory.deleteExpense = function(expense, cb){
    $http({
      method: 'DELETE',
      url   : `/expense/${expense['sheetId']}-${expense['year']}-${expense['month']}-${expense['expenseId']}`,
    }).then(function(updatedExpenses){
      cb(updatedExpenses.data)
    }, function(err){
      cb({'error': 'Unable to retrieve expense details'})
    })
  }

  // getExpenses. get the expenses for the current sheet for current month and year
  factory.getExpenses = function(year, month, sheetId, list, cb){
    $http({
      method: 'GET',
      url   : `/expense/${sheetId}-${year}-${month}-${list}`
    }).then(function(expenses){
      cb(expenses.data)
    }, function(err){
      cb({'error': 'Unable to retrieve expense details'})
    })
  }

  // createGroup. Create a new group, add friends to it and share an expense sheet with the group.
  factory.createGroup = function(newGroupInfo, userId, cb){
    delete newGroupInfo['err']
    newGroupInfo['userid'] = userId
    $http({
      method: 'POST',
      url   : '/group',
      data  : newGroupInfo
    }).then(function(newGroup){
      cb(newGroup.data)
    }, function(err){
      cb({'error': 'Unable to create new group'})
    })
  }

  // deleteGroup. Deletes the group based on group id and unconnects any connected sheets
  factory.deleteGroup = function(grpId, cb){
    $http({
      method: 'DELETE',
      url   : `/group/${grpId}`
    }).then(function(delGrp){
      cb(delGrp.data)
    }, function(err){
      cb({'error': 'Unable to delete Group'})
    })
  }

  // updateGroup. Update aspects of the group based on the update flag which will be 'name', 'friend' or 'sheet'
  factory.updateGroup = function(data, cb){
    $http({
      method: 'PUT',
      url   : `/group`,
      data  : data
    }).then(function(updResp){
      cb(updResp.data)
    }, function(err){
      cb({'error': 'Unable to update group'})
    })
  }

  // getMembers. Get the member info for a given group
  factory.getMembers = function(grpId, cb){
    $http({
      method: 'GET',
      url   : `/group/members/${grpId}`
    }).then(function(members){
      cb(members.data)
    }, function(err){
      cb({'error': 'Unable to retrieve member info'})
    })
  }

  return factory
}])
