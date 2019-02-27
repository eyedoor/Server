var express = require('express'),
    auth = require('../auth/jwtAuth'),
    fs = require('fs'),
    shortid = require('shortid');

var router = express.Router();

// router.use(express.json());

router.get("/", express.json(), auth, downloadImage);
router.post("/", express.urlencoded({limit:'500kb'}), uploadImage);

function downloadImage(req, res){
    // Send Image as response
    console.log("In send images " + res.locals.id);
    res.status(200).send("Download image")
}

function uploadImage(req, res){
    console.log(req.body.image);
    var base64Data = req.body.image;
    var filename = shortid.generate() + ".png";

    fs.writeFile("/srv/images/"+filename, base64Data, 'base64', function(err) {
        if(err){
            res.status(500).send("Error saving file");
            console.log(err);
        } else {
            res.status(201).send("File uploaded Successfully");
        }
    });
}

module.exports = router;