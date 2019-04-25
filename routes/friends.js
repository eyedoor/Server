var express = require('express'),
    auth = require('../auth/jwtAuth'),
    fs = require('fs'),
    shortid = require('shortid'),
    database = require('../database'),
    spawn = require("child_process").spawn;

var router = express.Router();
var pool = database.pool;
const NUM_ALLOWED_FRIENDS = 100;

router.get("/", auth.verifyUser, getFriends);
router.post("/", express.json({limit:'1mb'}), auth.verifyUser, createFriend);
router.delete("/", auth.verifyUser, deleteFriend);
router.get("/events", auth.verifyUser, getFriendEvents);

function createFriend(req, res){
    var firstname = req.body.firstname,
        lastname = req.body.lastname,
        base64Data = req.body.image;
    if(!(firstname && lastname && base64Data)){  
        console.log("Friends Parameters Missing");
        return res.status(400).json("Parameters Missing");
    }
    
    var userId = res.locals.userId;
    var friendLimitQuery = "SELECT FriendID FROM Friends WHERE UserID = ?";
    var insertFriendQuery = "INSERT INTO Friends (FriendFirst, FriendLast, UserID) VALUES (?,?,?)";
    var friendImageQuery = "INSERT INTO FriendImage (FilePath, FriendID) VALUES (?,?)";

    try{
        //Check for max friends
        pool.query(friendLimitQuery, [userId], function (err, results, fields) {
            if(err) throw err;
            if(results.length == NUM_ALLOWED_FRIENDS){
                return res.status(403).send("Max Friends Reached");
            } 

            pool.query(insertFriendQuery, [firstname, lastname, userId], function (err, results, fields) {
                if(err) throw err;
                var friendId = results.insertId;
                var userPath = "/srv/people/" + userId;
                var filepath = userPath + "/" + friendId + ".png";
    
                //write image file
                fs.writeFile(filepath , base64Data, 'base64', function(err) {
                    if(err) throw err;
    
                    //FriendImage entry
                    pool.query(friendImageQuery, [filepath, friendId], function (err, results, fields) { 
                        if(err) throw err;
                        res.status(200).send("Person added successfully");

                        //Generate Friend Image Encoding
                        const encodeImage = spawn('python3', ['face_recognition/createEncoding.py', filepath, userPath, friendId]);

                        encodeImage.on('exit', function(code, signal) {
                            console.log("[FRIEND ENCODING] Exited with code: " + code);
                        });

                        encodeImage.stderr.on('data', (data) => {
                            console.log(`[FRIEND ENCODING] stderr: ${data}`);
                        });
                    }); 
                });
            });
        });
    }catch(err){
        console.log(err);
        res.status(500).send("Application error");
    }
}

function getFriends(req, res){
    var userId = res.locals.userId;
    var query = "SELECT FriendID, FriendFirst, FriendLast FROM Friends WHERE UserID = ?";

    try{
        pool.query(query, [userId], function (err, results, fields) {
            if(err) throw err;
            res.status(200).json(results);
        });
    }catch(err){
        console.log(err);
        res.status(500).send("Database error");
    }
}

function deleteFriend(req, res, next){
    var friendId = req.query.friendId
    if(!friendId) return res.status(400).json({ message: "Query Parameter Missing"});
    
    var userId = res.locals.userId;
    var friendQuery = "SELECT FriendID FROM Friends WHERE UserID = ? AND FriendID = ?";
    var friendImageQuery = "SELECT FilePath FROM FriendImage WHERE FriendID = ?";
    var friendImageDeleteQuery = "DELETE FROM FriendImage WHERE FriendID = ?";
    var friendEventDeleteQuery = "DELETE FROM FriendEvent WHERE FriendID = ?";
    var friendDeleteQuery = "DELETE FROM Friends WHERE FriendID = ?";

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

                fs.unlink(results[0].FilePath, function(err, data) {
                    if(err) throw err;

                    pool.query(friendImageDeleteQuery, [friendId], function (err, results, fields) {
                        if(err) throw err;

                        pool.query(friendEventDeleteQuery, [friendId], function (err, results, fields) {
                            if(err) throw err;

                            pool.query(friendDeleteQuery, [friendId], function (err, results, fields) {
                                if(err) throw err;
                                return res.status(200).json({ message: "Friend deleted" });
                            });
                        });
                    });
                });
            });
        });
    }catch(err){
        console.log(err);
        res.status(500).json({message:"Application Error"});
    }
}

// Get events that friend appeared in
function getFriendEvents(req, res){
    var userId = res.locals.userId;
    var friendId = req.query.friendId;
    if(!friendId) return res.status(400).json({auth: true, message: "Missing Friend Id"});
    var query = "SELECT t1.EventID, t1.Timesent FROM Event t1 JOIN FriendEvent t2 "+
    "ON (t2.EventID = t1.EventID) WHERE UserID = ? AND FriendID = ?";

    pool.query(query, [userId, friendId], function (err, results, fields) {
        if(err){
            res.status(500).send("Database error");
            return console.log(err);
        }

        res.status(200).json(results);
    });
}

module.exports = router;