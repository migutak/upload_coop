const express = require('express');
const multer = require('multer');
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
  }
});

let upload = multer({
  storage: storage
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//app.use(cors())

app.use((req, res, next) => {
  const allowedOrigins = [
      'http://127.0.0.1:4200',
      'http://localhost:4200',
      'http://127.0.0.1:3000',
      'http://localhost:3000',
      'http://ecollectweb.co-opbank.co.ke:8002',
      'http://ecollecttst.co-opbank.co.ke:8002'
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS'); 
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', true);
  if (req.method === 'OPTIONS') {
      res.status(200);
  } 
  next();
});

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
  res.download(req.body.filename);
});

app.post('/download', function (req, res) {
  res.download(req.body.filename);
});


const PORT = process.env.PORT || 4000;

app.listen(PORT, function () {
  console.log('upload running on port ' + PORT);
});