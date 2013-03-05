var _ = require('underscore'),
    async = require('async'),
    fs = require('fs'),
    bufferjs = require('bufferjs');

var cradle = require('cradle'),
    connection = new(cradle.Connection)('https://casamiento.iriscouch.com', 443, {
        auth: {
            username: "casamiento",
            password: "floppsy1"
        },
        cache: false
    });

var resetDb = function(database_name, seed_file, callback) {
    var database = connection.database(database_name);
    database.destroy(function(error, response) {
        if (error) {
            if (error.error == "not_found") {
                createDb(database_name, callback)
            }
            else {
                callback(error, response);
            }
        }
        else {
            createDb(database_name, callback);
        }
    })
}

var createDb = function(database_name, seed_file, callback) {
    var database = connection.database(database_name);
    var seed_file = require('./../../' + seed_file)
    database.create(function(err, res) {
        if (err) {
            callback(err, res);
        }
        else {
            database.save(seed_file, function(err, res) {
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

    function setUpSecurity(database_name, callback) {
        var database = connection.database(database_name);
        database.save("_security", {
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

    // DUMP 

var dumpToJSON = function(database_name, file, callback) {

    var database = connection.database(database_name);
    var dump = [];
    database.all(function(err, res) {

var docs = _.map(res, function(doc) {
            return (doc);
        })
        async.forEach(docs, function(doc, callback) {
            database.get(doc.id, function(err, res) {
                delete res._rev
                dump.push(res)
                if (res._attachments) {
                    handleAttachments(doc, res._attachments, function(err, collated) {
                        res._attachments = collated;
                        callback(err)
                    })
                }
                else {
                    callback(err)
                }
            })
        }, function(err) {
            fs.writeFile(database_name + ".json", JSON.stringify(dump), function(err) {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log("The file was saved!");
                }
            })
        })
    })

    function handleAttachments(doc, attachments, cb) {
        var collated = {}

        var database = connection.database(database_name);
        async.forEach(Object.keys(attachments), function(filename, callback) {
            var stream = database.getAttachment(doc.id, filename)
            var file = []
            stream.on("data", function(chunk) {
                file.push(chunk)
            })
            stream.on("end", function() {
                var finished = Buffer.concat(file);
                collated[filename] = {}
                collated[filename]["content_type"] = attachments[filename]["content_type"]
                collated[filename]["data"] = finished.toString('base64');
                callback(null)
            })
        }, function(err) {
            cb(err, collated)
        })
    }
}

var importFromJSON = function(database_name, file, callback) {

    var database = connection.database(database_name);
    fs.readFile(file, 'utf-8', function(err, res) {
        var doc = JSON.parse(res)
        database.save(doc, callback)
    })
}

module.exports.importFromJSON = importFromJSON;
module.exports.dumpToJSON = dumpToJSON;
module.exports.createDb = createDb;
module.exports.resetDb = resetDb;