import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Test endpoint to verify BOM route is working
router.get('/bom-test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'BOM route is working',
    timestamp: new Date().toISOString()
  });
});

// Cleanup endpoint to remove old files with incorrect names
router.delete('/bom-cleanup', async (req, res) => {
  try {
    const bomDir = path.join(__dirname, '../../public/bom-files');
    
    if (!fs.existsSync(bomDir)) {
      return res.json({ success: true, message: 'No BOM directory found', deletedCount: 0 });
    }
    
    const files = fs.readdirSync(bomDir);
    let deletedCount = 0;
    
    for (const file of files) {
      // Remove files that contain "unknown" in the filename (old uploads with incorrect data)
      if (file.includes('unknown') && file.endsWith('.xlsx')) {
        const filePath = path.join(bomDir, file);
        fs.unlinkSync(filePath);
        deletedCount++;
        console.log(`Deleted old BOM file: ${file}`);
      }
    }
    
    res.json({
      success: true,
      message: `Cleanup completed. Deleted ${deletedCount} old files.`,
      deletedCount,
      remainingFiles: fs.readdirSync(bomDir)
    });
    
  } catch (error) {
    console.error('Error during BOM cleanup:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error during cleanup',
      error: error.message 
    });
  }
});

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
    // Use a temporary filename first, we'll rename it after processing
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const extension = path.extname(file.originalname);
    const tempFilename = `temp_BOM_${timestamp}${extension}`;
    cb(null, tempFilename);
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
    
    // Now rename the file with the correct device information
    const bomDir = path.join(__dirname, '../../public/bom-files');
    const oldPath = path.join(bomDir, req.file.filename);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const extension = path.extname(req.file.originalname);
    
    // Create the proper filename
    const newFilename = `BOM_${deviceModel}_${productionBatch}_${manufacturer}_${timestamp}${extension}`;
    const newPath = path.join(bomDir, newFilename);
    
    // Rename the file
    fs.renameSync(oldPath, newPath);
    
    console.log(`File renamed from ${req.file.filename} to ${newFilename}`);
    
    res.json({
      success: true,
      message: 'BOM file uploaded successfully',
      file: {
        filename: newFilename,
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
    
    console.log('=== BOM Download Debug ===');
    console.log('Searching for:', { deviceModel, productionBatch, manufacturer });
    console.log('Decoded manufacturer:', decodeURIComponent(manufacturer));
    console.log('Available files:', files);
    
    // Filter files that match the device info
    // Decode URL-encoded manufacturer name for proper matching
    const decodedManufacturer = decodeURIComponent(manufacturer);
    
    const matchingFiles = files.filter(file => {
      const filename = file.toLowerCase();
      const decodedFilename = decodeURIComponent(filename);
      
      // Check if filename contains all required components
      const hasDeviceModel = filename.includes(deviceModel.toLowerCase());
      const hasProductionBatch = filename.includes(productionBatch.toLowerCase());
      const hasManufacturer = filename.includes(decodedManufacturer.toLowerCase()) || 
                             decodedFilename.includes(decodedManufacturer.toLowerCase());
      
      console.log(`File: ${file}`);
      console.log(`  - Has device model (${deviceModel}): ${hasDeviceModel}`);
      console.log(`  - Has production batch (${productionBatch}): ${hasProductionBatch}`);
      console.log(`  - Has manufacturer (${decodedManufacturer}): ${hasManufacturer}`);
      
      return hasDeviceModel && hasProductionBatch && hasManufacturer;
    });
    
    console.log('Matching files found:', matchingFiles);
    
    if (matchingFiles.length === 0) {
      // Check if there are any files at all
      const excelFiles = files.filter(file => file.endsWith('.xlsx') && !file.includes('unknown'));
      
      if (excelFiles.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'No BOM files found. Please upload a BOM file first.',
          searchCriteria: {
            deviceModel,
            productionBatch,
            manufacturer: decodedManufacturer
          },
          availableFiles: files,
          suggestion: 'Upload a new BOM file for this device'
        });
      } else {
        return res.status(404).json({ 
          success: false, 
          message: `No BOM file found for device ${deviceModel} (${productionBatch})`,
          searchCriteria: {
            deviceModel,
            productionBatch,
            manufacturer: decodedManufacturer
          },
          availableFiles: excelFiles,
          suggestion: `Available files are for other devices. Upload a BOM file for ${deviceModel} (${productionBatch})`
        });
      }
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
     
     // Encode filename for Content-Disposition header to handle Chinese characters
     const encodedFilename = encodeURIComponent(mostRecentFile);
     res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedFilename}`);
    
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

// Get list of all BOM files (for debugging)
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
