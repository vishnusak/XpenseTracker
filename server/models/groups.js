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
  // addGroup - Add a new group and add the users to that group. At a minimum, the group creator will be automatically added to the group
  addGroup: function(pool, grpName, userId, users, cb){
    var grpSql  = `insert into groups set ?`
    // var newGrp  = {groupName: pool.escape(grpName)}
    var newGrp  = {groupName: grpName}
    var relSql  = `insert into groups_has_users set ?`
    var newRel = []

    pool.getConnection(function(getConnectionErr, connection){
      if (getConnectionErr){
        dbErr("addGroup:getConnection", getConnectionErr)
        cb(`Unable to get connection`,'')
      }

      connection.query(grpSql, newGrp, function(grpQueryErr, results, fields){
        if (grpQueryErr){
          connection.release()
          dbErr("addGroup:InsertGroup", grpQueryErr)
          cb(`Unable to add group`, '')
        }

        var grpId = results.insertId
        for (let i = 0; i < users.length; i++){
          // newRel.push({group_id: grpId, user_id: pool.escape(users[i])})
          newRel.push({group_id: grpId, user_id: users[i]})
        }
        connection.query(relSql, newRel, function(relQueryErr, results, fields){
          connection.release()
          if (relQueryErr){
            dbErr("addGroup:InsertRelation", relQueryErr)
            cb(`Unable to add relationship`, '')
          }

          cb('', {groupId: grpId})
        })
      })
    })
  },
  // addUserToGroup - Add new user(s) to existing group
  addUserToGroup: function(pool, grpId, users, cb){
    var relSql = `insert into groups_has_users set ?`
    var newRel = []

    pool.getConnection(function(getConnectionErr, connection){
      if (getConnectionErr){
        dbErr("addUserToGroup:getConnection", getConnectionErr)
        cb(`Unable to get connection`,'')
      }

      for (let i = 0; i < users.length; i++){
        // newRel.push({group_id: pool.escape(grpId), user_id: pool.escape(users[i])})
        newRel.push({group_id: grpId, user_id: users[i]})
      }
      connection.query(relSql, newRel, function(relQueryErr, results, fields){
        connection.release()
        if (relQueryErr){
          dbErr("addUserToGroup:InsertRelation", relQueryErr)
          cb(`Unable to add relationship`, '')
        }

        cb('', {groupId: grpId})
      })
    })
  },
  // delUserFromGroup - remove user(s) from existing group
  delUserFromGroup: function(pool, grpId, users, cb){

  },
  // delGroup - remove existing group(s)
  delGroup: function(pool, grpId, cb){

  },
  // validateGroupName - validate the group name sent from the front-end
  validateGroupName: function(name){
    return /[^0-9a-zA-Z]+/.test(name)
  }
}
