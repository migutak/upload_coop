    /*eslint-disable*/
    var express = require('express');
    var multer = require('multer');
    var path = require('path');
    var fs = require('fs');
    var cors = require('cors');
    var request = require('request');
    const bodyParser = require('body-parser');
    const XLSX = require('xlsx');
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

    app.get('/api', function (req, res) {
        res.end('file catcher example');
    });

    app.post('/api', function (req, res) {
        upload(req, res, function (err) {

            if (err) {
                // return res.end(err.toString());
                res.json({
                    success: false,
                    message: err.toString()
                })
            } else {
                for (i=0; i<req.files.length; i++) {
                    // console.log('files ==> ' + i, req.files[i]);
                    const workbook = XLSX.readFile(req.files[i].path);
                    const sheet_name = workbook.SheetNames;
                    const bulk = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name[0]]);
                    // console.log('bulk==>', bulk.length);

                    //
                    for (x=0; x<bulk.length; x++) {
                        bulk[x].owner = 'kmiguta';
                        bulk[x].notesrc = 'uploaded a note';
                        // console.log('bulk ==> ' + x, bulk);
                    }

                    console.log('bulk', bulk);
                    
                      request.post({
                        headers: {'content-type' : 'application/json'},
                        url:     API + '/api/notehis',
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

    var PORT = process.env.PORT || 3001;

    app.listen(PORT, function () {
        console.log('Working on port ' + PORT);
    });