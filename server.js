var express = require("express");
const PORT = process.env.PORT || 3000;

// Route middleware
var images = require("./routes/images"),
    users = require("./routes/users"),
    events = require("./routes/events"),
    login = require("./routes/login"),
    people = require("./routes/people");

var app = express();

// Assign routes
app.use('/login', login);
app.use('/users', users);
app.use('/events', events);
app.use('/people', people);
app.use('/images', images);

app.listen(PORT, () => {
    console.log("Server is listenting on port " + PORT);
});