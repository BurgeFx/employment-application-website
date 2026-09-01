import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';
import env from './env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsRoot = path.join(__dirname, '../../uploads/applications');
const UPLOAD_TIMEOUT_MS = Number(process.env.CLOUDINARY_UPLOAD_TIMEOUT_MS || 120000);

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
  timeout: UPLOAD_TIMEOUT_MS,
});

const sanitizeFileName = (originalName) => (originalName || 'document')
  .replace(/\.[^/.]+$/, '')
  .replace(/[^a-zA-Z0-9_-]+/g, '-')
  .slice(0, 80) || 'document';

async function saveFileLocally(file, folderName) {
  const folder = folderName.split('/').pop() || 'documents';
  const dir = path.join(uploadsRoot, folder);
  await fs.mkdir(dir, { recursive: true });

  const ext = path.extname(file.originalname || '') || '';
  const fileName = `${sanitizeFileName(file.originalname)}-${Date.now()}${ext}`;
  await fs.writeFile(path.join(dir, fileName), file.buffer);

  return `/uploads/applications/${folder}/${fileName}`;
}

async function uploadToCloudinaryRemote(file, folderName) {
  const fileName = sanitizeFileName(file.originalname);

  const uploadPromise = new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: env.CLOUDINARY_FOLDER || folderName,
        resource_type: 'auto',
        public_id: `${fileName}-${Date.now()}`,
        timeout: UPLOAD_TIMEOUT_MS,
      },
      (error, uploadedFile) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(uploadedFile?.secure_url || null);
      }
    );

    stream.end(file.buffer);
  });

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      const error = new Error('File upload timed out. Saving locally instead.');
      error.name = 'TimeoutError';
      error.http_code = 499;
      reject(error);
    }, UPLOAD_TIMEOUT_MS);
  });

  return Promise.race([uploadPromise, timeoutPromise]);
}

export const uploadToCloudinary = async (file, folderName = 'employment-applications') => {
  if (!file) {
    return null;
  }

  const hasCloudinaryConfig = Boolean(
    env.CLOUDINARY_CLOUD_NAME &&
    env.CLOUDINARY_API_KEY &&
    env.CLOUDINARY_API_SECRET
  );

  if (hasCloudinaryConfig) {
    try {
      const remoteUrl = await uploadToCloudinaryRemote(file, folderName);
      if (remoteUrl) {
        return remoteUrl;
      }
    } catch (error) {
      console.warn('Cloudinary upload failed, saving locally:', error.message || error);
    }
  }

  return saveFileLocally(file, folderName);
};

export default cloudinary;
