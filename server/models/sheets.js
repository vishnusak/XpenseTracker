// SHEETS model for XT system
console.log()
console.log("|--------------SHEETS Model-------------|")
console.log(`| XT - SHEETS queries loaded            |`)
console.log("|---------------------------------------|")

// Server-side DB error logging
function dbErr(action, err){
  console.log(`***************************************`)
  console.log(`*   !! Error in SHEETS -> Queries !!  *`)
  console.log(`***************************************`)
  console.log(`Event: ${action}                       `)
  console.log()
  console.log(`${err}`)
  console.log(`***************************************`)
}

// all CRUD operations will be passed the connection pool variable along with the other parameters necessary
module.exports = {
  // addSheet - insert a new sheet into the table with given name and group id
  addSheet: function(pool, groupId, userId, sheetName, cb){
    var sheetSql  = `insert into sheets set ?`
    // var newSheet  = {group_id: pool.escape(groupId), user_id: pool.escape(userId), sheetName: pool.escape(sheetName)}
    var newSheet  = {group_id: groupId, user_id: userId, sheetName: sheetName}

    pool.getConnection(function(getConnectionErr, connection){
      if (getConnectionErr){
        dbErr("addSheet:getConnection", getConnectionErr)
        cb(`Unable to get connection`,'')
      }

      connection.query(sheetSql, newSheet, function(sheetQueryErr, results, fields){
        connection.release()
        if (sheetQueryErr){
          dbErr("addSheet:InsertSheet", sheetQueryErr)
          var msg = ''
          switch (sheetQueryErr['code']){
            case 'ER_DUP_ENTRY':
              msg = `Sheet already exists.`
              break
            default:
              msg = `Failed to create new sheet`
          }
          cb(msg, '')
        } else {
          cb('', {sheetid: results.insertId})
        }
      })
    })
  },

  // updateSheet - update sheet name for given id
  updateSheet: function(pool, sheetId, sheetName, cb){
    var updateSql    = `update sheets set ? where sheet_id = ${sheetId}`
    var updatedSheet = {sheetName: sheetName}

    pool.getConnection(function(getConnectionErr, connection){
      if (getConnectionErr){
        dbErr("updateSheet:getConnection", getConnectionErr)
        cb(`Unable to get connection`,'')
      }

      connection.query(updateSql, updatedSheet, function(updateSheetQueryErr, results, fields){
        connection.release()
        if (updateSheetQueryErr){
          dbErr("updateSheet:UpdateSheet", updateSheetQueryErr)
          var msg = ''
          switch (updateSheetQueryErr['code']){
            case 'ER_DUP_ENTRY':
              msg = `Sheet already exists.`
              break
            default:
              msg = `Failed to update new sheet`
          }
          cb(msg, '')
        } else {
          cb('', {sheetid: results.insertId})
        }
      })
    })
  },

  // deleteSheet - delete a specific sheet based on sheet id
  deleteSheet: function(pool, sheetId, cb){
    var deleteSql    = `delete from sheets where sheet_id = ${sheetId}`

    pool.getConnection(function(getConnectionErr, connection){
      if (getConnectionErr){
        dbErr("deleteSheet:getConnection", getConnectionErr)
        cb(`Unable to get connection`,'')
      }

      connection.query(deleteSql, function(deleteSheetQueryErr, results, fields){
        connection.release()
        if (deleteSheetQueryErr){
          dbErr("deleteSheet:DeleteSheet", deleteSheetQueryErr)
          var msg = ''
          switch (deleteSheetQueryErr['code']){
            case 'ER_DUP_ENTRY':
              msg = `Sheet already exists.`
              break
            default:
              msg = `Failed to delete sheet`
          }
          cb(msg, '')
        } else {
          cb('', {sheetid: results.insertId})
        }
      })
    })
  },

  // validateName - validate the name field(s) sent from the front-end
  validateName: function(name){
    return /[^0-9a-zA-Z]+/.test(name)
  }
}
