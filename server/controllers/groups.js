// groups Controller
console.log()
console.log("|------------Groups Controller----------|")
console.log(`| XT - Groups Controller loaded         |`)
console.log("|---------------------------------------|")

// import the db query object required.
var Groups = require('../models/groups')

// Export the Groups controller methods
module.exports = function(pool, fn){
  switch (fn){
    case 'newgroup':
    // Add a new group
      return function(req, res){
        // validate the group name
        if (Groups.validateGroupName(req.body['groupName'])){
          res.json({error: `Group name is invalid`})
        } else {
          var userId   = req.body['userid']
          var grpUsers = req.body['userList']
          grpUsers.push(userId)
          var newGroup = req.body['groupName']

          Groups.addGroup(pool, newGroup, userId, grpUsers, function(err, newGroup){
            if (err){
              res.json({error: err})
            } else {
              res.json(newGroup)
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
