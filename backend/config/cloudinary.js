import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configure cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure where and how files are stored in cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'complaint-system',  // folder name in cloudinary
    allowed_formats: [
      'jpg', 'jpeg', 'png',      // images
      'pdf', 'doc', 'docx'       // documents
    ],
    resource_type: 'auto',       // auto detect file type
  },
});

// Create multer upload handler
// limits: max file size = 5MB
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export default cloudinary;