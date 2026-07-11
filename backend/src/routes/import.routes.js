const express = require('express');
const router = express.Router();
const multer = require('multer');
const { importCsv } = require('../controllers/import.controller');

// Store file in memory — no disk I/O needed
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  fileFilter: (_req, file, cb) => {
    if (
      file.mimetype === 'text/csv' ||
      file.originalname.toLowerCase().endsWith('.csv')
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  },
});

router.post('/import', upload.single('file'), importCsv);

module.exports = router;
