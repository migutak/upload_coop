    /*eslint-disable*/
    var express = require('express');
    var multer = require('multer');
    var fs = require('fs');
    var cors = require('cors');
    var request = require('request');
    const bodyParser = require('body-parser');
    var app = express();

    var data = require('./data.js');
    var async = require('async');
    var oracledb = require('oracledb');
    var dbConfig = require('./dbconfig.js');

    const DIR = data.filePath;
    

    const API = data.apiPath;
    const CORS = data.cors;

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
                      console.log(bulk)
                      //insert
                      var doinsert2 = function (conn, cb) {
                        /*conn.execute(
                          "INSERT INTO test VALUES (:id, :nm)",
                          [2, 'Alison'],  // 'bind by position' syntax
                          { autoCommit: true },  // commit once for all DML in the script
                          function(err, result) {
                            if (err) {
                              return cb(err, conn);
                            } else {
                              console.log("Rows inserted: " + result.rowsAffected);  // 1
                              return cb(null, conn);
                            }
                          });*/
                          
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
                      /*request.post({
                        headers: {'content-type' : 'application/json'},
                        url:     API,
                        json:    bulk
                      }, function(error, response, body){
                        if(error) console.log(error);
                        if (!error && response.statusCode == 200) {
                            console.log('uploaded ==> ', body)
                        }
                      });*/
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