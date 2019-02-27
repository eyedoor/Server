var express = require('express'),
    auth = require('../auth/jwtAuth'),
    database = require("../database");

var router = express.Router();
var pool = database.pool;

router.use(express.json());
router.use(auth);

router.get("/", getEventList);

// Return users a list of event IDs and timestamps to verify against internal ledger
function getEventList(req, res){
    var userId = res.locals.userId;

    try{
        pool.query("SELECT EventID, Timesent FROM Event WHERE UserID = ?", [userId], function (err, results, fields) {
            if(err) throw err;
            res.status(200).json(results);
        });
    }catch(err){
        console.log(err);
        res.status(500).send("Database error");
    }
}

module.exports = router;