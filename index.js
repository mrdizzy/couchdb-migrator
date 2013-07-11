var _ = require('underscore'),
    async = require('async'),
    fs = require('fs'),
    database = require(__dirname + '/../../config/db_connection'),
    cradle = require('cradle'),
    connection = new(cradle.Connection)(database.host, database.port, {
        auth: {
            username: database.username,
            password: database.password
        },
        cache: false
    });

// Destroys the database and then recreates it and loads the seed file
var reset = function(database_name, seed_file, callback) {
    var database = connection.database(database_name);
    database.destroy(function(error, response) {
        if (error) {
            if (error.error == "not_found") {
                create(database_name, seed_file, callback)
            }
            else {
                callback(error, response);
            }
        }
        else {
            create(database_name, seed_file,callback);
        }
    })
}

var create = function(cli, callback) {
    var database = connection.database(cli.database);
    database.create(function(err, res) {
            if(err) {       
                callback(err,res)
            }
            else {
                setUpSecurity(cli.database, function(error, response) {
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

    // Dumps the entire database to a JSON file 

var dump = function(database_name, file, callback) {

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

var load = function(cli, callback) {
    var database = connection.database(cli.database)
    database.save(cli.file, callback)
    if (cli.design_file) {
        database.save(cli.design_file, callback)
    }
}

module.exports.load = load;
module.exports.dump = dump;
module.exports.create = create;
module.exports.reset = reset;