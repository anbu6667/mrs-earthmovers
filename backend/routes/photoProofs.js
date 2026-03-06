const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth, roleAuth } = require('../middleware/auth');  
const photoProofController = require('../controllers/photoProofController');

const router = express.Router();

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const safeExt = path.extname(file.originalname || '').toLowerCase() || '.jpg';
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
});

// multipart/form-data:
// - file: image
// - workAssignment, workRequest, type (BEFORE/DURING/AFTER), title, description, latitude, longitude, accuracy, address
router.post('/', auth, roleAuth(['DRIVER', 'ADMIN']), upload.single('file'), (req, res) =>
  photoProofController.create(req, res)
);

module.exports = router;
