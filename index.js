const express = require('express');
const multer = require('multer');
const cors = require('cors')
const app = express();
var data = require('./data.js');
var morgan = require('morgan');
const ecsFormat = require('@elastic/ecs-morgan-format');

const DIR = data.filePath;

let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, DIR);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
let upload = multer({
  storage: storage
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors())

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
  console.log('upload running on port ' + PORT);
});