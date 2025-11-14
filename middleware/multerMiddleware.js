import multer from "multer";
import path from "path";
import fs from "fs"; // Import the fs module

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadDir = 'uploads/';
      // Create the directory if it doesn't exist
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    }
    
  })
  
export const upload = multer({ storage: storage })