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
          // groupFriends will be an array of ids
          // let groupFriends = req.body['groupFriends'].map((friend) => {return friend['id']})
          let groupFriends = req.body['groupFriends']
          groupFriends.push(req.body['userid'])
          let groupSheet = req.body['groupSheet']

          Groups.addGroup(pool, req.body['groupName'], req.body['userid'], groupFriends, function(err, newGroupId){
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
    case 'update':
    // Update the given group and the specific attribute of the group based on the flag
      return function(req, res){
        switch (req.body['flag']){
          case 'name':
            let nameData = {
              groupName: req.body['name']
            }
            Groups.updateGroupName(pool, req.body['id'], nameData, function(err, updGrp){
              if (err){
                res.json({error: err})
              } else {
                res.json(updGrp)
              }
            })
            break
          case 'friend':
            if (req.body['addusers'].length){
              Groups.addUsersToGroup(pool, req.body['id'], req.body['addusers'], function(err, updGrpAddF){
                if (err){
                  res.json({error: err})
                } else {
                  if (req.body['remusers'].length){
                    Groups.delUsersFromGroup(pool, req.body['id'], req.body['remusers'], function(err, updGrpRemF){
                      if (err){
                        res.json({error: err})
                      } else {
                        res.json(updGrpRemF)
                      }
                    })
                  } else {
                    res.json(updGrpAddF)
                  }
                }
              })
            } else {
              if (req.body['remusers'].length){
                Groups.delUsersFromGroup(pool, req.body['id'], req.body['remusers'], function(err, updGrpRemF){
                  if (err){
                    res.json({error: err})
                  } else {
                    res.json(updGrpRemF)
                  }
                })
              }
            }
            break
          case 'sheet':
            if (req.body['addsheets'].length){
              let addSheetData = {
                group_id: req.body['id']
              }
              Sheets.updateSheet(pool, req.body['addsheets'], addSheetData, function(err, updGrpAddS){
                if (err){
                  res.json({error: err})
                } else {
                  if (req.body['remsheets'].length){
                    Sheets.delSheetGrp(pool, req.body['remsheets'], function(err, updGrpRemS){
                      if (err){
                        res.json({error: err})
                      } else {
                        res.json(updGrpRemS)
                      }
                    })
                  } else {
                    res.json(updGrpAddS)
                  }
                }
              })
            } else {
              if (req.body['remsheets'].length){
                Sheets.delSheetGrp(pool, req.body['remsheets'], function(err, updGrpRemS){
                  if (err){
                    res.json({error: err})
                  } else {
                    res.json(updGrpRemS)
                  }
                })
              }
            }
            break
        }
      }
      break
    case 'getmembers':
    // Get the list of members in a given group
      return function(req, res){
        Groups.getGroupMemberInfo(pool, req.params['groupId'], function(err, members){
          if (err){
            res.json({error: err})
          } else {
            res.json(members)
          }
        })
      }
      break
    case 'delete':
    // delete a specific group. This will also remove the relationships between group being deleted and any sheets attached to it.
      return function(req, res){
        let grpId = req.params['groupId']

        Groups.delGroup(pool, grpId, function(err, delInfo){
          if (err){
            res.json({error: err})
          } else {
            res.json(delInfo)
          }
        })
      }
      break
  }
}
