    /*eslint-disable*/
    var express = require('express');
    var multer = require('multer');
    const bodyParser = require('body-parser');
    var app = express();

    var data = require('./data.js');
    var async = require('async');
    var oracledb = require('oracledb');
    var dbConfig = require('./dbconfig.js');

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

    var doconnect = function(cb) {
        oracledb.getConnection(
          {
            user          : dbConfig.user,
            password      : dbConfig.password,
            connectString : dbConfig.connectString
          },
          cb);
      };
      
      var dorelease = function(conn) {
        conn.close(function (err) {
          if (err)
            console.error(err.message);
        });
      };
      

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
        upload(req, res, function (err) {
            if (err) {
                // return res.end(err.toString());
                res.json({
                    success: false,
                    message: err.toString()
                })
            } else {
                for (i=0; i<req.files.length; i++) {
                    const bulk = {
                        'accnumber': req.body.accnumber,
                        'custnumber': req.body.custnumber,
                        'address': 'none',
                        'email': 'none',
                        'telnumber': 'none',
                        'filepath': req.files[i].path,
                        'filename': req.files[i].originalname,
                        'datesent': new Date(),
                        'owner': req.body.owner,
                        'byemail': false,
                        'byphysical': true,
                        'bypost': true,
                        'demand': req.body.demand
                      };
                      //insert
                      var doinsert2 = function (conn, cb) {
                          
                          var sql = "INSERT INTO demandshistory (accnumber, custnumber) VALUES (:accnumber, :custnumber)";
                          var binds = bulk;
                        
                          // bindDefs is optional for IN binds but it is generally recommended.
                          // Without it the data must be scanned to find sizes and types.
                          var options = {
                            autoCommit: true,
                            bindDefs: {
                              accnumber: { type: oracledb.STRING },
                              custnumber: { type: oracledb.STRING, maxSize: 255 }
                            } };
                        
                          conn.executeMany(sql, binds, options, function (err, result) {
                            if (err)
                              return cb(err, conn);
                            else {
                              console.log("Result is:", result);
                              return cb(null, conn);
                            }
                          });
                      };
                      //
                      async.waterfall(
                        [
                          doinsert2
                        ],
                        function (err, conn) {
                          if (err) { 
                              console.error("In waterfall error cb: ==>", err, "<=="); 
                            } else {
                                console.log('insert success ==> ')
                            }
                          if (conn)
                            dorelease(conn);
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

    var PORT = process.env.PORT || 5000;

    app.listen(PORT, function () {
        console.log('Working on port ' + PORT);
    });