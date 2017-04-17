// db connection file for the XT system
console.log()
console.log("|--------------DB Config----------------|")
console.log(`| XT DB Setup loaded                    |`)
console.log("|---------------------------------------|")

var mysql      = require('mysql')        // javascript driver for MySQL
                                         // https://github.com/mysqljs/mysql

// establish connection to the mysql server and save it as a function for export
// Use the connection pooling of mysql and set up a pool on initial connection.
module.exports = function(db){
  var pool = mysql.createPool({
    connectionLimit: 25,
    host           : 'localhost',
    user           : 'root',
    password       : '1979',
    database       : db
  })

  return pool
}
