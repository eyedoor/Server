var express = require('express'),
    database = require("../database");    

const bcrypt = require("bcrypt");
const saltRounds = 10;

var router = express.Router();  
var pool = database.pool;

router.post("/", createUser);   
router.put("/", updateUser);

function createUser(req, res, next) {
    // TODO: perform parsing/validation/sanatization on query
    var username = req.params.username, 
        password = req.params.password, 
        firstname = req.params.firstname, 
        lastname = req.params.lastname;
    
    // TODO: check if username alreadyexists
    pool.query('SELECT * from test where username='+username, function (error, results, fields) {
        if (error) throw error;
        if(!(results === undefined || results.length == 0)){
            res.json("Username unavailable");
            return;
        }

        //encrypt password
        bcrypt.hash(password, saltRounds, function(err, hash) {
            //store hash in database
            var query = "INSERT INTO test (username, password, firstname, lastname) VALUES (" + username +"," +
                        hash + "," + firstname + "," + lastname +");";

            pool.query(query, function (error, results, fields) {
                if (error) throw error;
                res.json("User " +username+ "created");
            });
        });
    });
}

function updateUser(req, res, next) {
    res.json("put users");
}

module.exports = router;