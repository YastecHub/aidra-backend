import multer from 'multer';
import cloudinary, { assertCloudinaryConfigured } from '../config/cloudinary';
import { ValidationClientException } from '../utils/clientError';

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const ALLOWED_MIMES = ['application/pdf', 'image/jpeg', 'image/png'];
const ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/gif'];
const CLOUDINARY_KYC_FOLDER = 'aidra/kyc';
const CLOUDINARY_CAMPAIGNS_FOLDER = 'aidra/campaigns';

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (ALLOWED_MIMES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ValidationClientException('Invalid file type. Only PDF, JPEG, and PNG are allowed.'));
  }
};

export const uploadKYC = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE
  }
});

const imageFileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (ALLOWED_IMAGE_MIMES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ValidationClientException('Invalid file type. Only JPEG, PNG, and GIF images are allowed.'));
  }
};

export const uploadCampaignImage = multer({
  storage: multer.memoryStorage(),
  fileFilter: imageFileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE
  }
});

const uploadDataUriToCloudinary = async (dataUri: string, folder: string = CLOUDINARY_KYC_FOLDER): Promise<string> => {
  assertCloudinaryConfigured();

  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
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
const IMAGE_SIGNATURES = [
  { prefix: '/9j/', mime: 'image/jpeg' },
  { prefix: 'iVBORw0KGgo', mime: 'image/png' },
  { prefix: 'R0lGODdh', mime: 'image/gif' },
  { prefix: 'R0lGODlh', mime: 'image/gif' }
];

const normalizeBase64ImageToDataUri = (value: unknown): string => {
  if (typeof value !== 'string' || !value.trim()) {
    throw new ValidationClientException('Image must be a non-empty base64 string or data URI');
  }

  const trimmed = value.trim();
  if (trimmed.startsWith('data:')) {
    const match = trimmed.match(DATA_URI_REGEX);
    if (!match) {
      throw new ValidationClientException('Image must be a valid base64 data URI (expected "data:<mime>;base64,<payload>")');
    }

    const mime = match[1];
    if (!ALLOWED_IMAGE_MIMES.includes(mime)) {
      throw new ValidationClientException(`Image MIME type "${mime}" is not allowed. Only JPEG, PNG, and GIF are supported.`);
    }

    return trimmed;
  }

  const signature = IMAGE_SIGNATURES.find((sig) => trimmed.startsWith(sig.prefix));
  if (!signature) {
    throw new ValidationClientException('Image must be a valid base64-encoded JPEG, PNG, or GIF image');
  }

  return `data:${signature.mime};base64,${trimmed}`;
};

export const uploadBase64ImageToCloudinary = async (image: unknown): Promise<string> => {
  const dataUri = normalizeBase64ImageToDataUri(image);
  return uploadDataUriToCloudinary(dataUri, CLOUDINARY_CAMPAIGNS_FOLDER);
};

export const uploadCampaignFileToCloudinary = async (file: Express.Multer.File): Promise<string> => {
  const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
  return uploadDataUriToCloudinary(dataUri, CLOUDINARY_CAMPAIGNS_FOLDER);
};

export const uploadBase64KYCToCloudinary = async (documents: unknown[]): Promise<string[]> => {
  const urls: string[] = [];

  for (let i = 0; i < documents.length; i++) {
    const entry = documents[i];

    if (typeof entry !== 'string') {
      throw new ValidationClientException(`documents[${i}] must be a base64 data URI string`);
    }

    const match = entry.match(DATA_URI_REGEX);
    if (!match) {
      throw new ValidationClientException(`documents[${i}] is not a valid base64 data URI (expected "data:<mime>;base64,<payload>")`);
    }

    const [, mime, payload] = match;

    if (!ALLOWED_MIMES.includes(mime)) {
      throw new ValidationClientException(`documents[${i}] has invalid file type "${mime}". Only PDF, JPEG, and PNG are allowed.`);
    }

    const sizeBytes = Math.floor((payload.length * 3) / 4);
    if (sizeBytes > MAX_FILE_SIZE) {
      throw new ValidationClientException(`documents[${i}] exceeds the 50MB size limit`);
    }

    urls.push(await uploadDataUriToCloudinary(entry));
  }

  return urls;
};
