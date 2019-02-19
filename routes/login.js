var express = require('express'),
    database = require("../database");

var router = express.Router();

router.post("/", (req, res, next) => {
    res.json("post login");
});

module.exports = router;