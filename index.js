var docs = require('./../../config/database').documents,
    databases = require('./../../config/database');

var resetDb = function(database_name, callback) {
    databases[database_name].destroy(function(error, response) {
        if (error) {
            callback(error, response);
        }
        else {
            createDb(callback);
        }
    })
}

var createDb = function(database_name, callback) {
    databases[database_name].create(function(err, res) {
        if (err) {
            callback(err, res);
        }
        else {
            databases[database_name].save(docs, function(err, res) {
                if (err) {
                    callback(err, res);
                }
                else {
                    setUpSecurity(database_name, function(error, response) {
                        if (error) {
                            callback(error, response)
                        }
                        else {
                            callback(error, response)
                        }
                    })
                }
            })
        }
    })
}
// Defaults to admin only allowing access to database

function setUpSecurity(database_name,callback) {
    databases[database_name].save("_security", {
        "admins": {
            "names": [],
            "roles": ["admin"]
        },
        "members": {
            "names": [],
            "roles": ["admin"]
        }
    }, callback)
}

module.exports.databases = databases;
module.exports.createDb = createDb;
module.exports.resetDb = resetDb;