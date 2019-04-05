var express = require('express'),
    userAuth = require('../auth/jwtAuth').verifyUser,
    database = require("../database");

var router = express.Router();
var pool = database.pool;

router.use(express.json());
router.use(userAuth);

router.get("/", getEventList);
router.get("/friends", getEventFriends);

// Return users a list of event IDs and timestamps to verify against internal ledger
function getEventList(req, res){
    var userId = res.locals.userId;
    var query = "SELECT EventID, Timesent FROM Event WHERE UserID = ? order by EventID DESC";

    pool.query(query, [userId], function (err, results, fields) {
        if(err){
            res.status(500).send("Database error");
            return console.log(err);
        }

        res.status(200).json(results);
    });    
}

// Get events that friend appeared in
function getEventFriends(req, res){
    var userId = res.locals.userId;
    var eventId = req.query.eventId;
    if(!eventId) return res.status(400).json({auth: true, message: "Missing Event Id"});

    var query = "SELECT t1.FriendFirst, t1.FriendLast, t1.FriendID FROM Friends t1 "+
    "JOIN FriendEvent t2 ON (t2.FriendID = t1.FriendID) WHERE UserID = ? AND EventID = ?";

    pool.query(query, [userId, eventId], function (err, results, fields) {
        if(err){
            res.status(500).send("Database error");
            return console.log(err);
        }

        res.status(200).json(results);
    });
}

module.exports = router;