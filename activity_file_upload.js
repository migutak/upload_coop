    /*eslint-disable*/
    var express = require('express');
    var multer = require('multer');
    var fs = require('fs');
    var cors = require('cors');
    var request = require('request');
    const bodyParser = require('body-parser');
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

    // app.use(multer({dest:'./uploads/'}).single('photo'))
    /*app.use(multer({
        dest: DIR,
        rename: function (fieldname, filename) {
            return Date.now() + filename;
        },
        onFileUploadStart: function (file) {
            console.log(file.originalname + ' is starting ...');
        },
        onFileUploadComplete: function (file) {
            console.log(file.fieldname + ' uploaded to  ' + file.path);
        }
    }).any());*/

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
        res.end('file catcher .... Home');
    });

    app.post('/filesapi', function (req, res) {
        upload(req, res, function (err) {

            if (err) {
                // return res.end(err.toString());
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
            res.end('File is uploaded');
        });
    });

    app.post('/filesapi/filesapi/download', function (req, res) {
        // res.end('file catcher .... Home');
        res.sendFile(req.body.filename);
    });

    var PORT = process.env.PORT || 3000;

    app.listen(PORT, function () {
        console.log('Working on port ' + PORT);
    });