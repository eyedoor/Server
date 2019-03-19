var express = require('express'),
    auth = require('../auth/jwtAuth'),
    fs = require('fs'),
    shortid = require('shortid'),
    database = require('../database');

var router = express.Router();
var pool = database.pool;
const NUM_ALLOWED_FRIENDS = 100;

router.get("/", auth.verifyUser, getFriends);
router.post("/", express.urlencoded({limit:'1mb', extended:false}), auth.verifyUser, createFriend);
router.delete("/", auth.verifyUser, deleteFriend);

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
                var filepath = "/srv/people/" + userId + "/" + friendId + ".png";
    
                //write image file
                fs.writeFile(filepath , base64Data, 'base64', function(err) {
                    if(err) throw err;
                    console.log(base64Data);
    
                    //FriendImage entry
                    pool.query(friendImageQuery, [filepath, friendId], function (err, results, fields) { 
                        if(err) throw err;
                        res.status(200).send("Person added successfully");
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
                // Return base64 encoding of .png image
                fs.unlink(results[0].FilePath, function(err, data) {
                    if(err) throw err;
                    pool.query(friendImageDeleteQuery, [friendId], function (err, results, fields) {
                        if(err) throw err;
                        pool.query(friendDeleteQuery, [friendId], function (err, results, fields) {
                            if(err) throw err;
                            return res.status(200).json({ message: "Friend deleted" });
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

module.exports = router;