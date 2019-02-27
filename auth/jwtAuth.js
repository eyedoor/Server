var jwt = require('jsonwebtoken');
var credentials = require('../credentials/credentials');

// Authenticate incoming JWT tokens in request headers
function verifyJWT(req, res, next){
    var token = req.headers['x-access-token'];
    if(!token) return res.status(400).send({ auth: false, message: 'Missing authentication token' });

    jwt.verify(token, credentials.secret, function(err, decoded) {
        if (err) return res.status(401).send({ auth: false, message: 'Failed to authenticate token' });
        if (!decoded.id) return res.status(500).send({ auth: false, message: 'User ID not present in token' });
        res.locals.userId = decoded.id;
        next();
    });
}

module.exports = verifyJWT;