Looks for a file named database.json in a config directory in the root which contains connection information:

{
    "host": "https://casamiento.iriscouch.com",
    "port": "443",
    "username": "casamiento",
    "password": "floppsy1"
}

It will then import a seed file that you specify on the command line. If the file ends in .json it expects valid json delimited by " marks. If the file ends in .js it will expect a file that exports an object such as an array of documents. E.g.:
module.exports = [{_id: "doc1"}, {_id: "doc2" }]