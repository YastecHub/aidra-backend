import { v2 as cloudinary } from 'cloudinary';

const CLOUDINARY_ENV_KEYS = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export const assertCloudinaryConfigured = (): void => {
  const missingKeys = CLOUDINARY_ENV_KEYS.filter((key) => !process.env[key]);

  if (missingKeys.length) {
    throw new Error(`Cloudinary is not configured. Missing env var(s): ${missingKeys.join(', ')}`);
  }
};

export default cloudinary;
