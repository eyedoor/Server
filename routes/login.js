var express = require('express');
var router = express.Router();

router.post("/", (req, res, next) => {
    res.json("post login");
});

module.exports = router;