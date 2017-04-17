// sheets Controller
console.log()
console.log("|------------Sheets Controller----------|")
console.log(`| XT - Sheets Controller loaded         |`)
console.log("|---------------------------------------|")

// import the db query object required.
var Sheets  = require('../models/sheets')

// Export the Sheets controller methods
module.exports = function(pool, fn){
  switch (fn){
    case 'new':
    // Add a new sheet
      return function(req, res){
        // validate the sheetName
        if (Sheets.validateName(req.body['sheetName'])){
          res.json({error: `Sheet name is invalid`})
        } else {
          Sheets.addSheet(pool, req.body['groupId'], req.body['userId'], req.body['sheetName'], function(err, newSheet){
            if (err){
              res.json({error: err})
            } else {
              res.json(newSheet)
            }
          })
        }
      }
      break
    case 'update':
    // Update sheet name
      return function(req, res){
        if (Sheets.validateName(req.body['sheetName'])){
          res.json({error: `Sheet name is invalid`})
        } else {
          Sheets.updateSheet(pool, req.body['sheetId'], req.body['sheetName'], function(err, newSheet){
            if (err){
              res.json({error: err})
            } else {
              res.json(newSheet)
            }
          })
        }
      }
      break
    case 'delete':
    // delete a specific sheet. This also cascades the delete to all related expense rows based on foreign key On-Delete Cascade relationship
    return function(req, res){
      Sheets.deleteSheet(pool, req.params['sheetid'], function(err, updatedSheets){
        if (err){
          res.json({error: err})
        } else {
          res.json(updatedSheets)
        }
      })
    }
  }
}
