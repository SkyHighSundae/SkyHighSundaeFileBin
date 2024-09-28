// app.js
const express = require('express');
const multer = require('multer');
const uuid = require('uuid');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const port = 3000;

// Data files
const adminDataPath = './admin.json';
const filesDataPath = './data/files.json';
const bannedIPsPath = './data/banned_ips.json';

// Load admin key
const adminData = fs.readJsonSync(adminDataPath);
const adminKey = adminData.adminKey;

// Helper functions to load and save data
const loadJSON = (path) => fs.readJsonSync(path, { throws: false }) || {};
const saveJSON = (path, data) => fs.writeJsonSync(path, data);

// Localization Middleware
const locales = {
  en: require('./locales/en.json'),
  de: require('./locales/de.json'),
  ru: require('./locales/ru.json'),
  uk: require('./locales/uk.json'),
};

app.use((req, res, next) => {
  let lang = req.acceptsLanguages('en', 'de', 'ru', 'uk') || 'en';
  req.locale = locales[lang] || locales['en'];
  next();
});

// Serve essential static files for banned.html before IP detection
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));
app.use('/locales', express.static(path.join(__dirname, 'locales')));
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// IP Detection Middleware
app.set('trust proxy', true); // If behind a proxy like Nginx or a load balancer
app.use((req, res, next) => {
  let clientIP = req.ip.replace('::ffff:', ''); // Handle IPv4-mapped IPv6 addresses

  const bannedIPs = loadJSON(bannedIPsPath);

  if (bannedIPs[clientIP]) {
    // Allow access to banned.html and essential static assets
    if (
      req.path === '/banned.html' ||
      req.path.startsWith('/css/') ||
      req.path.startsWith('/js/') ||
      req.path.startsWith('/locales/') ||
      req.path.startsWith('/images/')
    ) {
      return next();
    } else {
      return res.sendFile(path.join(__dirname, 'public', 'banned.html'));
    }
  }

  next();
});

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve other static files
app.use(express.static('public'));

// Storage configuration for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'files/');
  },
  filename: (req, file, cb) => {
    const uniqueName = uuid.v4() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// Routes

// Upload Route
app.post('/upload', upload.single('file'), (req, res) => {
  const filesData = loadJSON(filesDataPath);
  const fileID = uuid.v4();
  const fileData = {
    id: fileID,
    originalName: req.file.originalname,
    storedName: req.file.filename,
    size: req.file.size,
    uploadDate: new Date(),
  };

  filesData[fileID] = fileData;
  saveJSON(filesDataPath, filesData);

  res.json({ link: `/file.html?id=${fileID}` });
});

// File Details API
app.get('/file/:id/details', (req, res) => {
  const filesData = loadJSON(filesDataPath);
  const fileData = filesData[req.params.id];

  if (!fileData) {
    return res.json({ error: req.locale.file_not_found });
  }

  res.json(fileData);
});

// File Download Action
app.get('/download/:id', (req, res) => {
  const filesData = loadJSON(filesDataPath);
  const fileData = filesData[req.params.id];

  if (!fileData) {
    return res.status(404).send(req.locale.file_not_found);
  }

  const filePath = path.join(__dirname, 'files', fileData.storedName);
  res.download(filePath, fileData.originalName);
});

// Serve rules.html when accessing /rules
app.get('/rules', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'rules.html'));
});

// Serve admin.html when accessing /admin
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Admin Authentication Middleware
const authenticateAdmin = (req, res, next) => {
  const key = req.headers['x-admin-key'] || req.query.key;

  if (key === adminKey) {
    next();
  } else {
    res.status(401).send('Unauthorized');
  }
};

// Admin Routes

// Get All Files
app.get('/admin/files', authenticateAdmin, (req, res) => {
  const filesData = loadJSON(filesDataPath);
  res.json(filesData);
});

// Delete a File
app.delete('/admin/files/:id', authenticateAdmin, (req, res) => {
  const filesData = loadJSON(filesDataPath);
  const fileData = filesData[req.params.id];

  if (fileData) {
    fs.unlinkSync(`files/${fileData.storedName}`);
    delete filesData[req.params.id];
    saveJSON(filesDataPath, filesData);
    res.json({ message: 'File deleted' });
  } else {
    res.status(404).json({ message: 'File not found' });
  }
});

// Ban an IP
app.post('/admin/ban', authenticateAdmin, (req, res) => {
  const bannedIPs = loadJSON(bannedIPsPath);
  const ipToBan = req.body.ip;

  bannedIPs[ipToBan] = true;
  saveJSON(bannedIPsPath, bannedIPs);

  res.json({ message: `IP ${ipToBan} has been banned` });
});

// Start the Server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
