// EXPENSES model for XT system
console.log()
console.log("|-------------EXPENSES Model------------|")
console.log(`| XT - EXPENSES queries loaded          |`)
console.log("|---------------------------------------|")

// Server-side DB error logging
function dbErr(action, err){
  console.log(`***************************************`)
  console.log(`* !! Error in EXPENSES -> Queries !!  *`)
  console.log(`***************************************`)
  console.log(`Event: ${action}                       `)
  console.log()
  console.log(`${err}`)
  console.log(`***************************************`)
}

// all CRUD operations will be passed the connection pool variable along with the other parameters necessary
module.exports = {
  // addExpense - insert a new expense detail into the table with given sheet id
  addExpense: function(pool, expense, cb){
    var expenseSql  = `insert into expenses set ?`
    var newExpense  = {
      day         : expense['day'],
      month       : expense['month'],
      year        : expense['year'],
      category    : expense['category'],
      subcategory : expense['subcategory'],
      amount      : expense['amount'],
      paymentType : expense['mode'],
      card        : expense['cardtype'],
      notes       : expense['notes'],
      sheet_id    : expense['sheetId']
    }

    pool.getConnection(function(getConnectionErr, connection){
      if (getConnectionErr){
        dbErr("addExpense:getConnection", getConnectionErr)
        cb(`Unable to get connection`,'')
      }

      connection.query(expenseSql, newExpense, function(expenseQueryErr, results, fields){
        connection.release()
        if (expenseQueryErr){
          dbErr("addExpense:InsertExpense", expenseQueryErr)
          var msg = ''
          switch (expenseQueryErr['code']){
            case 'ER_DUP_ENTRY':
              msg = `Expense already exists.`
              break
            default:
              msg = `Failed to add expense`
          }
          cb(msg, '')
        } else {
          cb('', {expense_id: results.insertId})
        }
      })
    })
  },

  // updateExpense - update a specific expense detail
  updateExpense: function(pool, expense, cb){
    var updateExpSql  = `update expenses set ? where expense_id = ${expense['expenseId']} and sheet_id = ${expense['sheetId']}`
    var updatedExpense  = {
      day         : expense['day'],
      month       : expense['month'],
      year        : expense['year'],
      category    : expense['category'],
      subcategory : expense['subcategory'],
      amount      : expense['amount'],
      paymentType : expense['mode'],
      card        : expense['cardtype'],
      notes       : expense['notes']
    }

    pool.getConnection(function(getConnectionErr, connection){
      if (getConnectionErr){
        dbErr("updateExpense:getConnection", getConnectionErr)
        cb(`Unable to get connection`,'')
      }

      connection.query(updateExpSql, updatedExpense, function(updateQueryErr, results, fields){
        connection.release()
        if (updateQueryErr){
          dbErr("updateExpense:UpdateExpense", updateQueryErr)
          var msg = ''
          switch (updateQueryErr['code']){
            case 'ER_DUP_ENTRY':
              msg = `Expense already exists.`
              break
            default:
              msg = `Failed to update expense`
          }
          cb(msg, '')
        } else {
          cb('', {expense_id: results.insertId})
        }
      })
    })
  },

  // deleteExpense - delete a specific expense row
  deleteExpense: function(pool, expenseId, cb){
    var deleteExpSql  = `delete from expenses where expense_id = ${expenseId}`

    pool.getConnection(function(getConnectionErr, connection){
      if (getConnectionErr){
        dbErr("deleteExpense:getConnection", getConnectionErr)
        cb(`Unable to get connection`,'')
      }

      connection.query(deleteExpSql, function(deleteQueryErr, results, fields){
        connection.release()
        if (deleteQueryErr){
          dbErr("deleteExpense:DeleteExpense", deleteQueryErr)
          var msg = ''
          switch (deleteQueryErr['code']){
            case 'ER_DUP_ENTRY':
              msg = `Expense already exists.`
              break
            default:
              msg = `Failed to delete expense`
          }
          cb(msg, '')
        } else {
          cb('', {expense_id: results.insertId})
        }
      })
    })
  },

  // getExpenses - get all expenses for a given month and sheetid
  getExpenses: function(pool, year, mon, sheetId, cb){
    var getExSql  = `select expense_id, day, month, year, category, subcategory, amount, paymentType as mode, card as cardtype, notes, sheet_id from expenses where year = ${year} and month = ${mon} and sheet_id = ${sheetId}`

    pool.getConnection(function(getConnectionErr, connection){
      if (getConnectionErr){
        dbErr("getExpenses:getConnection", getConnectionErr)
        cb(`Unable to get connection`,'')
      }

      connection.query(getExSql, function(getExQueryErr, expenses, fields){
        connection.release()
        if (getExQueryErr){
          dbErr("getExpenses:SelectExpense", getExQueryErr)
          var msg = ''
          switch (getExQueryErr['code']){
            case 'ER_DUP_ENTRY':
              msg = `Expense already exists.`
              break
            default:
              msg = `Failed to extract all expenses`
          }
          cb(msg, '')
        } else {
          cb('', expenses)
        }
      })
    })
  },

  // getYears - get the list of years for a given sheetid
  getYears: function(pool, sheetId, cb){
    var getYearsSql  = `select distinct(year) as year from expenses where sheet_id = ${sheetId} order by year desc`

    pool.getConnection(function(getConnectionErr, connection){
      if (getConnectionErr){
        dbErr("getYears:getConnection", getConnectionErr)
        cb(`Unable to get connection`,'')
      }

      connection.query(getYearsSql, function(getYearsQueryErr, years, fields){
        connection.release()
        if (getYearsQueryErr){
          dbErr("getYears:SelectYears", getYearsQueryErr)
          var msg = ''
          switch (getYearsQueryErr['code']){
            case 'ER_DUP_ENTRY':
              msg = `Expense already exists.`
              break
            default:
              msg = `Failed to extract all years`
          }
          cb(msg, '')
        } else {
          cb('', years)
        }
      })
    })
  },

  // getCategory - get the list of all categories for a given sheetid
  getCategory: function(pool, sheetId, cb){
    var getCatSql  = `select distinct(category) as category from expenses where sheet_id = ${sheetId} order by category`

    pool.getConnection(function(getConnectionErr, connection){
      if (getConnectionErr){
        dbErr("getCategory:getConnection", getConnectionErr)
        cb(`Unable to get connection`,'')
      }

      connection.query(getCatSql, function(getCatQueryErr, categories, fields){
        connection.release()
        if (getCatQueryErr){
          dbErr("getCategory:SelectCategories", getCatQueryErr)
          var msg = ''
          switch (getCatQueryErr['code']){
            case 'ER_DUP_ENTRY':
              msg = `Expense already exists.`
              break
            default:
              msg = `Failed to extract all categories`
          }
          cb(msg, '')
        } else {
          cb('', categories)
        }
      })
    })
  },

  // getSubCategory - get the list of all subcategories for a given sheetid
  getSubCategory: function(pool, sheetId, cb){
    var getSubCatSql  = `select distinct(subcategory) as subcategory from expenses where sheet_id = ${sheetId} order by subcategory`

    pool.getConnection(function(getConnectionErr, connection){
      if (getConnectionErr){
        dbErr("getSubCategory:getConnection", getConnectionErr)
        cb(`Unable to get connection`,'')
      }

      connection.query(getSubCatSql, function(getSubCatQueryErr, subcategories, fields){
        connection.release()
        if (getSubCatQueryErr){
          dbErr("getSubCategory:SelectSubCategories", getSubCatQueryErr)
          var msg = ''
          switch (getSubCatQueryErr['code']){
            case 'ER_DUP_ENTRY':
              msg = `Expense already exists.`
              break
            default:
              msg = `Failed to extract all subcategories`
          }
          cb(msg, '')
        } else {
          cb('', subcategories)
        }
      })
    })
  }
}
