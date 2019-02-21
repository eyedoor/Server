var express = require('express'),
    database = require("../database"),
    bodyParser = require("body-parser");    

const bcrypt = require("bcrypt");
const saltRounds = 10;

var jsonParser = bodyParser.json();
var router = express.Router();  
var pool = database.pool;

router.post("/", jsonParser, createUser);   
router.put("/", updateUser);

function createUser(req, res, next) {
    console.log(req.body);
    // TODO: perform parsing/validation/sanatization on query
    var username = req.body.username, 
        password = req.body.password, 
        firstname = req.body.firstname, 
        lastname = req.body.lastname;
    
    // TODO: check if username already exists
    pool.query("SELECT * FROM test WHERE username = '"+username+"'", function (error, results, fields) {
        if (error) throw error;
        if(!(results === undefined || results.length == 0)){
            res.json("Username unavailable");
            return;
        }

        //encrypt password
        bcrypt.hash(password, saltRounds, function(err, hash) {
            //store hash in database
            var query = "INSERT INTO test (username, password, firstname, lastname) VALUES ('" + username +"', '" +
                        hash + "', '" + firstname + "', '" + lastname +"')";

            pool.query(query, function (error, results, fields) {
                if (error) throw error;
                res.json("User " +username+ " created");
            });
        });
    });
}

function updateUser(req, res, next) {
    res.json("put users");
}

module.exports = router;