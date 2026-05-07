import multer from 'multer';
import path from 'path';
import fs from 'fs';

const KYC_UPLOAD_DIR = 'uploads/kyc/';
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const ALLOWED_MIMES = ['application/pdf', 'image/jpeg', 'image/png'];

const MIME_EXTENSIONS: Record<string, string> = {
  'application/pdf': '.pdf',
  'image/jpeg': '.jpeg',
  'image/png': '.png'
};

fs.mkdirSync(KYC_UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, KYC_UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (ALLOWED_MIMES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, JPEG, and PNG are allowed.'));
  }
};

export const uploadKYC = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE
  }
});

const DATA_URI_REGEX = /^data:([\w.+-]+\/[\w.+-]+);base64,(.+)$/;

export const saveBase64KYCDocuments = async (documents: unknown[]): Promise<string[]> => {
  const paths: string[] = [];

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

    const buffer = Buffer.from(payload, 'base64');
    if (buffer.length === 0) {
      throw new Error(`documents[${i}] decoded to an empty buffer`);
    }
    if (buffer.length > MAX_FILE_SIZE) {
      throw new Error(`documents[${i}] exceeds the 50MB size limit`);
    }

    const ext = MIME_EXTENSIONS[mime];
    const filename = `documents-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const filePath = path.join(KYC_UPLOAD_DIR, filename);

    await fs.promises.writeFile(filePath, buffer);
    paths.push(filePath);
  }

  return paths;
};
