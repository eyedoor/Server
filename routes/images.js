var express = require('express'),
    auth = require('../auth/jwtAuth');

var router = express.Router();

router.use(express.json());
router.use(auth);

router.get("/", sendImage);
router.post("/", receiveImage);

function sendImage(req, res){
    // Send Image as response
    console.log("In send images " + res.locals.id);
    res.status(200).send("Download image")
}

function receiveImage(req, res){

}

module.exports = router;