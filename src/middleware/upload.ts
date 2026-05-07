import multer from 'multer';
import cloudinary from '../config/cloudinary';

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const ALLOWED_MIMES = ['application/pdf', 'image/jpeg', 'image/png'];
const CLOUDINARY_FOLDER = 'aidra/kyc';

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (ALLOWED_MIMES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, JPEG, and PNG are allowed.'));
  }
};

export const uploadKYC = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE
  }
});

const uploadDataUriToCloudinary = async (dataUri: string): Promise<string> => {
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: CLOUDINARY_FOLDER,
    resource_type: 'auto'
  });
  return result.secure_url;
};

export const uploadKYCFilesToCloudinary = async (files: Express.Multer.File[]): Promise<string[]> => {
  const urls: string[] = [];
  for (const file of files) {
    const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    urls.push(await uploadDataUriToCloudinary(dataUri));
  }
  return urls;
};

const DATA_URI_REGEX = /^data:([\w.+-]+\/[\w.+-]+);base64,(.+)$/;

export const uploadBase64KYCToCloudinary = async (documents: unknown[]): Promise<string[]> => {
  const urls: string[] = [];

  for (let i = 0; i < documents.length; i++) {
    const entry = documents[i];

    if (typeof entry !== 'string') {
      throw new Error(`documents[${i}] must be a base64 data URI string`);
    }

    const match = entry.match(DATA_URI_REGEX);
    if (!match) {
      throw new Error(`documents[${i}] is not a valid base64 data URI (expected "data:<mime>;base64,<payload>")`);
    }

    const [, mime, payload] = match;

    if (!ALLOWED_MIMES.includes(mime)) {
      throw new Error(`documents[${i}] has invalid file type "${mime}". Only PDF, JPEG, and PNG are allowed.`);
    }

    const sizeBytes = Math.floor((payload.length * 3) / 4);
    if (sizeBytes > MAX_FILE_SIZE) {
      throw new Error(`documents[${i}] exceeds the 50MB size limit`);
    }

    urls.push(await uploadDataUriToCloudinary(entry));
  }

  return urls;
};
