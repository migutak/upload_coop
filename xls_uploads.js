/*eslint-disable*/
var express = require('express');
var multer = require('multer');
var path = require('path');
var fs = require('fs');
var cors = require('cors');
var amqp = require('amqplib/callback_api');
const bodyParser = require('body-parser');
const XLSX = require('xlsx');
var MongoClient = require('mongodb').MongoClient;
var dbconfig = require('./dbconfig');
var mongoxlsx = require('mongo-xlsx');
var moment = require('moment');
var app = express();

var data = require('./data.js');

const DIR = data.filePath;
const CORS = data.cors;

const API = data.apiPath;

// app.use(cors());

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
        console.log(req.body)
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
                    
                    
                    for (x = 0; x < data.length; x++) {
                        let bulknote = {};
                        // console.log(data[x]);
                        if (sys === 'cc' || sys === 'watchcc') {
                            bulknote.custnumber = data[x].accnumber;
                          } else {
                            bulknote.custnumber = (data[x].accnumber).substring(5, 12);
                          }
                        bulknote.accnumber = data[x].accnumber;
                        bulknote.notemade = data[x].notemade;
                        bulknote.custnumber = (data[x].accnumber).substring(5, 12);
                        bulknote.owner = username
                        bulknote.notesrc = 'uploaded a note';
                        bulknote.notedate = moment().format();


                        bulknotes.push(bulknote);
                    }

                    // console.log(bulknotes);
                    // send to mongo
                    MongoClient.connect(dbconfig.mongo, { useNewUrlParser: true }, function (err, db) {
                        if (err) throw err;
                        // console.log("Database created!");
                        var dbo = db.db("easy-notes");
                        dbo.collection("notes").insertMany(bulknotes, { forceServerObjectId: true }, function (err, resp) {
                            if (err) throw err;
                           // console.log("1 document inserted");
                            res.json({
                                success: true,
                                files: req.files,
                                notes: bulknotes
                            })
                            db.close();
                        });
                    });

                });

            }
        }
    });
});

function bail(err) {
    console.error(err);
    process.exit(1);
}

var PORT = process.env.PORT || 3001;

app.listen(PORT, function () {
    console.log('xls upload on port ' + PORT);
});