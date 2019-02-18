var express = require('express');
var router = express.Router();

router.get("/api/events", (req, res, next) => {
    res.json("get events");
});

module.exports = router;