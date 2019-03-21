var express = require('express'),
    auth = require('../auth/jwtAuth'),
    fs = require('fs'),
    shortid = require('shortid'),
    database = require('../database'),
    spawn = require("child_process").spawn;

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

function uploadImage(req, res, next){
    var userId = res.locals.userId;
    var base64Data = req.body.image;
    var filepath = "/srv/images/" + shortid.generate() + ".png";

    try{
        fs.writeFile(filepath, base64Data, 'base64', function(err) {
            if(err) throw err;
            // Log event in database
            var query = "INSERT INTO Event (FilePath, Timesent, UserID) VALUES (?, NOW(), ?)";
            pool.query(query, [filepath, res.locals.userId], function (err, results, fields) {
                if(err) throw err;
                res.status(201).send("File uploaded Successfully");
                res.locals.filepath = filepath;

                //Check for facial recognition
                var friendQuery = "SELECT FriendID FROM Friends WHERE UserID = ?";
                pool.query(friendQuery, [userId], function (err, results, fields) {
                    if(err) throw err;
                    res.locals.hasFriends = (results.length > 0);
                    return performFacialRecognition(res);
                });
            });
        });
    }catch(err){
        console.log(err);
        res.status(500).send("Application error");
    }
}

function performFacialRecognition(res){
    if(!res.locals.hasFriends){
        return sendPushNotification(res);
    }
    
    var filepath = res.locals.filepath;
    var userId = res.locals.userId;
    var userDirectory = "/srv/people/" + userId;
    
    //Trigger Facial Recogntion Proccessing on event
    const faceRecognition = spawn('python3', ['face_recognition/faceRecognition.py', filepath, userDirectory]);

    faceRecognition.stdout.on('data', function(data) {
        var matchData = data.toString();
        var jsonMatchData = JSON.parse(matchData);
        res.locals.numPeople = jsonMatchData.count;
        res.locals.matchedPeople = jsonMatchData.results;
        return sendPushNotification(res);
    });

    faceRecognition.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
    });
}

function sendPushNotification(res){
    if(!res.locals.hasFriends){
        return console.log("Someone is at the door!");
    }
    
    var numPeople = res.locals.numPeople;
    var friendIds = res.locals.matchedPeople;
    var numUnknownPeople = numPeople - friendIds.length;

    if(res.locals.matchedPeople.length == 0){
        if(numPeople > 1){
            return console.log(numPeople + " people are at the door!");
        } else {
            return console.log("Someone is at the door!");
        }
    }
    
    var friendQuery = "SELECT FriendFirst, FriendLast FROM Friends WHERE FriendID IN (?";
    for(var i = 1; i < friendIds.length; i++){
        friendQuery += ",?";
    }
    friendQuery += ")";

    try{
        pool.query(friendQuery, friendIds, function (err, results, fields) {
            if(err) throw err;
            var message = buildPushNotification(results, numUnknownPeople);
            //TODO: Get APNS key for user and send notification
            console.log(message);
        });
    }catch(err){
        console.log(err);
    }
}

function buildPushNotification(results, numUnknown){
    var message = "";
    if(numUnknown > 0){
        results.push({FriendFirst:numUnknown});
    }

    for(var i = 0; i < results.length; i++){
        if(results.length > 1 && i == results.length - 1){
            message += "and "
        }

        var last = results[i].FriendLast;
        message += results[i].FriendFirst;
        message += (last) ? " " + last.charAt(0) + "." : "";
        
        if(results.length == 2 && i != results.length - 1){
            message += " ";
        } else if(results.length > 2 && i != results.length - 1){
            message += ", ";
        }
    }

    if(numUnknown > 0){
        if(numUnknown == 1){
            message += " other"
        } else {
            message += " others"
        }
    }

    if(results.length > 1){
        message += " are at the door!";
    } else {
        message += " is at the door!";
    }

    return message;
}

module.exports = router;