var express = require('express'),
    auth = require('../auth/jwtAuth'),
    fs = require('fs'),
    shortid = require('shortid'),
    database = require('../database');

var router = express.Router();
var pool = database.pool;

router.get("/");
router.post("/", express.urlencoded({limit:'1mb', extended:false}), auth.verifyUser, createPerson);
router.delete("/");

function createPerson(req, res){ 
    var firstname = req.body.firstname,
        lastname = req.body.lastname,
        base64Data = req.body.image;

    if(!(firstname && lastname && base64Data)) return res.status(400).json("Parameters Missing");
    
    var userId = res.locals.userId;
    var filepath = "/srv/people/" + userId + "/" + shortid.generate() + ".png";

    try{
        //Save friend image
        fs.writeFile(filepath, base64Data, 'base64', function(err) {
            if(err) throw err;
            // Log person in database
            pool.getConnection(function(err, conn) {
                if(err) throw err;

                var friendsQuery = "INSERT INTO Friends (FriendFirst, FriendLast, UserID) VALUES (?,?,?)";
                var friendTableQuery = "INSERT INTO FriendImage (FilePath, FriendID) VALUES (?,?)";
                
                conn.query(friendsQuery, [firstname, lastname, userId], function (err, results, fields) {
                    if(err){
                        conn.release(); 
                        throw err;
                    }

                    var friendId = results.insertId;

                    conn.query(friendTableQuery, [filepath, friendId], function (err, results, fields) {
                        conn.release(); 
                        if(err) throw err;
                        
                        //person and image created
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

module.exports = router;