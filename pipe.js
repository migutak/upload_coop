const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express();
var data = require('./data.js');
const fileUpload = require('express-fileupload');

// default options
app.use(fileUpload());

const DIR = data.filePath;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cors())

app.get('/upload', function (req, res) {
  res.send({
    status: 'OK',
    message: 'Upload is running!'
  });
});

app.post('/upload', function(req, res) {
  // console.log(req.body);
  // console.log(req.files.file);
  if (Object.keys(req.files).length == 0) {
    return res.status(400).send('No files were uploaded.');
  }

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let sampleFile = req.files.file;

  // Use the mv() method to place the file somewhere on your server
  sampleFile.mv('/home/ecollectadmin/demandletters/' + req.files.file.name, function(err) {
    if (err)
      return res.status(500).send(err);

    res.send('File uploaded!');
  });
});

app.post('/download', function (req, res) {
  res.sendFile(req.body.filename);
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, function () {
  console.log('Piped server is running on port ' + PORT);
});