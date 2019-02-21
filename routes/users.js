var express = require('express'),
    database = require("../database"),
    userSchema = require("../schema/userSchema");
    bodyParser = require("body-parser");    

const Joi = require("joi");
const bcrypt = require("bcrypt");
const saltRounds = 10;

var jsonParser = bodyParser.json();
var router = express.Router();  
var pool = database.pool;

router.post("/", jsonParser, validateUser);   
router.put("/", updateUser);

// Performs validation/sanatization on query
function validateUser(req, res){
    console.log(req.body);
    Joi.validate(req.body, userSchema, (error, value) =>{
        if(error == null){
            createUser(req.body, res);
        } else {
            res.json("Malformed Request Body");
        }
    });
}

function createUser(body, res) {    
    var username = body.username, 
        password = body.password, 
        firstname = body.firstname, 
        lastname = body.lastname;
    
    // Check if username already exists
    try{
        pool.query("SELECT * FROM test WHERE username = ?", [username],function (error, results, fields) {
            if (error) throw error;
            if(!(results === undefined || results.length == 0)){
                res.json("Username unavailable");
                return;
            }

            //encrypt password
            bcrypt.hash(password, saltRounds, function(err, hash) {
                //store hash in database
                var query = "INSERT INTO test (username, password, firstname, lastname) VALUES (?, ?, ?, ?)";

                pool.query(query, [username, hash, firstname, lastname], function (error, results, fields) {
                    if (error) throw error;
                    res.json("User " +username+ " created");
                });
            });
        });
    } catch(error){
        console.log(error);
        res.json("MYSQL Error");
    }
}

function updateUser(req, res, next) {
    res.json("put users");
}

module.exports = router;