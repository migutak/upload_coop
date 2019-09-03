var express = require('express');
var amqp = require('amqplib/callback_api');
var express = require("express");
var oracledb = require('oracledb');
oracledb.outFormat = oracledb.OBJECT;
oracledb.autoCommit = true;
var MongoClient = require('mongodb').MongoClient;
var dbConfig = require('./dbconfig.js');
var moment = require('moment');
const cron = require("node-cron");
var app = express();

port = 2600;

function doRelease(connection) {
    connection.close(
        function (err) {
            if (err)
                console.error(err.message);
        });
}

function bail(err) {
    console.error(err);
    process.exit(1);
}

/*amqp.connect(dbConfig.RABBITMQ, (err, conn) => {
    if (err != null) bail(err);
    conn.createChannel(on_open);
    function on_open(err, ch) {
        if (err != null) bail(err);
        var queue = 'xls_batch';
        ch.assertQueue(queue, { durable: false });
        console.log('waiting for messages in xls_batch queue')
        ch.consume(queue, (message) => {
            var buf = message.content
            var bulk = JSON.parse(buf.toString());
            let success = 0;
            let failed = 0;
            let sql = '';
            let insertALL = ' '
            const total = bulk.length;

            // connect to mongo
        }, { noAck: true }) 
    }
})*/
// schedule tasks to be run on the server every minute mon  - fri
cron.schedule("* * * * 1-5", function () {
    //
    console.log("---------------------");
    console.log("Mongotooracle Running Cron Job");

    MongoClient.connect(dbConfig.mongo, { useNewUrlParser: true }, function (err, db) {
        if (err) throw err;
        console.log("Database created!");
        var dbo = db.db("easy-notes");
        let note_in = {};
        let notes_in = [];

        dbo.collection("notes").find({ ack: { $nin: ["movedtooracle"] } }).limit(5).forEach(function (doc) {

            if (doc) {
                console.log('extry doc', doc._id);
                console.log('updating === ' + doc._id);
                const query = { _id: doc._id };
                const update = { $set: { ack: 'movedtooracle' } };
                const options = { returnNewDocument: true }
                note_in.accnumber = doc.accnumber;
                note_in.custnumber = doc.custnumber;
                note_in.notemade = (doc.notemade).replace(/'/g, '');
                note_in.notesrc = doc.notesrc;
                note_in.owner = doc.owner;
                note_in.notedate = moment(doc.notedate).format('YYYY-MM-DD HH:mm:ss');

                notes_in.push(note_in);
                if (notes_in.length == 5) {
                    // save to oracle
                    // executeMany

                    (async function () {
                        try {
                            connection = await oracledb.getConnection({
                                user: dbConfig.user,
                                password: dbConfig.password,
                                connectString: dbConfig.connectString
                            });
                            sql = "insert into notehis(accnumber,custnumber,notemade,notesrc,owner, notedate) values(:accnumber,:custnumber,:notemade,:notesrc,:owner,:notedate)";
                            let options = {
                                autoCommit: true,
                                batchErrors: true
                            }
                            console.log('notes_in_q', notes_in);
                            let binds = [{
                                accnumber: '016D0329588670',
                                custnumber: '3295886',
                                notemade: 'this test note',
                                notesrc: 'uploaded a note',
                                owner: 'tmasha',
                                notedate: '2019-07-14 22:48:36'
                            }
                            ]
                            result = await connection.executeMany(sql, binds, options);
                            console.log('Number of affected rows ', result.rowsAffected)

                        } catch (err) {
                            console.error(err);
                        } finally {
                            if (connection) {
                                try {
                                    await connection.close();   // Always close connections
                                } catch (err) {
                                    console.error(err.message);
                                }
                            }
                        }
                    })();
                }

                /* dbo.collection("notes").findOneAndUpdate(query, update, options, function (err, res) {
                    if (err) { throw err };
                    // console.log(res.lastErrorObject); 
                    console.log('updated entry', res);
                    // add to oracledb 
                    oracledb.getConnection({
                        user: dbConfig.user,
                        password: dbConfig.password,
                        connectString: dbConfig.connectString
                    }, function (err, connection) {
                        if (err) throw err;
                        const notedate = moment(doc.notedate).format('YYYY-MM-DD HH:mm:ss');
                        // console.log(notedate)
                        sql = "insert into notehis(accnumber,custnumber,notemade,notesrc,owner, notedate) values('" + doc.accnumber + "','" + doc.custnumber + "','" + doc.notemade + "','" + doc.notesrc + "','" + doc.owner + "',to_timestamp('" + notedate + "','yyyy-mm-dd hh24:mi:ss'))";
                        console.log(sql);
                        connection.execute(sql, function (error, result) {
                            if (error) throw error;
                            console.log(result)
                            //
                        });
                        doRelease(connection)
                    });
                }); */

            } else {
                console.log('no doc to movetooracle')
            }
        }, function (error) {
            console.log(error)
        })

    });

});//end

app.listen(port, () => console.log('read_xls_q app running port ' + port))
