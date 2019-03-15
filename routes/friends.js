var express = require('express'),
    auth = require('../auth/jwtAuth'),
    fs = require('fs'),
    shortid = require('shortid'),
    database = require('../database');

var router = express.Router();
var pool = database.pool;
const NUM_ALLOWED_FRIENDS = 5;

router.get("/", auth.verifyUser, getPeople);
router.post("/", express.urlencoded({limit:'1mb', extended:false}), auth.verifyUser, createPerson);
router.delete("/", auth.verifyUser, deletePerson);

function createPerson(req, res){ 
    var firstname = req.body.firstname,
        lastname = req.body.lastname,
        base64Data = req.body.image;
    if(!(firstname && lastname && base64Data)) return res.status(400).json("Parameters Missing");
    
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

function getPeople(req, res){
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

module.exports = router;