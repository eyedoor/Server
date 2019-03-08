var express = require('express'),
    auth = require('../auth/jwtAuth'),
    fs = require('fs'),
    shortid = require('shortid'),
    database = require('../database');

var router = express.Router();
var pool = database.pool;

// router.use(express.json());

router.get("/", express.json(), auth, downloadImage);
router.post("/", express.urlencoded({limit:'500kb', extended:false}), uploadImage);

function downloadImage(req, res){
    // Send Image as response
    console.log("In send images " + res.locals.id);
    var userId = res.locals.userId;
    var eventId = req.body.eventId;
    if(!eventId) return res.status(400).json("Event ID missing");

    try{
        pool.query("SELECT FilePath FROM Event WHERE UserID = ?, EventID = ?", [userId, eventId], function (err, results, fields) {
            if(err) throw err;
            if(results.length == 0){
                return res.status(404).json("Event not found");
            }
            //TODO: Return base64 encoding of image
            fs.readFile(results[0].FilePath, function(err, data) {
                if(err) throw err;
                var base64Image = new Buffer(data).toString('base64');
                res.status(200).send(base64Image);
            });
        });
    }catch(err){
        console.log(err);
        res.status(500).send("Application error");
    }

    res.status(200).send("Download image")
}

function uploadImage(req, res){
    console.log(req.body.image);
    var base64Data = req.body.image;
    var filename = shortid.generate() + ".png";
    var filepath = "srv/images/" + filename;

    try{
        fs.writeFile("/srv/images/"+filename, base64Data, 'base64', function(err) {
            if(err) throw err;
            //TODO: Log event in database
            pool.query("INSERT INTO Event (FilePath, Timesent) VALUES (?, NOW())", [filepath], function (err, results, fields) {
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