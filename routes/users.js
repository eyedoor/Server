var express = require('express'),
    database = require("../database");    

const bcrypt = require("bcrypt");
const saltRounds = 10;

var router = express.Router();  
var pool = database.pool;

router.post("/", createUser);   
router.put("/", updateUser);

function createUser(req, res, next) {
    // TODO: perform parsing/validation on query
    var username = req.params.username, 
        password = req.params.password, 
        firstname = req.params.firstname, 
        lastname = req.params.lastname;
    
    // TODO: check if username alreadyexists
    pool.query('SELECT * from test', function (error, results, fields) {
        if (error) throw error;
        console.log('The solution is: ', results[0].solution);
    });

    //encrypt password
    // bcrypt.hash(password, saltRounds, function(err, hash) {
    //     //store password in database
    //     // pool.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
    //     //     if (error) throw error;
    //     //     console.log('The solution is: ', results[0].solution);
    //     // });
    // });

    res.json("post users");
}

function updateUser(req, res, next) {
    res.json("put users");
}

module.exports = router;