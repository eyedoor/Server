var express = require('express'),
    auth = require('../auth/jwtAuth'),
    fs = require('fs'),
    shortid = require('shortid'),
    database = require('../database');

var router = express.Router();
var pool = database.pool;

router.get("/", auth.verifyUser, downloadImage);
router.post("/", express.urlencoded({limit:'500kb', extended:false}), auth.verifyDevice, uploadImage);

function downloadImage(req, res){
    // Send Image as response
    var userId = res.locals.userId;
    var eventId = req.query.eventId;
    if(!eventId) return res.status(400).json("Event ID missing");

    try{
        pool.query("SELECT FilePath FROM Event WHERE UserID = ? AND EventID = ?", [userId, eventId], 
        function (err, results, fields) {
            if(err) throw err;
            if(results.length == 0){
                return res.status(404).json("Event not found");
            }
            // Return base64 encoding of .png image
            fs.readFile(results[0].FilePath, function(err, data) {
                if(err) throw err;
                var base64Image = Buffer.from(data).toString('base64');
                res.status(200).send(base64Image);
            });
        });
    }catch(err){
        console.log(err);
        res.status(500).send("Application error");
    }
}

function uploadImage(req, res){
    var base64Data = req.body.image;
    var filepath = "/srv/images/" + shortid.generate() + ".png";

    try{
        fs.writeFile(filepath, base64Data, 'base64', function(err) {
            if(err) throw err;
            // Log event in database
            pool.query("INSERT INTO Event (FilePath, Timesent, UserID) VALUES (?, NOW(), ?)", [filepath, res.locals.userId], 
            function (err, results, fields) {
                if(err) throw err;
                res.status(201).send("File uploaded Successfully"); 
            });
        });
    }catch(err){
        console.log(err);
        res.status(500).send("Application error");
    }
}

module.exports = router;