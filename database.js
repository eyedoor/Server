var mysql = require('mysql')
    credentials = require("./credentials/credentials");

var pool = mysql.createPool(credentials.db);

var getConnection = function(callback) {
    pool.getConnection(function(err, connection) {
        callback(err, connection);
    });
};

module.exports = {
    pool: pool,
    getConnection : getConnection
};