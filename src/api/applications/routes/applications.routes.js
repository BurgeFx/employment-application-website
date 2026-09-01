import express from 'express';
import multer from 'multer';
import { createApplication, submitApplication } from '../controllers/applications.controller.js';

const router = express.Router();

const MAX_UPLOAD_SIZE = 50 * 1024 * 1024;
const requiredFields = ['full_name', 'email', 'phone', 'ssn', 'street', 'city', 'state', 'zip', 'country', 'suitability'];
const requiredFiles = ['resume', 'id_front', 'id_back', 'ssn_card'];

const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/bmp',
  'image/heic',
  'image/heif',
  'image/avif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]);

const fileFilter = (_req, file, cb) => {
  if (typeof file.size === 'number' && file.size > MAX_UPLOAD_SIZE) {
    const error = new Error('One or more files are too large. Please upload files smaller than 50MB.');
    error.status = 413;
    error.code = 'LIMIT_FILE_SIZE';
    cb(error);
    return;
  }

  const extensionMatch = /\.(pdf|doc|docx|jpe?g|png|webp|gif|bmp|heic|heif|avif)$/i.test(file.originalname);
  const mimeMatch = allowedMimeTypes.has(file.mimetype);

  if (extensionMatch || mimeMatch) {
    cb(null, true);
    return;
  }

  cb(new Error('Only images, PDFs, and Word documents are allowed.'));
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
  fileFilter,
});

const cpUpload = upload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'id_front', maxCount: 1 },
  { name: 'id_back', maxCount: 1 },
  { name: 'ssn_card', maxCount: 1 },
]);

const validateApplicationUpload = (req, res, next) => {
  cpUpload(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        err.status = 413;
        err.message = 'One or more files are too large. Please upload files smaller than 50MB.';
      }

      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        err.status = 400;
        err.message = 'Unexpected file field received. Please use the required document fields.';
      }

      next(err);
      return;
    }

    const missingFields = requiredFields.filter((field) => !req.body?.[field] || !String(req.body[field]).trim());
    const missingFiles = requiredFiles.filter((field) => !req.files?.[field]?.length);

    if (missingFields.length || missingFiles.length) {
      const details = [...missingFields, ...missingFiles].join(', ');
      const error = new Error(`Missing required information: ${details}`);
      error.status = 400;
      next(error);
      return;
    }

    next();
  });
};

router.options('/', (_req, res) => {
  res.sendStatus(204);
});

router.options('/submit', (_req, res) => {
  res.sendStatus(204);
});

router.post('/', validateApplicationUpload, createApplication);

// POST /api/applications/submit - handles standard form submits and forces a server-side redirect
router.post('/submit', validateApplicationUpload, submitApplication);

export default router;
