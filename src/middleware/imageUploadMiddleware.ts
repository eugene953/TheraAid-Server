import multer from 'multer';
import path from 'path';

// Set up storage configuration for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads')); // Specify directory to save images
  },
  filename: (req, file, cb) => {
    // Use current timestamp to avoid filename conflicts
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Export the multer upload instance
export const upload = multer({ storage });
