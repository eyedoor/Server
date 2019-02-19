var mysql = require('mysql')
    credentials = require("./credentials/credentials");

var pool = mysql.createPool({
    host     : credentials.db.host,
    user     : credentials.db.user,
    password : credentials.db.password,
    database : credentials.db.database
});

var getConnection = function(callback) {
    pool.getConnection(function(err, connection) {
        callback(err, connection);
    });
};

module.exports = {
    pool: pool,
    getConnection : getConnection
};