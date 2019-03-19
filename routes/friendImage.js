var express = require('express'),
    auth = require('../auth/jwtAuth'),
    fs = require('fs'),
    database = require('../database');

var router = express.Router();
var pool = database.pool;

router.get("/", auth.verifyUser, downloadFriendImage);

function downloadFriendImage(req, res){
    // Send Image as response
    var userId = res.locals.userId;
    var friendId = req.query.friendId;
    if(!friendId) return res.status(400).json({ message: "Friend ID missing"});

    var friendQuery = "SELECT FriendID FROM Friends WHERE UserID = ? AND FriendID = ?";
    var friendImageQuery = "SELECT FilePath FROM FriendImage WHERE FriendID = ?";

    try{    
        pool.query(friendQuery, [userId, friendId], function (err, results, fields) {
            if(err) throw err;
            if(results.length == 0){
                return res.status(404).json({ message: "Friend not found" });
            }

            pool.query(friendImageQuery, [friendId], function (err, results, fields) {
                if(err) throw err;
                if(results.length == 0){
                    return res.status(404).json({ message: "Friend not found" });
                }
                // Return base64 encoding of .png image
                fs.readFile(results[0].FilePath, function(err, data) {
                    if(err) throw err;
                    var base64Image = Buffer.from(data).toString('base64');
                    res.status(200).send(base64Image);
                });
            });
        });
    }catch(err){
        console.log(err);
        res.status(500).send("Application error");
    }
}

module.exports = router;