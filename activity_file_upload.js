/*eslint-disable*/
var express = require('express');
var multer = require('multer');
var cors = require('cors');
const bodyParser = require('body-parser');
const pdf2base64 = require('pdf-to-base64');
var app = express();

var data = require('./data.js');

const DIR = data.filePath;
const CORS = data.cors;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// app.use(cors())
app.use(cors({ credentials: true, origin: CORS }));
/*app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', CORS);
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});*/

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
    res.json({ message: 'filesapi for activity_file_upload' });
});

app.post('/filesapi', function (req, res) {
    upload(req, res, function (err) {
        convertbase64(req.files[0].path);
        if (err) {
            // return res.end(err.toString());
            res.json({
                success: false,
                message: err.toString()
            })
        } else {
            res.json({
                success: true,
                files: req.files,
                code: ''
            })
        }
        res.end('File is uploaded');
    });
});

app.post('/filesapi/download', function (req, res) {
    res.sendFile(req.body.filename);
});

app.post('/demanddownload/filesapi/download', function (req, res) {
    res.sendFile(req.body.filename);
});

app.get('/filesapi/download/bpms', function (req, res) {
    var filename = req.query.filename;
    res.download(filename);
});

function convertbase64(filepath) {
    pdf2base64(filepath)
        .then(
            (response) => {
                console.log(response);
            }
        )
        .catch(
            (error) => {
                console.log(error);
            }
        )
}

var PORT = process.env.PORT || 3000;

app.listen(PORT, function () {
    console.log('activity_file_uploads on port ' + PORT);
});