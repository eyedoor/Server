var express = require('express'),
    database = require("../database"),
    jwt = require('jsonwebtoken'),
    credentials = require('../credentials/credentials');    

const bcrypt = require("bcrypt");

var router = express.Router();  
var pool = database.pool;
var failedLogin = {auth: false, message: "Email/Password Incorrect"};

router.use(express.json());

router.post("/", login);

function login(req, res){
    var email = req.body.email;
    var password = req.body.password;

    if(!(email && password)) return res.status(400).send("Missing request parameters");
    
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
                    // Issue user JWT for both user and device
                    jwt.sign({ id: results[0].UserID, jwtType : "user"}, credentials.secret, {expiresIn:"30d"}, 
                    function(err, userToken){
                        if(err) throw err;
                        jwt.sign({ id: results[0].UserID, jwtType : "device"}, credentials.secret, function(err, deviceToken){
                            if(err) throw err;
                            res.status(200).send({auth: true, token: userToken, deviceToken: deviceToken});
                        });
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