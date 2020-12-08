var async = require('async');
var oracledb = require('oracledb');
var dbConfig = require('./dbconfig.js');
var SimpleOracleDB = require('simple-oracledb');
var MongoClient = require('mongodb').MongoClient;
var moment = require('moment');

SimpleOracleDB.extend(oracledb);
var doconnect = function (cb) {
    oracledb.getConnection(
        {
            user: dbConfig.user,
            password: dbConfig.password,
            connectString: dbConfig.connectString
        },
        cb);
};

var dorelease = function (conn) {
    conn.close(function (err) {
        if (err)
            console.error(err.message);
    });
};

MongoClient.connect(dbConfig.mongo, { useNewUrlParser: true }, function (err, db) {
    if (err) throw err;
    console.log("Database created!");
    var dbo = db.db("easy-notes");
    let note_in = {};
    let notes_in = [];

    dbo.collection("notes").find({ ack: { $nin: ["movedtooracle"] } }).limit(20).forEach(function (doc) {
        if (doc) {
           // console.log('extry doc', doc);
            console.log('updating === ' + doc._id);
            const query = { _id: doc._id };
            const update = { $set: { ack: 'movedtooracle' } };
            const options = { returnNewDocument: true }
            note_in.accnumber = doc.accnumber;
            note_in.custnumber = doc.custnumber;
            note_in.notemade = (doc.notemade).replace(/'/g, '');
            note_in.notesrc = doc.notesrc;
            note_in.owner = doc.owner;
            note_in.notedate = moment(doc.notedate).format('DD-MMM-YYYY hh:mm:ss');

            notes_in.push(note_in);
            dbo.collection("notes").findOneAndUpdate(query, update, options, function (err, res) {
                if (err) { throw err };
                console.log(res.lastErrorObject); 
                console.log('updated entry', res);
            });
            if (notes_in.length == 20) {
                console.log(notes_in);
                var doinsert_autocommit = function (conn, cb) {

                    sql = "insert into notehis(accnumber,custnumber,notemade,notesrc,owner, notedate) values(:accnumber,:custnumber,:notemade,:notesrc,:owner,:notedate)";
                    conn.batchInsert(
                        sql,
                        notes_in, // Bind values
                        { autoCommit: true },  // Override the default non-autocommit behavior
                        function (err, result) {
                            if (err) {
                                return cb(err, conn);
                            } else {
                                console.log("Rows inserted: ", result);  // 1
                                return cb(null, conn);
                            }
                        });
                };

                async.waterfall(
                    [
                        doconnect,
                        doinsert_autocommit,

                    ],
                    function (err, conn) {
                        if (err) { console.error("In waterfall error cb: ==>", err, "<=="); }
                        if (conn)
                            dorelease(conn);
                    });
            }
        } else {
            console.log('no doc to movetooracle')
        }
    }, function (error) {
        console.log(error)
    })
})
