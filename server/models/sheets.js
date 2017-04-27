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
  addSheet: function(pool, userId, sheetName, cb){
    let sheetSql  = `insert into sheets set ?`
    let newSheet  = {creator_id: userId, sheetName: sheetName}

    pool.getConnection(function(getConnectionErr, connection){
      if (getConnectionErr){
        dbErr("addSheet:getConnection", getConnectionErr)
        cb(`Unable to get connection`,'')
      }

      connection.query(sheetSql, newSheet, function(sheetQueryErr, addSheetResults, fields){
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
          cb('', {sheetid: addSheetResults.insertId})
        }
      })
    })
  },

  // getSheetId - get sheetIds for a given group
  getSheetId: function(pool, grpId, cb){
    let getSheetIdSql = `select sheet_id from sheets where group_id = ${grpId}`

    pool.getConnection(function(getConnectionErr, connection){
      if (getConnectionErr){
        dbErr("getSheetId:getConnection", getConnectionErr)
        cb(`Unable to get connection`,'')
      }

      connection.query(getSheetIdSql, function(getSheetIdErr, sheetIds, fields){
        connection.release()
        if (getSheetIdErr){
          dbErr("getSheetId:SheetID", getSheetIdErr)
          var msg = ''
          switch (getSheetIdErr['code']){
            case 'ER_DUP_ENTRY':
              msg = `Sheet already exists.`
              break
            default:
              msg = `Failed to retrive sheetIds`
          }
          cb(msg, '')
        } else {
          cb('', {sheetIds: sheetIds})
        }
      })
    })
  },

  // updateSheet - update sheet name for given id
  updateSheet: function(pool, sheetId, sheetUpdate, cb){
    let updateSql    = `update sheets set ? where sheet_id in (${sheetId})`

    pool.getConnection(function(getConnectionErr, connection){
      if (getConnectionErr){
        dbErr("updateSheet:getConnection", getConnectionErr)
        cb(`Unable to get connection`,'')
      }

      connection.query(updateSql, sheetUpdate, function(updateSheetQueryErr, updatedSheet, fields){
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
          cb('', {sheetid: updatedSheet.insertId})
        }
      })
    })
  },

  // delSheetGrp - remove a specific sheet from a specific group. Set the group_id = NULL
  delSheetGrp: function(pool, sheetId, cb){
    let delSheetGrpSql = `update sheets set group_id = NULL where sheet_id in (${sheetId})`

    pool.getConnection(function(getConnectionErr, connection){
      if (getConnectionErr){
        dbErr("delSheetGrp:getConnection", getConnectionErr)
        cb(`Unable to get connection`,'')
      }

      connection.query(delSheetGrpSql, function(delSheetGrpQueryErr, updatedSheet, fields){
        connection.release()
        if (delSheetGrpQueryErr){
          dbErr("delSheetGrp:UpdateSheet", delSheetGrpQueryErr)
          var msg = ''
          switch (delSheetGrpQueryErr['code']){
            case 'ER_DUP_ENTRY':
              msg = `Sheet already exists.`
              break
            default:
              msg = `Failed to update sheet`
          }
          cb(msg, '')
        } else {
          cb('', {sheetid: updatedSheet.insertId})
        }
      })
    })
  },

  // deleteSheet - delete a specific sheet based on sheet id
  deleteSheet: function(pool, sheetId, cb){
    let deleteSql    = `delete from sheets where sheet_id = ${sheetId}`

    pool.getConnection(function(getConnectionErr, connection){
      if (getConnectionErr){
        dbErr("deleteSheet:getConnection", getConnectionErr)
        cb(`Unable to get connection`,'')
      }

      connection.query(deleteSql, function(deleteSheetQueryErr, delSheetResults, fields){
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
          cb('', {sheetid: delSheetResults.insertId})
        }
      })
    })
  },

  // validateName - validate the name field(s) sent from the front-end
  validateName: function(name){
    return /[^0-9a-zA-Z]+/.test(name)
  }
}
