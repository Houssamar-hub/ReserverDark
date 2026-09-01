import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const avatarUploadDir = path.join(__dirname, '../uploads/avatars');
export const propertyUploadDir = path.join(__dirname, '../uploads/properties');
fs.mkdirSync(avatarUploadDir, { recursive: true });
fs.mkdirSync(propertyUploadDir, { recursive: true });

const propertyStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, propertyUploadDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'property-' + uniqueSuffix + path.extname(file.originalname));
  },
});

export const uploadPropertyFiles = multer({
  storage: propertyStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'), false);
    }
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only images are allowed (jpeg, jpg, png, gif, webp)'), false);
  }
};

export const upload = multer({
  storage: propertyStorage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: fileFilter,
});

const avatarStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, avatarUploadDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  },
});

export const uploadAvatarFile = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});