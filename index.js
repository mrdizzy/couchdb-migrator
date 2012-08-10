var docs = require('./../../config/database').documents,
    db = require('./../../config/database').db;

var resetDb = function(callback) {
    db.destroy(function(error, response) {
        if (error) {
            callback(error, response);
        }
        else {
            createDb(callback);
        }
    })
}

var createDb = function(callback) {
    db.create(function(err, res) {
        if (err) {
            callback(err, res);
        }
        else {
            db.save(docs, function(err, res) {
                if (err) {
                    callback(err, res);
                }
                else {
                    setUpSecurity(function(error, response) {
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

function setUpSecurity(callback) {
    db.save("_security", {
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

module.exports.db = db;
module.exports.createDb = createDb;
module.exports.resetDb = resetDb;