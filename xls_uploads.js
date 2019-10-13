/*eslint-disable*/
var express = require('express');
var multer = require('multer');
var path = require('path');
const bodyParser = require('body-parser');
var dbconfig = require('./dbconfig');
var mongoxlsx = require('mongo-xlsx');
var oracledb = require('oracledb');
var SimpleOracleDB = require('simple-oracledb');

var app = express();

var data = require('./data.js');

const DIR = data.filePath;
const CORS = data.cors;

SimpleOracleDB.extend(oracledb);
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
    res.json({ message: 'file catcher example' });
});

app.post('/xlsupload', function (req, res) {
    upload(req, res, function (err) {

        // var random = uniqid();
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

                });
            }
        }
    });
});

function bail(err) {
    console.error(err);
    process.exit(1);
}

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
