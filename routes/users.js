var express = require('express');
var router = express.Router();

router.post("/api/users", (req, res, next) => {
    res.json("post users");
});

router.put("/api/users", (req, res, next) => {
    res.json("put users");
});

module.exports = router;