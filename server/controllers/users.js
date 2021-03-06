// users Controller
console.log()
console.log("|-------------Users Controller----------|")
console.log(`| XT - Users Controller loaded          |`)
console.log("|---------------------------------------|")

// import the db query object required.
var Users  = require('../models/users')

// Export the Users controller methods
module.exports = function(pool, fn){
  switch (fn){
    case 'registration':
    // Add a new user - user registration
      return function(req, res){
        // validate the fields
        if (Users.validateName(req.body['firstName'])){
          res.json({error: `First name is invalid`})
        } else if (Users.validateName(req.body['lastName'])){
          res.json({error: `Last name is invalid`})
        } else if (!Users.validateEmail(req.body['email'])){
          res.json({error: `Email is invalid`})
        } else if (!Users.validatePwd(req.body['password'], req.body['cpassword'])){
          res.json({error: `Password is invalid`})
        } else {
          var newUser = {
            firstName: req.body['firstName'],
            lastName : req.body['lastName'],
            email    : req.body['email'],
            password : req.body['password'],
            userName : req.body['userName']
          }
          Users.addNewUser(pool, newUser, function(err, signedUpUser){
            if (err){
              res.json({error: err})
            } else {
              Users.getUserById(pool, signedUpUser.insertId, function(err, user){
                if (err){
                  res.json({error: err})
                } else {
                  res.json(user)
                }
              })
            }
          })
        }
      }
      break
    case 'login':
    // Existing user. User Login
      return function(req, res){
        Users.getUser(pool, req.body['userName'], function(err, user){
          if (err){
            res.json({error: err})
          } else {
            var existingPwd = user['password']
            Users.chkPwd(req.body['password'], existingPwd, function(err){
              if (err){
                res.json({error: err})
              } else {
                res.json(user)
              }
            })
          }
        })
      }
      break
    case 'start':
    // Get the details about specific user
      return function(req, res){
        var userId = req.params['userid'],
            groupId= req.params['groupid']

        Users.getUserInfo(pool, userId, groupId, function(err, info){
          if (err){
            res.json({error: err})
          } else {
            res.json(info)
          }
        })
      }
      break
    case 'friend':
    // return the email id and userid of the friend to be added in the group
      return function(req, res){
        Users.getUser(pool, req.params['email'], function(err, info){
          if (err){
            res.json({error: err})
          } else {
            res.json({friendId: info['user_id']})
          }
        })
      }
      break
    case 'update':
    // update the user's profile info
      return function(req, res){
        let id = req.body['user_id']
        switch (req.body['action']){
          case 'profile':
            let updatedUserData = {
              firstName: req.body['firstName'],
              lastName : req.body['lastName'],
              email    : req.body['email'],
              userName : req.body['userName']
            }
            Users.updateUser(pool, id, updatedUserData, function(err, updatedUser){
              if (err){
                res.json({error: err})
              } else {
                res.json({user_id: updatedUser})
              }
            })
            break
          case 'password':
            Users.getUserPwdById(pool, id, function(err, userPwd){
              if (err){
                res.json({error: err})
              } else {
                var existingPwd = userPwd
                Users.chkPwd(req.body['curPwd'], existingPwd, function(err){
                  if (err){
                    res.json({error: `Current Password mismatch`})
                  } else {
                    if (!Users.validatePwd(req.body['newPwd'], req.body['cnewPwd'])){
                      res.json({error: `Passsword must have atleast 1 each of UC, LC, Number, Special character(~!@#$%^&*)`})
                    } else {
                      Users.updateUserPwd(pool, id, req.body['newPwd'], function(err, updUser){
                        if (err){
                          res.json({error: err})
                        } else {
                          res.json({user_id: id})
                        }
                      })
                    }
                  }
                })
              }
            })
            break
        }
      }
      break
  }
}
