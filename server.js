var express = require("express");

// Route middleware
var images = require("./routes/images"),
	users = require("./routes/users"),
	events = require("./routes/events"),
	login = require("./routes/login"),
	people = require("./routes/people");

var app = express();

// Assign routes
app.use('/api/login', login);
app.use('/api/users', users);
app.use('/api/events', events);
app.use('/api/people', people);
app.use('/api/images', images);

app.listen(3000, () => {
	console.log("Server running on port 3000");
});