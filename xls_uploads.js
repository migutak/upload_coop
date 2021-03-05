/*eslint-disable*/
var express = require('express');
var multer = require('multer');
var path = require('path');
const bodyParser = require('body-parser');
var dbconfig = require('./dbconfig');
var mongoxlsx = require('mongo-xlsx');
<<<<<<< HEAD
var moment = require('moment');
var uniqid = require('uniqid');
var oracledb = require('oracledb');
var SimpleOracleDB = require('simple-oracledb');
var async = require('async');
=======
var oracledb = require('oracledb');
var SimpleOracleDB = require('simple-oracledb');
>>>>>>> 3383ba6bb682cbe4d128173317b124d28f3ab38d

var app = express();

var data = require('./data.js');

const DIR = data.filePath;
const CORS = data.cors;

<<<<<<< HEAD
const API = data.apiPath;
SimpleOracleDB.extend(oracledb);

// app.use(cors());

=======
SimpleOracleDB.extend(oracledb);
>>>>>>> 3383ba6bb682cbe4d128173317b124d28f3ab38d
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));


app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', CORS);
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, DIR);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
var upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        var ext = path.extname(file.originalname);
        if (ext !== '.xlsx') {
            return cb(new Error('Only xlsx are allowed'))
        }
        cb(null, true)
    }
}).any();

app.get('/xlsupload', function (req, res) {
    res.json({ message: 'xlsupload' });
});

app.post('/xlsupload', function (req, res) {
    upload(req, res, function (err) {

<<<<<<< HEAD
        var random = uniqid();
=======
        // var random = uniqid();
>>>>>>> 3383ba6bb682cbe4d128173317b124d28f3ab38d
        var username = req.body.owner;
        var custnumber = req.body.custnumber;
        var sys = req.body.sys;
        if (err) {
            // return res.end(err.toString());
            res.json({
                success: false,
                message: err.toString()
            })
        } else {
            let bulk = null;

            let bulknotes = [];
            for (i = 0; i < req.files.length; i++) {
                /// const workbook = XLSX.readFile(req.files[i].path);
                // const sheet_name = workbook.SheetNames;
                // bulk = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name[0]]);

                var model = null;
                var xlsx = req.files[i].path;

                mongoxlsx.xlsx2MongoData(xlsx, model, function (err, data) {
                    if (err) throw err;
<<<<<<< HEAD


                    for (x = 0; x < data.length; x++) {
                        let bulknote = {};
                        // console.log(data[x]);
                        if (sys == 'cc' || sys == 'watchcc') {
                            bulknote.custnumber = data[x].accnumber;
                        } else {
                            bulknote.custnumber = (data[x].accnumber).substring(5, 12);
                        }
                        bulknote.accnumber = data[x].accnumber;
                        bulknote.notemade = data[x].notemade;
                        bulknote.owner = username
                        bulknote.notesrc = 'uploaded a note';
                        bulknote.noteimp = 'N';
                        // bulknote.notedate = moment().format('YYYY-MM-DD HH:mm:ss'); //moment(doc.notedate).format('YYYY-MM-DD HH:mm:ss')
                        // bulknote.batchno = random;

                        bulknotes.push(bulknote);
                    }

                    console.log(bulknotes);
                    const batch = {
                        batchno: random,
                        name: req.files[0].originalname,
                        path: req.files[0].path,
                        owner: username,
                        batchdate: moment().format(),
                        success: 0,
                        failed: 0,
                        total: bulknotes.length,
                        act: 'n'
                    }
                    const sql = "insert into notehis(custnumber,accnumber,notemade,owner,notesrc, noteimp) values(:custnumber,:accnumber,:notemade,:owner,:notesrc,:noteimp)";
                    async function run() {
                        let connection;
                        
                        try {
                          connection = await oracledb.getConnection({
                            user: dbconfig.user,
                            password: dbconfig.password,
                            connectString: dbconfig.connectString
                        });
                      
                          const result = await connection.executeMany(sql, bulknotes, {autoCommit: true});
                          console.log("Result is:", result);
                          res.json({
                            success: true,
                            files: req.files,
                            notes: bulknotes
                          })
                      
                        } catch (err) {
                          console.error(err);
                        } finally {
                          if (connection) {
                            try {
                              await connection.close();
                            } catch (err) {
                              console.error(err);
                            }
                          }
                        }
                      }
                      
                      run();

                    // send to mongo
                    /*MongoClient.connect(dbconfig.mongo, { useNewUrlParser: true }, function (err, db) {
                        if (err) throw err;
                        // console.log("Database created!");
                        var dbo = db.db("easy-notes");
                        dbo.collection("notes").insertMany(bulknotes, { forceServerObjectId: true }, function (err, resp) {
                            if (err) throw err;
                            console.log("Bulknotes inserted");
                            res.json({
                                success: true,
                                files: req.files,
                                notes: bulknotes
                            })
                            db.close();
                        });
                    });

                    // send to batch queue
                    amqp.connect(dbconfig.RABBITMQ, (err, conn) => {
                        if (err != null) bail(err)
                        conn.createChannel(on_open);
                        function on_open (err, ch) {
                            if (err !=null ) bail(err);
                            var queue = 'xls_batch';
                            ch.assertQueue(queue, {durable: false});
                            ch.sendToQueue(queue, Buffer.from(JSON.stringify(batch)));
                            console.log('... send to batch queue')
                        }
                    })*/
                });
=======

                    // check rows
                    if (data.length > 5000) {
                        // row limit exceeded
                        res.json({
                            success: false,
                            message: 'row limit exceeded. max is 5k'
                        })
                    } else {

                        for (x = 0; x < data.length; x++) {
                            let bulknote = {};
                            // console.log(data[x]);
                            if (sys == 'cc' || sys == 'watchcc') {
                                bulknote.custnumber = data[x].accnumber;
                            } else {
                                bulknote.custnumber = (data[x].accnumber).substring(5, 12);
                            }
                            bulknote.accnumber = data[x].accnumber;
                            bulknote.notemade = data[x].notemade;
                            bulknote.owner = username
                            bulknote.notesrc = 'uploaded a note';
                            bulknote.noteimp = 'N';
                            // bulknote.notedate = moment().format('YYYY-MM-DD HH:mm:ss'); //moment(doc.notedate).format('YYYY-MM-DD HH:mm:ss')
                            // bulknote.batchno = random;

                            bulknotes.push(bulknote);
                        }


                        const sql = "insert into notehis(custnumber,accnumber,notemade,owner,notesrc, noteimp) values(:custnumber,:accnumber,:notemade,:owner,:notesrc,:noteimp)";
                        async function run() {
                            let connection;

                            try {
                                connection = await oracledb.getConnection({
                                    user: dbconfig.user,
                                    password: dbconfig.password,
                                    connectString: dbconfig.connectString
                                });

                                const result = await connection.executeMany(sql, bulknotes, { autoCommit: true });
                                console.log("Result is:", result);
                                res.json({
                                    success: true,
                                    files: req.files,
                                    notes: bulknotes
                                })

                            } catch (err) {
                                console.error(err);
                            } finally {
                                if (connection) {
                                    try {
                                        await connection.close();
                                    } catch (err) {
                                        console.error(err);
                                    }
                                }
                            }
                        }

                        run();

                    }
>>>>>>> 3383ba6bb682cbe4d128173317b124d28f3ab38d

                });
            }
        }
    });
});

function bail(err) {
    console.error(err);
    process.exit(1);
}

<<<<<<< HEAD
var doinsert_autocommit = function (conn, cb) {
    conn.batchInsert("insert into test values(:id, :name)"
    [{ id: 1, name: 'kevin' }],
    { autoCommit: true },
    function (err, result) {
            if (err) {
                return cb(err, conn)
            } else {
                console.log('OK');
                return cb(null, conn)
            }
        }
    )
};

=======
>>>>>>> 3383ba6bb682cbe4d128173317b124d28f3ab38d
var dorelease = function (conn) {
    conn.close(function (err) {
        if (err) console.error(err.message);
    });
};

var dbconnect = function (cb) {
    oracledb.getConnection(
        {
            user: dbconfig.user,
            password: dbconfig.password,
            connectString: dbconfig.connectString
        }, cb
    )
};

var PORT = process.env.PORT || 5001;

app.listen(PORT, function () {
    console.log('... xls upload on port ' + PORT);
});
