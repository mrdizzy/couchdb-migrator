var _ = require('underscore'),
    async = require('async'),
    fs = require('fs'),
    cradle = require('cradle'),
    couchdb_connection = require(__dirname + '/./../../config/couchdb/connection');
    
    var connection = new(cradle.Connection)(couchdb_connection.host, couchdb_connection.port, {
        auth: {
            username: couchdb_connection.username,
            password: couchdb_connection.password
        },
        cache: false
    });

// Destroys the database and then recreates it and loads the _docs and _design file
var reset = function(cli, callback) {
    console.log("Resetting database " + cli.database)
    var database = connection.database(cli.database);
    console.log("Destroying previous data...")
    database.destroy(function(error, response) {
        if (error) {
            if (error.error == "not_found") {
                create(cli, function(err, response) {
                    if (cli.file) load(cli, callback)
                })
            }
            else {
                callback(error, response);
            }
        }
        else {
            create(cli, function(err, response) {
                    console.log(cli.file)
                    if (cli.file) load(cli, callback)
                })
        }
    })
}

var create = function(cli, callback) {
    console.log("Creating database " + cli.database)
    var database = connection.database(cli.database);
    database.create(function(err, res) {
            if(err) {       
                callback(err,res)
            }
            else {
                console.log("Setting up security roles....")
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

var dump = function(cli, callback) {
    console.log("Dumping " + cli.database + "...")
    var database = connection.database(cli.database);
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
            fs.writeFile(cli.database + "_docs.json", JSON.stringify(dump), function(err) {
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

        var database = connection.database(cli.database);
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
    console.log("Loading data into " + cli.database + "...")
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