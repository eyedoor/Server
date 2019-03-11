var express = require('express'),
    database = require("../database"),
    loginSchema = require("../schema/loginSchema"),
    jwt = require('jsonwebtoken'),
    credentials = require('../credentials/credentials');    

const Joi = require("joi");
const bcrypt = require("bcrypt");

var router = express.Router();  
var pool = database.pool;
var failedLogin = {auth: false, message: "Email/Password Incorrect"};

router.use(express.json());

router.post("/", validateLogin);

// Performs validation against schema on query
function validateLogin(req, res){
    console.log(req.body);
    Joi.validate(req.body, loginSchema, (error, value) =>{
        if(error == null){
            login(req.body, res);
        } else {
            res.status(400).send("Missing request parameters");
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
                res.status(401).send(failedLogin);
                return;
            } else if(results.length > 1){
                throw "CRITICAL DATABASE ERROR - MULTIPLE USERS WITH SAME EMAIL";
            }

            //compare to hashed password
            bcrypt.compare(password, results[0].Password, function(err, result) {
                if(err) throw err;
                if(result){
                    // Issue user JWT and use for further auth
                    jwt.sign({ id: results[0].UserID, jwtType : "user"}, credentials.secret, {expiresIn:"30d"}, function(err, token){
                        if(err) throw err;
                        res.status(200).send({auth: true, token: token});
                    });

                } else {
                    res.status(401).send(failedLogin);
                }
            });
        });
    } catch(error){
        console.log(error);
        res.status(500).send("Application Error");
    }
}

module.exports = router;