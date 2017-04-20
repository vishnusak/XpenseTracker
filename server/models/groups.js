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
  addGroup: function(pool, grpName, friends, cb){
    let grpSql  = `insert into groups set ?`
    let newGrp  = {groupName: grpName}
    // need to use the below syntax for insert instead of the "set" syntax because here I will be doing bulk insert
    let relSql  = `insert into groups_has_users (group_id, user_id) values ?`
    // The values passed into the bulk insert must be organized as an array of arrays
    let newRel = []

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
        for (let i = 0; i < friends.length; i++){
          newRel.push([grpId, friends[i]])
        }

        // the values for the bulk insert must be passed to the query as an array.
        // so essentially in the sql it will ook like [[[1,2], [1,3], [1,4], ...]]
        connection.query(relSql, [newRel], function(relQueryErr, results, fields){
          connection.release()
          if (relQueryErr){
            dbErr("addGroup:InsertRelation", relQueryErr)
            cb(`Unable to add relationship`, '')
          } else {
            cb('', {groupId: grpId})
          }
        })
      })
    })
  },
  // addUserToGroup - Add new user(s) to existing group
  addUserToGroup: function(pool, grpId, users, cb){
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

      connection.query(relSql, [newRel], function(relQueryErr, results, fields){
        connection.release()
        if (relQueryErr){
          dbErr("addUserToGroup:InsertRelation", relQueryErr)
          cb(`Unable to add relationship`, '')
        } else {
          cb('', {groupId: grpId})
        }
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
