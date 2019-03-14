var express = require('express'),
    auth = require('../auth/jwtAuth'),
    fs = require('fs'),
    shortid = require('shortid'),
    database = require('../database');

var router = express.Router();
var pool = database.pool;

router.get("/", auth.verifyUser, getPeople);
router.post("/", express.urlencoded({limit:'1mb', extended:false}), auth.verifyUser, createPerson);
router.delete("/");

function createPerson(req, res){ 
    var firstname = req.body.firstname,
        lastname = req.body.lastname,
        base64Data = req.body.image;
    if(!(firstname && lastname && base64Data)) return res.status(400).json("Parameters Missing");
    
    var userId = res.locals.userId;
    var friendsQuery = "INSERT INTO Friends (FriendFirst, FriendLast, UserID) VALUES (?,?,?)";
    var friendTableQuery = "INSERT INTO FriendImage (FilePath, FriendID) VALUES (?,?)";

    try{
        //Friends entry
        pool.query(friendsQuery, [firstname, lastname, userId], function (err, results, fields) {
            if(err) throw err;
            var friendId = results.insertId;
            var filepath = "/srv/people/" + userId + "/" + friendId + ".png";

            //write image file
            fs.writeFile(filepath , base64Data, 'base64', function(err) {
                if(err) throw err;

                //FriendImage entry
                pool.query(friendTableQuery, [filepath, friendId], function (err, results, fields) { 
                    if(err) throw err;
                    res.status(200).send("Person added successfully");
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