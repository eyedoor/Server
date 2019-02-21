var express = require('express'),
    database = require("../database"),
    loginSchema = require("../schema/loginSchema"),
    bodyParser = require("body-parser");    

const Joi = require("joi");
const bcrypt = require("bcrypt");

var jsonParser = bodyParser.json();
var router = express.Router();  
var pool = database.pool;

router.post("/", jsonParser, validateLogin);

// Performs validation against schema on query
function validateLogin(req, res){
    console.log(req.body);
    Joi.validate(req.body, loginSchema, (error, value) =>{
        if(error == null){
            login(req.body, res);
        } else {
            res.json("Malformed Request Body");
        }
    });
}

function login(body, res){
    var username = body.username, 
        password = body.password;

    try{
        pool.query("SELECT * FROM test WHERE username = ?", [username],function (error, results, fields) {
            if(error) throw error;
            if(results === undefined || results.length == 0){
                res.json("User does not exist");
                return;
            } else if(results.length > 1){
                throw "CRITICAL DATABASE ERROR - MULTIPLE USERS WITH SAME USERNAME";
            }

            //compare to hashed password
            bcrypt.compare(password, results[0].password, function(err, result) {
                if(err) throw err;
                if(result){
                    res.json("Authenticaion Successful");
                } else {
                    res.json("Password Incorrect");
                }
            });
        });
    } catch(error){
        console.log(error);
        res.json("Application Error");
    }
}

module.exports = router;