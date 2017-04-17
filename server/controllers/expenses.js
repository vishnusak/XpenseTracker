// expenses Controller
console.log()
console.log("|-----------Expenses Controller---------|")
console.log(`| XT - Expenses Controller loaded       |`)
console.log("|---------------------------------------|")

// import the db query object required.
var Expenses  = require('../models/expenses')

// Export the Expenses controller methods
module.exports = function(pool, fn){
  switch (fn){
    case 'add':
    // Add a new expense detail
      return function(req, res){
        let year   = req.body['year'],
            month  = req.body['month'],
            sheetId= req.body['sheetId']
        Expenses.addExpense(pool, req.body, function(err, addExpense){
          if (err){
            res.json({error: err})
          } else {
            Expenses.getExpenses(pool, year, month, sheetId, function(err, updatedExpenses){
              if (err){
                res.json({error: err})
              } else {
                res.json({expenses: updatedExpenses})
              }
            })
          }
        })
      }
      break
    case 'update':
    // update the given expense detail
      return function(req, res){
        let year   = req.body['year'],
            month  = req.body['month'],
            sheetId= req.body['sheetId']
        Expenses.updateExpense(pool, req.body, function(err, updatedExpense){
          if (err){
            res.json({error: err})
          } else {
            Expenses.getExpenses(pool, year, month, sheetId, function(err, updatedExpenses){
              if (err){
                res.json({error: err})
              } else {
                res.json({expenses: updatedExpenses})
              }
            })
          }
        })
      }
      break
    case 'delete':
    // delete the given expense detail
      return function(req, res){
        let year   = req.params['year'],
            month  = req.params['month'],
            sheetId= req.params['sheetid']
        Expenses.deleteExpense(pool, req.params['expenseid'], function(err, updatedExpense){
          if (err){
            res.json({error: err})
          } else {
            Expenses.getExpenses(pool, year, month, sheetId, function(err, updatedExpenses){
              if (err){
                res.json({error: err})
              } else {
                res.json({expenses: updatedExpenses})
              }
            })
          }
        })
      }
      break
    case 'get':
    // get all expenses for a given year, month and sheetid. If yearlist is true, get list of years
      return function(req, res){
        let year    = req.params['year'],
            month   = req.params['month'],
            sheetId = req.params['sheetid'],
            list    = req.params['list']
        Expenses.getExpenses(pool, year, month, sheetId, function(err, allExpenses){
          if (err){
            res.json({error: err})
          } else {
            if (list){
              Expenses.getYears(pool, sheetId, function(err, years){
                if (err){
                  res.json({error: err})
                } else {
                  Expenses.getCategory(pool, sheetId, function(err, categories){
                    if (err){
                      res.json({error: err})
                    } else {
                      Expenses.getSubCategory(pool, sheetId, function(err, subcategories){
                        if (err){
                          res.json({error: err})
                        } else {
                          res.json({expenses: allExpenses, years: years, categories: categories, subcategories: subcategories})
                        }
                      })
                    }
                  })
                }
              })
            } else {
              res.json({expenses: allExpenses})
            }
          }
        })
      }
      break
  }
}
