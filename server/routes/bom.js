import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Store files in the public/bom-files directory
    const uploadDir = path.join(__dirname, '../../public/bom-files');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate filename with device info and timestamp
    const deviceModel = req.body.deviceModel || 'unknown';
    const productionBatch = req.body.productionBatch || 'unknown';
    const manufacturer = req.body.manufacturer || 'unknown';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const extension = path.extname(file.originalname);
    
    const filename = `BOM_${deviceModel}_${productionBatch}_${manufacturer}_${timestamp}${extension}`;
    cb(null, filename);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Only allow Excel files
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
        file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Upload BOM file
router.post('/upload-bom', upload.single('bomFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { deviceModel, productionBatch, manufacturer, uploader } = req.body;
    
    // Store file information in database (you can create a bom_files table)
    // For now, we'll just return success
    
    res.json({
      success: true,
      message: 'BOM file uploaded successfully',
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        deviceModel,
        productionBatch,
        manufacturer,
        uploader,
        uploadDate: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error uploading BOM file:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error uploading file',
      error: error.message 
    });
  }
});

// Download BOM file
router.get('/download-bom', async (req, res) => {
  try {
    const { deviceModel, productionBatch, manufacturer } = req.query;
    
    if (!deviceModel || !productionBatch || !manufacturer) {
      return res.status(400).json({ success: false, message: 'Missing required parameters' });
    }
    
    // Find the most recent BOM file for this device combination
    const bomDir = path.join(__dirname, '../../public/bom-files');
    const files = fs.readdirSync(bomDir);
    
    // Filter files that match the device info
    const matchingFiles = files.filter(file => {
      const filename = file.toLowerCase();
      return filename.includes(deviceModel.toLowerCase()) &&
             filename.includes(productionBatch.toLowerCase()) &&
             filename.includes(manufacturer.toLowerCase());
    });
    
    if (matchingFiles.length === 0) {
      return res.status(404).json({ success: false, message: 'No BOM file found for this device' });
    }
    
    // Get the most recent file (assuming timestamp in filename)
    const mostRecentFile = matchingFiles.sort().pop();
    const filePath = path.join(bomDir, mostRecentFile);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'BOM file not found' });
    }
    
    // Set headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${mostRecentFile}"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
  } catch (error) {
    console.error('Error downloading BOM file:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error downloading file',
      error: error.message 
    });
  }
});

// Get list of BOM files for a device
router.get('/bom-files', async (req, res) => {
  try {
    const { deviceModel, productionBatch, manufacturer } = req.query;
    
    const bomDir = path.join(__dirname, '../../public/bom-files');
    
    if (!fs.existsSync(bomDir)) {
      return res.json({ success: true, files: [] });
    }
    
    const files = fs.readdirSync(bomDir);
    
    let fileList = files.map(file => {
      const stats = fs.statSync(path.join(bomDir, file));
      return {
        filename: file,
        size: stats.size,
        uploadDate: stats.mtime,
        path: `/bom-files/${file}`
      };
    });
    
    // Filter by device info if provided
    if (deviceModel || productionBatch || manufacturer) {
      fileList = fileList.filter(file => {
        const filename = file.filename.toLowerCase();
        return (!deviceModel || filename.includes(deviceModel.toLowerCase())) &&
               (!productionBatch || filename.includes(productionBatch.toLowerCase())) &&
               (!manufacturer || filename.includes(manufacturer.toLowerCase()));
      });
    }
    
    // Sort by upload date (newest first)
    fileList.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
    
    res.json({
      success: true,
      files: fileList
    });
    
  } catch (error) {
    console.error('Error getting BOM files:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error getting file list',
      error: error.message 
    });
  }
});

export default router;
