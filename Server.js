var express = require("express");
var app = express();

app.listen(3000, () => {
 console.log("Server running on port 3000");
});

//GET

app.get("/api/images", (req, res, next) => {
    res.json("get images");
});

app.get("/api/people", (req, res, next) => {
    res.json("get people");
});

//POST

app.post("/api/login", (req, res, next) => {
    res.json("post login");
});

app.post("/api/images", (req, res, next) => {
    res.json("post images");
});

app.post("/api/users", (req, res, next) => {
    res.json("post users");
});

app.post("/api/people", (req, res, next) => {
    res.json("post people");
});

//CREATE

app.put("/api/users", (req, res, next) => {
    res.json("put users");
});

//DELETE

app.delete("/api/people", (req, res, next) => {
    res.json("delete people");
});
