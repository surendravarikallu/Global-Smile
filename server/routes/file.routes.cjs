const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ─── Allowed File Types ────────────────────────
const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'application/pdf',
  'application/dicom', 'application/octet-stream', // DICOM files
];

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.pdf', '.dcm'];

// ─── Multer Config with Validation ─────────────
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    // Sanitize original filename to prevent path traversal
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
    cb(null, safeName);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeOk = ALLOWED_MIME_TYPES.includes(file.mimetype);
  const extOk = ALLOWED_EXTENSIONS.includes(ext);

  if (mimeOk && extOk) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed. Accepted: ${ALLOWED_EXTENSIONS.join(', ')}`));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter,
});

// ─── Upload Endpoint ───────────────────────────
router.post('/upload', (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: 'File too large. Maximum size is 10MB.' });
      }
      return res.status(400).json({ error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    res.json({
      file: {
        id: Date.now().toString(),
        filename: req.file.filename,
        originalName: req.file.originalname,
        url: `/uploads/${req.file.filename}`,
        size: req.file.size,
        mimeType: req.file.mimetype,
        uploadedAt: new Date().toISOString(),
      },
    });
  });
});

// ─── Batch Upload (Multi-image dental scans) ───
router.post('/upload-batch', (req, res) => {
  upload.array('files', 10)(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: 'File too large. Maximum size is 10MB per file.' });
      }
      return res.status(400).json({ error: err.message });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    const uploaded = req.files.map((file, idx) => ({
      id: `${Date.now()}-${idx}`,
      filename: file.filename,
      originalName: file.originalname,
      url: `/uploads/${file.filename}`,
      size: file.size,
      mimeType: file.mimetype,
      category: file.mimetype.startsWith('image/') ? 'dental-image' : 'document',
      uploadedAt: new Date().toISOString(),
    }));
    res.json({ files: uploaded, count: uploaded.length });
  });
});

// ─── Get Patient Files ─────────────────────────
router.get('/:patientId', (req, res) => {
  const { patientId } = req.params;
  if (!patientId || patientId.length > 50) {
    return res.status(400).json({ error: 'Invalid patient ID' });
  }
  res.json({
    files: [
      { id: '1', filename: 'panoramic-xray.jpg', category: 'X-Ray', uploadedAt: '2025-09-01', size: 2400000 },
      { id: '2', filename: 'smile-photo.jpg', category: 'Photo', uploadedAt: '2025-08-15', size: 1800000 },
      { id: '3', filename: 'treatment-plan.pdf', category: 'Report', uploadedAt: '2025-09-15', size: 450000 },
    ],
  });
});

module.exports = router;
