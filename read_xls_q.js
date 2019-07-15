var express = require('express');
var amqp = require('amqplib/callback_api');
var express = require("express");
var oracledb = require('oracledb');
oracledb.outFormat = oracledb.OBJECT;
oracledb.autoCommit = true;
var dbConfig = require('./dbconfig.js');
var app = express();

port = 2600;

function doRelease(connection) {
    connection.close(
        function (err) {
            if (err)
                console.error(err.message);
        });
}

function bail(err) {
    console.error(err);
    process.exit(1);
}

amqp.connect('amqp://guest:guest@localhost', (err, conn) => {
    if (err != null) bail(err);
    conn.createChannel(on_open);
    function on_open(err, ch) {
        if (err != null) bail(err);
        var queue = 'xlsupload';
        ch.assertQueue(queue, { durable: false });
        console.log('waiting for messages in xls queue')
        ch.consume(queue, (message) => {
            var buf = message.content
            var bulk = JSON.parse(buf.toString());
            let success = 0;
            let failed = 0;
            let sql = '';
            let insertALL = ' '
            const total = bulk.length;
            
                for (var i = 0; i < total; i++) {
                    const owner = 'kmiguta';
                    const accnumber = bulk[i].accnumber;
                    const custnumber = (bulk[i].accnumber).substring(5, 12);
                    const notemade = bulk[i].notemade;
                    const notesrc = 'uploaded a note';

                    sql = " into notehis (accnumber,custnumber,owner,notesrc, notemade) values('" + accnumber + "','" + custnumber + "','" + owner + "','" + notesrc + "','" + notemade + "')";
                    // console.log(sql);
                    sql = ' ' + sql + ' ';
                    console.log(sql);

                    /*(async function () {
                        let connection;
                        try{
                            connection = await oracledb.getConnection({
                                user: dbConfig.user,
                                password: dbConfig.password,
                                connectString: dbConfig.connectString
                            });
                            await connection.execute(sql);
                            success = success + 1;
                            console.log('success=' + success)
                        } catch (err) {
                            console.log(err);
                            failed = failed + 1;
                            console.log('failed=' + failed)
                        } finally {
                            if (connection) {
                                try {
                                    await connection.close();
                                } catch (error) {
                                    console.log(error)
                                }
                            }
                        }
                        
                    })();*/
                    console.log(parseInt(i)==parseInt(total) - 1);
                    if (parseInt(i)==parseInt(total) - 1 ) {
                        var status = {
                            status: 'complete',
                            success: success,
                            failed: total - success,
                            total: total
                        };
                        console.log('===================================================================='); 
                        console.log(status); 
                    }
                }

                console.log('insert all ' + sql + ' select * from dual');

                   /*oracledb.getConnection({
                        user: dbConfig.user,
                        password: dbConfig.password,
                        connectString: dbConfig.connectString
                    }, function(err, conn){
                        if (err) {
                            console.log(err.message);
                            return;
                        }
                        conn.execute(sql, function(err, result){
                            if (err) {
                                console.log(err.message);
                                dorelease(conn);
                                return;
                            }
                            success = success + 1;
                            console.log('success=' + success)
                        });
                    }); */
                
  
        }, { noAck: true }) 
    }
})

function dorelease(connection) {
    connection.close(function(err){
        if (err) {
            console.log(err.message);
            return;
        }
    });
}

app.listen(port, () => console.log('read_xls_q app running port ' + port))