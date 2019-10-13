    /*eslint-disable*/
    var express = require('express');
    var multer = require('multer');
    const bodyParser = require('body-parser');
    var app = express();

    var data = require('./data.js');

    const DIR = data.filePath;
    const CORS = data.cors;

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
        storage: storage
      }).any();

    app.get('/filesapi', function (req, res) {
        res.json({ message: 'filesapi' });
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

    app.post('/filesapi/download', function (req, res) {
        // res.end('file catcher .... Home');
        res.sendFile(req.body.filename);
    });

    var PORT = process.env.PORT || 3000;

    app.listen(PORT, function () {
        console.log('activity_file_uploads on port ' + PORT);
    });