var express = require('express');
var router = express.Router();

router.get("/", (req, res, next) => {
    res.json("get people");
});

router.post("/", (req, res, next) => {
    res.json("post people");
});

router.delete("/", (req, res, next) => {
    res.json("delete people");
});

module.exports = router;