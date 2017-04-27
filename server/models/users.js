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
    let sqlUsers    = `insert into users set ?`

    bcrypt.hash(register['password'], 10, function(hashErr, hash){
      if (hashErr){
        dbErr("addNewUser:bcrypt", hashErr)
        cb(`Unable to hash the password`, '')
      } else {
        register['password'] = hash

        pool.getConnection(function(getConnectionErr, connection){
          if (getConnectionErr){
            dbErr("addNewUser:getConnection", getConnectionErr)
            cb(`Unable to get connection`,'')
          } else {
            connection.query(sqlUsers, register, function(userQueryErr, addNewUserResults, userFields){
              connection.release()
              if (userQueryErr){
                dbErr("addNewUser:InsertUser", userQueryErr)
                cb(`Unable to run user query`, '')
              } else {
                cb('', addNewUserResults)
              }
            })
          }
        })
      }
    })
  },
  // getUser - get a user's information based on username or email.
  getUser: function(pool, user, cb){
    let sql = `select u.user_id, u.firstName, u.lastName, u.email, u.userName, u.password from users u where (u.userName = '${user}' or u.email = '${user}')`

    pool.getConnection(function(getConnectionErr, connection){
      if (getConnectionErr){
        dbErr("getUser:getConnection", getConnectionErr)
        cb(`Unable to get connection`,'')
      }

      connection.query(sql,function(queryErr, getUserResults, fields){
        connection.release()
        if (queryErr){
          dbErr("getUser:Query", queryErr)
          cb(`Unable to getUser`, '')
        } else if (getUserResults.length == 0){
          cb(`User not found`, '')
        } else {
          cb('', getUserResults[0])
        }
      })
    })
  },
  // getUserById - get a user's information based on id
  getUserById: function(pool, id, cb){
    let sql = `select u.user_id, u.firstName, u.lastName, u.email, u.userName from users u where u.user_id = ${id}`

    pool.getConnection(function(getConnectionErr, connection){
      if (getConnectionErr){
        dbErr("getUserById:getConnection", getConnectionErr)
        cb(`Unable to get connection`,'')
      }

      connection.query(sql,function(queryErr, getUserByIdResults, fields){
        connection.release()
        if (queryErr){
          dbErr("getUserById:Query", queryErr)
          cb(`Unable to getUserById`, '')
        } else if (getUserByIdResults.length == 0){
          cb(`User not found`, '')
        } else {
          cb('', getUserByIdResults[0])
        }
      })
    })
  },
  // getUserInfo - get a user's group and sheet information based on id
  getUserInfo: function(pool, id, gid, cb){
    let grpSql = `select g.group_id, g.groupName, g.creator_id from groups g, groups_has_users gu where gu.user_id = ${id} and gu.group_id = g.group_id order by g.group_id`
    let sheetSql= `select s.sheet_id, s.sheetName, s.group_id, s.creator_id from sheets s, groups_has_users gu where gu.user_id = ${id} and gu.group_id = s.group_id union select s.sheet_id, s.sheetName, s.group_id, s.creator_id from sheets s where s.creator_id = ${id} order by sheet_id`

    pool.getConnection(function(getConnectionErr, connection){
      if (getConnectionErr){
        dbErr("getUserInfo:getConnection", getConnectionErr)
        cb(`Unable to get connection`,'')
      }

      // this takes into account that the groupSql and sheetSql can return empty resultsets which are valid cases
      connection.query(grpSql,function(grpErr, groups, fields){
        if (grpErr){
          connection.release()
          dbErr("getUserInfo:grpQuery", grpErr)
          cb(`Unable to getUserInfo`, '')
        } else {
          connection.query(sheetSql, function(shtErr, sheets, fields){
            connection.release()
            if (shtErr){
              dbErr("getUserInfo:shtQuery", shtErr)
              cb(`Unable to getUserInfo`, '')
            } else {
              cb('', {groups: groups, sheets: sheets})
            }
          })
        }
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
