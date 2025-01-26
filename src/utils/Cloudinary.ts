import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Directly set Cloudinary configuration
cloudinary.config({
  cloud_name: 'dzu6yhrx4', // Hardcoded Cloudinary cloud name
  api_key: '896987324758448', // Hardcoded Cloudinary API key
  api_secret: 'yd_mt7d3-ZCn7sb_ELcD5o8PnPk', // Hardcoded Cloudinary API secret
});

// Debugging: Log Cloudinary config to ensure values are correct
console.log('Cloudinary Configuration:');
console.log('Cloud Name:', 'dzu6yhrx4');
console.log('API Key:', '896987324758448');
console.log('API Secret:', 'yd_mt7d3-ZCn7sb_ELcD5o8PnPk');

// Set up the Multer storage using Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => ({
    folder: 'auctions', // Folder name in Cloudinary
    format: file.mimetype.split('/')[1], // Dynamically set file format based on MIME type
    public_id: `${Date.now()}-${file.originalname.replace(/\s/g, '-')}`, // Generate unique public ID
  }),
});

// Export the upload middleware for use in routes
export const upload = multer({ storage });
