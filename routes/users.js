var express = require('express'),
    database = require("../database");

var router = express.Router();

// Create new user
router.post("/", (req, res, next) => {
    console.log(req.query);
    res.json("post users");
});


// Update user info
router.put("/", (req, res, next) => {
    res.json("put users");
});

module.exports = router;