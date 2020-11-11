const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express();
var data = require('./data.js');


const DIR = data.filePath;

let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, DIR);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
    // + '-' + Date.now() + '.' + path.extname(file.originalname)
  }
});
let upload = multer({
  storage: storage
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cors())

/*app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', 'http://ecollectapp.co-opbank.co.ke:3001');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();node 
});*/

app.get('/filesapi', function (req, res) {
  res.json({ message: 'filesapi' });
});

app.post('/filesapi/upload', upload.single('photo'), function (req, res) {
  if (!req.file) {
    return res.json({
      success: false
    });

  } else {
    return res.json({
      success: true,
      file: req.file
    })
  }
});

app.post('/filesapi/pdf', upload.any(), function (req, res) {
  console.log(req.files)
  if (!req.files) {
    console.log("No file received");
    return res.json({
      success: false
    });

  } else {
    return res.json({
      success: true,
      file: req.files
    })
  }
});

app.post('/filesapi/download', function (req, res) {
  res.sendFile(req.body.filename);
});

app.post('/download', function (req, res) {
  res.sendFile(req.body.filename);
});


const PORT = process.env.PORT || 4000;

app.listen(PORT, function () {
  console.log('Node.js server is running on port ' + PORT);
});