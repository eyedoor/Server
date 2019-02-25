var express = require('express'),
    database = require("../database"),
    loginSchema = require("../schema/loginSchema");    

const Joi = require("joi");
const bcrypt = require("bcrypt");

var jsonParser = express.json();
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
    var email = body.email, 
        password = body.password;

    try{
        pool.query("SELECT * FROM User WHERE Email = ?", [email], function (error, results, fields) {
            if(error) throw error;
            if(results === undefined || results.length == 0){
                res.json("User does not exist");
                return;
            } else if(results.length > 1){
                throw "CRITICAL DATABASE ERROR - MULTIPLE USERS WITH SAME EMAIL";
            }

            //compare to hashed password
            bcrypt.compare(password, results[0].Password, function(err, result) {
                if(err) throw err;
                if(result){
                    // TODO: issue user JWT and use for further auth
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