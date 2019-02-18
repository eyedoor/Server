var express = require('express');
var router = express.Router();

router.get("/api/people", (req, res, next) => {
    res.json("get people");
});

router.post("/api/people", (req, res, next) => {
    res.json("post people");
});

router.delete("/api/people", (req, res, next) => {
    res.json("delete people");
});

module.exports = router;