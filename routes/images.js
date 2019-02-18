var express = require('express');
var router = express.Router();

router.get("/api/images", (req, res, next) => {
    res.json("get images");
});

router.post("/api/images", (req, res, next) => {
    res.json("post images");
});

module.exports = router;