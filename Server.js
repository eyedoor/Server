var credentials = require("./credentials/credentials");
var mysql = require("mysql");
var express = require("express");

// Route middleware
var images = require("./routes/images");
var users = require("./routes/users");
var events = require("./routes/events");
var login = require("./routes/login");
var people = require("./routes/people");

var app = express();
var router = express.Router();

app.listen(3000, () => {
 console.log("Server running on port 3000");
});

//Database connection
app.use(function(req, res, next){
	res.locals.connection = mysql.createConnection({
		host     : credentials.db.host,
		user     : credentials.db.user,
		password : credentials.db.password,
		database : credentials.db.database
	});
	res.locals.connect();
	next();
});

app.use('/api/login', login);
app.use('/api/users', users);
app.use('/api/events', events);
app.use('/api/people', people);
app.use('/api/images', images);