var express = require('express'),
    database = require("../database"),
    jwt = require('jsonwebtoken'),
    credentials = require('../credentials/credentials'),
    auth = require("../auth/jwtAuth");    

const bcrypt = require("bcrypt");

var router = express.Router();  
var pool = database.pool;
var failedLogin = {auth: false, message: "Email/Password Incorrect"};

router.use(express.json());

router.get("/", auth.verifyUser, verifyLogin);
router.post("/", login);

function verifyLogin(req, res){
    res.status(200).json({ auth: true, message: "User JWT Valid"});
}

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
                            
                            var payload = {
                                auth: true, 
                                token: userToken, 
                                deviceToken: deviceToken, 
                                firstname: results[0].Firstname,
                                lastname: results[0].Lastname,
                                email: results[0].Email
                            }

                            res.status(200).json(payload);
                        });
                    });
                } else {
                    res.status(401).json(failedLogin);
                }
            });
        });
    } catch(error){
        console.log(error);
        res.status(500).send("Application Error");
    }
}

module.exports = router;