var express = require('express'),
    database = require("../database");    

const bcrypt = require("bcrypt");
const saltRounds = 10;

var router = express.Router();

router.post("/", createUser);   
router.put("/", updateUser);

var createUser = function(req, res, next) {
    //perform parsing/validation on query
    var username, password, firstname, lastname;

    //check if username alreadyexists

    //encrypt password
    bcrypt.hash(password, saltRounds, function(err, hash) {
        //store password in database
    });

    res.json("post users");
};

var updateUser = function(req, res, next) {

};

module.exports = router;