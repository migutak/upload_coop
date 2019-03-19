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

    app.get('/api', function (req, res) {
        res.end('file catcher example');
    });

    app.post('/api', function (req, res) {
        console.log('body==>' , req.body);
        upload(req, res, function (err) {

            if (err) {
                // return res.end(err.toString());
                res.json({
                    success: false,
                    message: err.toString()
                })
            } else {
                for (i=0; i<req.files.length; i++) {
                    console.log('files ==> ' + i, req.files[i]);
                    const bulk = {
                        'accnumber': req.body.accnumber,
                        'custnumber': req.body.custnumber,
                        'destpath': req.files[i].path,
                        'filename': req.files[i].originalname,
                        'colofficer': req.body.owner,
                        'filetype': req.files[i].mimetype,
                        'filesize': req.files[i].size,
                        'doctype': 'user_activity_upload',
                        'docdesc': req.body.docdesc
                      };
                      console.log(bulk)
                      request.post({
                        headers: {'content-type' : 'application/json'},
                        url:     'http://localhost:8800/api/uploads',
                        json:    bulk
                      }, function(error, response, body){
                        if(error) console.log(error);
                        if (!error && response.statusCode == 200) {
                            console.log('uploaded ==> ', body)
                        }
                      });
                }
                res.json({
                    success: true,
                    files: req.files
                })
            }
            res.end('File is uploaded');
        });
    });

    var PORT = process.env.PORT || 3000;

    app.listen(PORT, function () {
        console.log('Working on port ' + PORT);
    });