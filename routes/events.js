var express = require('express'),
    userAuth = require('../auth/jwtAuth').verifyUser,
    database = require("../database");

var router = express.Router();
var pool = database.pool;

router.use(express.json());
router.use(userAuth);

router.get("/", getEventList);

// Return users a list of event IDs and timestamps to verify against internal ledger
function getEventList(req, res){
    var userId = res.locals.userId;

    try{
        pool.query("SELECT EventID, Timesent FROM Event WHERE UserID = ? order by EventID DESC", [userId], 
        function (err, results, fields) {
            if(err) throw err;
            res.status(200).json(results);
        });
    }catch(err){
        console.log(err);
        res.status(500).send("Database error");
    }
}

module.exports = router;