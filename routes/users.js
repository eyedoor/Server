var express = require('express'),
    database = require("../database"),
    userSchema = require("../schema/userSchema");    

const Joi = require("joi");
const bcrypt = require("bcrypt");
const saltRounds = 10;

var router = express.Router();  
var pool = database.pool;

router.use(express.json());

router.post("/", validateUser, createUser); 
router.put("/", updateUser);

// Performs validation against schema on query
function validateUser(req, res, next){
    Joi.validate(req.body, userSchema, (error, value) =>{
        if(error == null){
            next();
        } else {
            res.status(400).send("Missing request parameters");
        }
    });
}

function createUser(req, res) {    
    var email = req.body.email, 
        password = req.body.password, 
        firstname = req.body.firstname, 
        lastname = req.body.lastname;
    
    // Check if email already exists
    try{
        // TODO: replace pool with single connection from pool
        pool.query("SELECT * FROM User WHERE Email = ?", [email],function (error, results, fields) {
            if(error) throw error;
            if(!(results === undefined || results.length == 0)){
                res.status(403).send("Email already in use");
                return;
            }

            //encrypt password
            bcrypt.hash(password, saltRounds, function(err, hash) {
                if(err) throw err;
                //store hash in database
                var query = "INSERT INTO User (Email, Password, Firstname, Lastname) VALUES (?, ?, ?, ?)";

                pool.query(query, [email, hash, firstname, lastname], function (error, results, fields) {
                    if(error) throw error;
                    res.status(201).send("User created");
                });
            });
        });
    } catch(error){
        console.log(error);
        res.status(500).send("Application Error");
    }
}

function updateUser(req, res, next) {
    res.json("put users");
}

module.exports = router;