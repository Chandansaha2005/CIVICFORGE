import multer from 'multer';
import path from 'path';
import fs from 'fs';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer Disk Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

export const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

/**
 * Cloud Storage Adapter Function (e.g. Cloudinary, AWS S3, Google Cloud Storage)
 * 
 * TODO: Swappable adapter for cloud deployments. 
 * Integrate Cloudinary SDK or standard cloud buckets here.
 * In production, you would replace local storage paths with remote secure URLs.
 */
export async function uploadToCloud(localFilePath: string): Promise<string> {
  // Example Cloudinary stub implementation:
  // import { v2 as cloudinary } from 'cloudinary';
  // const result = await cloudinary.uploader.upload(localFilePath);
  // return result.secure_url;
  
  // For MVP, return a locally resolvable relative URL
  const filename = path.basename(localFilePath);
  return `/uploads/${filename}`;
}
