import { v2 as cloudinary } from 'cloudinary';
import env from './env.js';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const uploadToCloudinary = async (file, folderName = 'employment-applications') => {
  if (!file) {
    return null;
  }

  const hasCloudinaryConfig = Boolean(
    env.CLOUDINARY_CLOUD_NAME &&
    env.CLOUDINARY_API_KEY &&
    env.CLOUDINARY_API_SECRET
  );

  if (!hasCloudinaryConfig) {
    return null;
  }

  const fileName = (file.originalname || 'document')
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .slice(0, 80) || 'document';

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: env.CLOUDINARY_FOLDER || folderName,
        resource_type: 'auto',
        public_id: `${fileName}-${Date.now()}`,
      },
      (error, uploadedFile) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(uploadedFile);
      }
    );

    stream.end(file.buffer);
  });

  return result?.secure_url || null;
};

export default cloudinary;
