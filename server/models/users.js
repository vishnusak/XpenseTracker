// USERS model for XT system
console.log()
console.log("|--------------USERS Model--------------|")
console.log(`| XT - USERS Queries loaded             |`)
console.log("|---------------------------------------|")

// import bcrypt for encryption/decryption
var bcrypt      = require('bcrypt')

// Server-side DB error logging
function dbErr(action, err){
  console.log(`***************************************`)
  console.log(`*   !! Error in USERS -> Queries !!   *`)
  console.log(`***************************************`)
  console.log(`Event: ${action}                       `)
  console.log()
  console.log(`${err}`)
  console.log(`***************************************`)
}

// all CRUD operations will be passed the connection pool variable along with the other parameters necessary
module.exports = {
  // addNewUser - handle inserting the new user from the registration screen. the 'register' object will have firstName, lastName, email, userName, password
  addNewUser: function(pool, register, cb){
    var sqlUsers    = `insert into users set ?`
    var sqlGroups   = `insert into groups set ?`
    var sqlRelation = `insert into groups_has_users set ?`

    bcrypt.hash(register['password'], 10, function(hashErr, hash){
      if (hashErr){
        dbErr("addNewUser:bcrypt", hashErr)
        cb(`Unable to hash the password`, '')
      }
      register['password'] = hash

      pool.getConnection(function(getConnectionErr, connection){
        if (getConnectionErr){
          dbErr("addNewUser:getConnection", getConnectionErr)
          cb(`Unable to get connection`,'')
        }

        connection.query(sqlUsers, register, function(userQueryErr, userResults, userFields){
          if (userQueryErr){
            connection.release()
            dbErr("addNewUser:InsertUser", userQueryErr)
            cb(`Unable to run user query`, '')
          }
          // After inserting the new user, insert a new record in the 'groups' table. Every new user will automatically get a self-named group created.
          connection.query(sqlGroups, {groupName: register.userName}, function(grpQueryErr, grpResults, grpFields){
            if (grpQueryErr){
              connection.release()
              dbErr("addNewUser:InsertGroup", grpQueryErr)
              cb(`Unable to run group query`, '')
            }
            // After inserting the new group, insert a new record in the 'groups_has_users' table to maintain the relationship.
            connection.query(sqlRelation, {group_id: grpResults.insertId, user_id: userResults.insertId}, function(relQueryErr, relResults, relFields){
              connection.release()
              if (relQueryErr){
                dbErr("addNewUser:InsertRelation", relQueryErr)
                cb(`Unable to run relation query`, '')
              }
              cb('', userResults)
            })
          })
        })
      })
    })
  },
  // getUser - get a user's information based on username or email.
  getUser: function(pool, user, cb){
    // var user = pool.escape(user)
    var sql = `select u.user_id, u.firstName, u.lastName, u.email, u.userName, u.password, g.group_id from users u, groups g where (u.userName = '${user}' or u.email = '${user}') and g.groupName = u.userName`

    pool.getConnection(function(getConnectionErr, connection){
      if (getConnectionErr){
        dbErr("getUser:getConnection", getConnectionErr)
        cb(`Unable to get connection`,'')
      }

      connection.query(sql,function(queryErr, results, fields){
        connection.release()
        if (queryErr){
          dbErr("getUser:Query", queryErr)
          cb(`Unable to getUser`, '')
        } else if (results.length == 0){
          cb(`User not found`, '')
        } else {
          cb('', results[0])
        }
      })
    })
  },
  // getUserById - get a user's information based on id
  getUserById: function(pool, id, cb){
    // var id = pool.escape(id)
    var sql = `select u.user_id, u.firstName, u.lastName, u.email, u.userName, g.group_id from users u, groups g where u.user_id = ${id} and g.groupName = u.userName`
    pool.getConnection(function(getConnectionErr, connection){
      if (getConnectionErr){
        dbErr("getUserById:getConnection", getConnectionErr)
        cb(`Unable to get connection`,'')
      }

      connection.query(sql,function(queryErr, results, fields){
        connection.release()
        if (queryErr){
          dbErr("getUserById:Query", queryErr)
          cb(`Unable to getUserById`, '')
        } else if (results.length == 0){
          cb(`User not found`, '')
        } else {
          cb('', results[0])
        }
      })
    })
  },
  // getUserInfo - get a user's group and sheet information based on id
  getUserInfo: function(pool, id, cb){
    // var id     = pool.escape(id)
    var grpSql = `select g.group_id, g.groupName from groups g, groups_has_users gu where gu.user_id = ${id} and gu.group_id = g.group_id`
    var sheetSql= `select s.sheet_id, s.sheetName, s.group_id, s.user_id from sheets s, groups_has_users gu where gu.user_id = ${id} and gu.group_id = s.group_id`

    pool.getConnection(function(getConnectionErr, connection){
      if (getConnectionErr){
        dbErr("getUserInfo:getConnection", getConnectionErr)
        cb(`Unable to get connection`,'')
      }

      connection.query(grpSql,function(grpErr, results, fields){
        if (grpErr){
          connection.release()
          dbErr("getUserInfo:grpQuery", grpErr)
          cb(`Unable to getUserInfo`, '')
        } else if (results.length == 0){
          cb(`Groups not found`, '')
        } else {
          var groups = results
          connection.query(sheetSql, function(shtErr, results, fields){
            connection.release()
            if (shtErr){
              dbErr("getUserInfo:shtQuery", shtErr)
              cb(`Unable to getUserInfo`, '')
            } else {
              // this takes into account that the sheetSql can return an empty resultset which is a valid case
              var sheets = results
              cb('', {groups: groups, sheets: sheets})
            }
          })
        }
      })
    })
  },
  // getAllUsers - get a list of all users in the system
  getAllUsers: function(pool, cb){
    var sql = `select user_id, email from users`

    pool.getConnection(function(getConnectionErr, connection){
      if (getConnectionErr){
        dbErr("getAllUsers:getConnection", getConnectionErr)
        cb(`Unable to get connection`,'')
      }

      connection.query(sql, function(queryErr, results, fields){
        connection.release()
        if (queryErr){
          dbErr("getAllUsers:Query", queryErr)
          cb(`Unable to get users`,'')
        }

        cb('', {users: results})
      })
    })
  },
  // validateName - validate the name field(s) sent from the front-end
  validateName: function(name){
    return /[^0-9a-zA-Z]+/.test(name)
  },
  // validateEmail - validate the email value sent from the front-end. considering only alphanumeric emails with dot, dash, underscore as valid. I am not considering spaces or any other special characters allowed as per the RFC 2822 standard. Also not considering ip addresses for the domain.
  validateEmail: function(email){
    // it should have only one '@' character
    if (email.split('@').length != 2){ return false }

    [local, domain] = email.split('@')

    // the local string is not empty
    if (!local){ return false }

    // the local string shouldn't start or end with a . (dot)
    if (/^\./.test(local) || /\.$/.test(local)){ return false }

    // Check for the allowed combination of characters (alpha, nemeric, dot dash, underscore)
    if (!/^[0-9a-zA-Z_\.\-]+$/.test(local)){ return false }

    // the domain string is not empty
    if (!domain){ return false }

    // the domain string must have atleast 1 dot
    if (domain.split('.').length < 2){ return false }

    // the domain string shouldn't start or end with a dash or dot
    if (/^\-|^\./.test(domain) || /\-$|\.$/.test(domain)){ return false }

    var domainStrings = domain.split('.')
    for (i in domainStrings){
      if (!/^[0-9a-zA-Z\-]+$/.test(domainStrings[i])){ return false }
    }

    return true
  },
  // validatePwd - validate the password/confirmation password sent from front-end. Passsword should have atleast 1 uppercase, 1 number, and 1 special character (from ~!@#$%^&*)
  validatePwd: function(pwd, cpwd){
    // make sure pwd and cpwd are the same
    if (pwd !== cpwd){ return false }

    // Only alphabets, numbers and special characters (~!@#$%^&*)
    if (/[^0-9a-zA-Z\~\!\@\#\$\%\^\&\*]/.test(pwd)){ return false }

    // Atleast 1 uppercase character
    if (!/[A-Z]/.test(pwd)){ return false }

    // Atleast 1 lowercase character
    if (!/[a-z]/.test(pwd)){ return false }

    // Atleast 1 number
    if (!/[0-9]/.test(pwd)){ return false }

    // Atleast 1 special character
    if (!/[\~\!\@\#\$\%\^\&\*]/.test(pwd)){ return false }

    // If all tests pass
    return true
  },
  // chkPwd - handle the password compare in the login screen.
  chkPwd: function(loginpwd, userpwd, cb){
    bcrypt.compare(loginpwd, userpwd, function(pwdErr, pwdRes){
      if (pwdErr){
        console.log(pwdErr)
        cb(`Password Mismatch`)
      } else {
        cb('')
      }
    })
  }
}
