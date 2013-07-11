Run using the migrate command:

    migrate --help
    
Commands

* create - creates the database but does not load any seed files
* load - if a file is specified, it will load that file into the database. If no file is specified it will look for two files in the /config directory based on the name of the database being given at the command line. Therefore if the database is given as -d addresses it will look for addresses.json or addresses.js and addresses_design.json or addresses_design.js and will load those into the database
* dump - dumps the database documents, including attachments, into a single `.json` file
* reset - destroys the database, then recreates it and loads the seed files

Looks for a file named `db_connection.json `in a `/config` directory in the root of the project which contains couchDb connection information:

    {
        "host": "https://casamiento.iriscouch.com",
        "port": "443",
        "username": "casamiento",
        "password": "floppsy1"
    }

Seed files should contain an array of document objects to be imported. The default location of the seed file is `/config/seed.json`. If the file ends in `.json` it expects valid json delimited by `"` marks. If the file ends in `.js` it will expect a file that exports an object such as an array of documents. E.g.:
`module.exports = [{_id: "doc1"}, {_id: "doc2" }]`