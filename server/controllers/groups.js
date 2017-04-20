// groups Controller
console.log()
console.log("|------------Groups Controller----------|")
console.log(`| XT - Groups Controller loaded         |`)
console.log("|---------------------------------------|")

// import the db query object required.
var Groups = require('../models/groups')
var Sheets = require('../models/sheets')

// Export the Groups controller methods
module.exports = function(pool, fn){
  switch (fn){
    case 'add':
    // Add a new group
      return function(req, res){
        // validate the group name
        if (Groups.validateGroupName(req.body['groupName'])){
          res.json({error: `Group name is invalid`})
        } else {
          let newGroup     = req.body['groupName']
          // groupFriends will be an array of ids
          let groupFriends = req.body['groupFriends'].map((friend) => {return friend['id']})
          groupFriends.push(req.body['userid'])
          let groupSheet = ((req.body['groupSheet']) ? req.body['groupSheet'] : '')

          Groups.addGroup(pool, newGroup, groupFriends, function(err, newGroupId){
            if (err){
              res.json({error: err})
            } else {
              if (groupSheet){
                let update = {group_id: newGroupId['groupId']}
                Sheets.updateSheet(pool, groupSheet, update, function(err, newSheet){
                  if (err){
                    res.json({error: err})
                  } else {
                    res.json(newSheet)
                  }
                })
              } else {
                res.json(newGroupId)
              }
            }
          })
        }
      }
      break
    case 'adduser':
    // Add new user(s) to existing group
      return function(req, res){
        Groups.addUserToGroup(pool, req.body['groupId'], req.body['users'], function(err, modifiedGroup){
          if (err){
            res.json({error: err})
          } else {
            res.json(modifiedGroup)
          }
        })
      }
      break
    case 'start':
    // Get the details about specific user
      return function(req, res){
        var userId = req.params['userid']

        Users.getUserInfo(pool, userId, function(err, info){
          if (err){
            res.json({error: err})
          } else {
            res.json(info)
          }
        })
      }
      break
  }
}
