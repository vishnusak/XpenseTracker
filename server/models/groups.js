// GROUPS model for XT system
console.log()
console.log("|-------------GROUPS Model--------------|")
console.log(`| XT - GROUPS Queries loaded            |`)
console.log("|---------------------------------------|")


// Server-side DB error logging
function dbErr(action, err){
  console.log(`***************************************`)
  console.log(`*   !! Error in GROUPS -> Queries !!  *`)
  console.log(`***************************************`)
  console.log(`Event: ${action}                       `)
  console.log()
  console.log(`${err}`)
  console.log(`***************************************`)
}

// all CRUD operations will be passed the connection pool variable along with the other parameters necessary
module.exports = {
  // addGroup - Add a new group and add the users to that group.
  addGroup: function(pool, grpName, creator, friends, cb){
    let grpSql  = `insert into groups set ?`
    let newGrp  = {groupName: grpName, creator_id: creator}
    // need to use the below syntax for insert instead of the "set" syntax because here I will be doing bulk insert
    let relSql  = `insert into groups_has_users (group_id, user_id) values ?`
    // The values passed into the bulk insert must be organized as an array of arrays
    let newRel = []

    pool.getConnection(function(getConnectionErr, connection){
      if (getConnectionErr){
        dbErr("addGroup:getConnection", getConnectionErr)
        cb(`Unable to get connection`,'')
      }

      connection.query(grpSql, newGrp, function(grpQueryErr, addGroupResults, fields){
        if (grpQueryErr){
          connection.release()
          dbErr("addGroup:InsertGroup", grpQueryErr)
          cb(`Unable to add group`, '')
        } else {
          let grpId = addGroupResults.insertId

          for (let i = 0; i < friends.length; i++){
            newRel.push([grpId, friends[i]])
          }
          // the values for the bulk insert must be passed to the query as an array.
          // so essentially in the sql it will look like [[[1,2], [1,3], [1,4], ...]]
          connection.query(relSql, [newRel], function(relQueryErr, groupRelationsResults, fields){
            connection.release()
            if (relQueryErr){
              dbErr("addGroup:InsertRelation", relQueryErr)
              cb(`Unable to add relationship`, '')
            } else {
              cb('', {groupId: grpId})
            }
          })
        }
      })
    })
  },
  // addUsersToGroup - Add new user(s) to existing group
  addUsersToGroup: function(pool, grpId, users, cb){
    // see previous method for explanation on bulk insert syntax
    let relSql  = `insert into groups_has_users (group_id, user_id) values ?`
    let newRel = []

    pool.getConnection(function(getConnectionErr, connection){
      if (getConnectionErr){
        dbErr("addUserToGroup:getConnection", getConnectionErr)
        cb(`Unable to get connection`,'')
      }

      for (let i = 0; i < users.length; i++){
        newRel.push([grpId, users[i]])
      }

      connection.query(relSql, [newRel], function(relQueryErr, addUsersToGroupResults, fields){
        connection.release()
        if (relQueryErr){
          dbErr("addUsersToGroup:InsertRelation", relQueryErr)
          cb(`Unable to add relationship`, '')
        } else {
          cb('', {groupId: grpId})
        }
      })
    })
  },
  // delUsersFromGroup - remove user(s) from existing group
  delUsersFromGroup: function(pool, grpId, users, cb){
    let relSql = `delete from groups_has_users where group_id = ${grpId} and user_id in (${users})`

    pool.getConnection(function(getConnectionErr, connection){
      if (getConnectionErr){
        dbErr("delUserFromGroup:getConnection", getConnectionErr)
        cb(`Unable to get connection`,'')
      }

      connection.query(relSql, function(relQueryErr, delUserFromGroupResults, fields){
        connection.release()
        if (relQueryErr){
          dbErr("delUserFromGroup:DeleteRelation", relQueryErr)
          cb(`Unable to delete relationship`, '')
        } else {
          cb('', {groupId: grpId})
        }
      })
    })
  },
  // updateGroupName - update the name of a specific group
  updateGroupName: function(pool, grpId, grpNameUpdate, cb){
    let grpNmSql = `update groups set ? where group_id = ${grpId}`

    pool.getConnection(function(getConnectionErr, connection){
      if (getConnectionErr){
        dbErr("updateGroupName:getConnection", getConnectionErr)
        cb(`Unable to get connection`,'')
      }

      connection.query(grpNmSql, grpNameUpdate, function(grpNmErr, updGrpNmResults, fields){
        connection.release()
        if (grpNmErr){
          dbErr("updateGroupName:Update Name", grpNmErr)
          cb(`Unable to Rename Group`, '')
        } else {
          cb('', {groupId: grpId})
        }
      })
    })
  },
  // getGroupInfo - get information about a given group. Includes group members
  getGroupInfo : function(pool, grpId, cb){
    let grpSql = `select g.group_id, g.groupName, g.creator_id from groups g where g.group_id = ${grpId}`
    let relSql = `select gu.user_id from groups_has_users gu where gu.group_id = ${grpId}`

    pool.getConnection(function(getConnectionErr, connection){
      if (getConnectionErr){
        dbErr("getGroupInfo:getConnection", getConnectionErr)
        cb(`Unable to get connection`,'')
      }

      connection.query(grpSql, function(getGroupErr, getGroupResults, fields){
        if (getGroupErr){
          connection.release()
          dbErr("getGroupInfo:SelectGroup", getGroupErr)
          cb(`Unable to get Group Info`, '')
        } else {
          connection.query(relSql, function(getGroupMemberErr, getGroupMemberResults, fields){
            connection.release()
            if (getGroupMemberErr){
              dbErr("getGroupInfo:GetGroupMembers", getGroupMemberErr)
              cb(`Unable to get Group member info`, '')
            } else {
              cb('', {group: getGroupresults, members: GetGroupMemberResults})
            }
          })
        }
      })
    })
  },
  // getGroupMemberInfo - get information about a given group's members.
  getGroupMemberInfo : function(pool, grpId, cb){
    let memberSql = `select u.email, u.user_id from users u, groups_has_users gu where gu.group_id = ${grpId} and gu.user_id = u.user_id`

    pool.getConnection(function(getConnectionErr, connection){
      if (getConnectionErr){
        dbErr("getGroupMemberInfo:getConnection", getConnectionErr)
        cb(`Unable to get connection`,'')
      }

      connection.query(memberSql, function(getGroupMemberErr, getGroupMemberResults, fields){
        connection.release()
        if (getGroupMemberErr){
          dbErr("getGroupMemberInfo:SelectMembers", getGroupMemberErr)
          cb(`Unable to get Group Member Info`, '')
        } else {
          cb('', {members: getGroupMemberResults})
        }
      })
    })
  },
  // delGroup - remove existing group(s)
  delGroup: function(pool, grpId, cb){
    let delGrpSql  = `delete from groups where group_id = ${grpId}`

    pool.getConnection(function(getConnectionErr, connection){
      if (getConnectionErr){
        dbErr("delGroup:getConnection", getConnectionErr)
        cb(`Unable to get connection`,'')
      }

      connection.query(delGrpSql, function(delGrpQueryErr, delGroupResults, fields){
        connection.release()
        if (delGrpQueryErr){
          dbErr("delGroup:DeleteGroup", delGrpQueryErr)
          cb(`Unable to delete group`, '')
        } else {
          cb('', {groupId: grpId})
        }
      })
    })
  },
  // validateGroupName - validate the group name sent from the front-end
  validateGroupName: function(name){
    return /[^0-9a-zA-Z]+/.test(name)
  }
}
