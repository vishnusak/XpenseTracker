// routes file for the XT system
console.log()
console.log("|------------Routes Config--------------|")
console.log(`| XT Routes are loaded                  |`)
console.log("|---------------------------------------|")

// for handling file system paths
var path          = require('path')

// setup the db connection
const DB          = 'xt' // the name of the database
var dbConnectPool = require(path.join(__dirname, '/db'))(DB)

// Bring in the necessary controllers
// users - handle user login/registration
// groups - handle creating/managing groups
// sheets - handle creating/managing sheets
// expenses - handle creating/managing expense details
var users  = require('../controllers/users')
var groups = require('../controllers/groups')
var sheets = require('../controllers/sheets')
var expenses = require('../controllers/expenses')

// routes to be exported
module.exports = function(app){
  app.post('/login', users(dbConnectPool, 'login'))
  app.post('/register', users(dbConnectPool, 'registration'))
  app.get('/start/:userid-:groupid', users(dbConnectPool, 'start'))
  app.get('/users/:email', users(dbConnectPool, 'friend'))

  app.post('/sheet', sheets(dbConnectPool, 'new'))
  app.put('/sheet', sheets(dbConnectPool, 'update'))
  app.delete('/sheet/:sheetid', sheets(dbConnectPool, 'delete'))

  app.post('/expense', expenses(dbConnectPool, 'add'))
  app.put('/expense', expenses(dbConnectPool, 'update'))
  app.delete('/expense/:sheetid-:year-:month-:expenseid', expenses(dbConnectPool, 'delete'))
  app.get('/expense/:sheetid-:year-:month-:list', expenses(dbConnectPool, 'get'))

  app.post('/group', groups(dbConnectPool, 'add'))
  app.post('/adduser', groups(dbConnectPool, 'adduser'))
}
