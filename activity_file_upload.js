/*eslint-disable*/
var express = require('express');
var multer = require('multer');
var app = express();
var morgan = require('morgan');
const ecsFormat = require('@elastic/ecs-morgan-format');

var data = require('./data.js');
const DIR = data.filePath;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan(ecsFormat()))
app.use((req, res, next) => {
    const allowedOrigins = [
        'http://127.0.0.1:4200',
        'http://localhost:4200',
        'http://127.0.0.1:3000',
        'http://localhost:3000',
        'http://ecollectweb.co-opbank.co.ke:8002',
        'http://ecollecttst.co-opbank.co.ke:8002'
    ];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', true);
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
    storage: storage
}).any();

app.get('/filesapi', function (req, res) {
    res.end('file uploader/downloader ....');
});

app.post('/filesapi/download', function (req, res) {
    res.sendFile(req.body.filename); 
});

app.post('/filesapi', function (req, res) {
    upload(req, res, function (err) {
        if (err) {
            res.json({
                success: false,
                message: err.toString()
            })
        } else {
            res.json({
                success: true,
                files: req.files
            })
        }
        //res.end('File is uploaded');
    });
});

var PORT = process.env.PORT || 3000;

app.listen(PORT, function () {
    console.log('Working on port ' + PORT);
});

