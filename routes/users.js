var express = require('express');
var router = express.Router();

router.post("/", (req, res, next) => {
    res.json("post users");
});

router.put("/", (req, res, next) => {
    res.json("put users");
});

module.exports = router;