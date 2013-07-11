Run using the migrate command:

    migrate --help
    
Commands

* create
* reset

Looks for a file named `database.json `in a `/config` directory in the root of the project which contains couchDb connection information:

    {
        "host": "https://casamiento.iriscouch.com",
        "port": "443",
        "username": "casamiento",
        "password": "floppsy1"
    }

It will then import a seed file that you specify on the command line. The seed file should contain an array of document objects to be imported. The default location of the seed file is `/config/seed.json`. If the file ends in `.json` it expects valid json delimited by `"` marks. If the file ends in `.js` it will expect a file that exports an object such as an array of documents. E.g.:
`module.exports = [{_id: "doc1"}, {_id: "doc2" }]`