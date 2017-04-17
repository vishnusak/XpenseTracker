// server file which ties in all the components of the system: the routes and db components and static folders

// express framework
// body-parser for parsing req/resps
// path for handling file system paths
var express = require('express'),
    bp      = require('body-parser'),
    path    = require('path')

// port on which the server will listen
const PORT  = 5000

var app     = express()

// setup the static forlders to be used
app.use(express.static(path.join(__dirname, '/client/static')))
app.use(express.static(path.join(__dirname, '/client/partials')))
app.use(express.static(path.join(__dirname, '/bower_components')))

// setup the body parser to be used
// - parse url-encoded req/resp
// - parse json
app.use(bp.urlencoded({extended: true}))
app.use(bp.json())

// set up the routes
var routes    = require(path.join(__dirname, '/server/config/route'))
routes(app)

// set up the server to listen on PORT when started
app.listen(PORT, function(){
  console.log(" ")
  console.log("|--------------Main Server--------------|")
  console.log(`| XT Server is up. Listening on ${PORT}    |`)
  console.log("|---------------------------------------|")
})
