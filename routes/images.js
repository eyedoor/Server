var express = require('express');
var router = express.Router();

router.get("/", (req, res, next) => {
    res.json("get images");
});

router.post("/", (req, res, next) => {
    res.json("post images");
});

module.exports = router;