import express from 'express';
import pool from '../config/database.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const router = express.Router();

// Configure multer for file uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the firmware upload directory exists
const uploadDir = path.join(__dirname, '../../public/firmware');
console.log('Upload directory path:', uploadDir);

if (!fs.existsSync(uploadDir)) {
  console.log('Creating upload directory:', uploadDir);
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Upload directory created successfully');
} else {
  console.log('Upload directory already exists:', uploadDir);
}

// Test endpoint - must be placed before other routes
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Firmware route is working',
    timestamp: new Date().toISOString(),
    uploadDir: uploadDir
  });
});

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log('=== STORAGE DESTINATION START ===');
    console.log('Storage destination called for file:', file.originalname);
    console.log('Upload directory:', uploadDir);
    console.log('=== STORAGE DESTINATION END ===');
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    console.log('=== STORAGE FILENAME START ===');
    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const originalName = file.originalname;
    const ext = path.extname(originalName);
    const nameWithoutExt = path.basename(originalName, ext);
    const uniqueName = `${nameWithoutExt}_${timestamp}${ext}`;
    console.log('Generated filename:', uniqueName);
    console.log('=== STORAGE FILENAME END ===');
    cb(null, uniqueName);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  console.log('=== FILE FILTER START ===');
  console.log('File filter checking:', file.originalname);
  console.log('File mimetype:', file.mimetype);
  console.log('File size:', file.size);
  
  // Allow only .xls, .xlsx files
  const allowedTypes = /\.(xls|xlsx)$/i;
  if (allowedTypes.test(file.originalname)) {
    console.log('File type accepted:', file.originalname);
    console.log('=== FILE FILTER END (ACCEPTED) ===');
    cb(null, true);
  } else {
    console.log('File type rejected:', file.originalname);
    console.log('=== FILE FILTER END (REJECTED) ===');
    cb(new Error('只支持 .xls, .xlsx 格式的文件!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

// Error handling middleware for multer
const uploadMiddleware = (req, res, next) => {
  console.log('=== UPLOAD MIDDLEWARE START ===');
  console.log('Upload middleware called');
  console.log('Request method:', req.method);
  console.log('Request url:', req.url);
  
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          success: false,
          error: '文件大小不能超过 100MB' 
        });
      }
      return res.status(400).json({ 
        success: false,
        error: '文件上传错误: ' + err.message 
      });
    } else if (err) {
      console.error('File filter error:', err);
      return res.status(400).json({ 
        success: false,
        error: err.message 
      });
    }
    console.log('Upload middleware completed successfully');
    console.log('=== UPLOAD MIDDLEWARE END ===');
    next();
  });
};

// File upload endpoint - must be placed before other routes
router.post('/upload', uploadMiddleware, async (req, res) => {
  try {
    console.log('=== UPLOAD REQUEST START ===');
    console.log('Upload request received:', req.file);
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
    console.log('Request method:', req.method);
    console.log('Request url:', req.url);
    console.log('Request content-type:', req.headers['content-type']);
    
    if (!req.file) {
      console.log('No file in request');
      return res.status(400).json({ 
        success: false,
        error: '请选择要上传的文件' 
      });
    }

    // Generate file URL
    const fileUrl = `/firmware/${req.file.filename}`;
    
    console.log('File uploaded successfully:', {
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      url: fileUrl,
      path: req.file.path
    });
    
    const response = {
      success: true,
      url: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      message: '文件上传成功'
    };
    
    console.log('Sending response:', response);
    console.log('=== UPLOAD REQUEST END ===');
    
    res.json(response);
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ 
      success: false,
      error: '文件上传失败', 
      details: error.message 
    });
  }
});

// Serve firmware files
router.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadDir, filename);
  
  console.log('=== DOWNLOAD REQUEST START ===');
  console.log('Requested filename:', filename);
  console.log('Full file path:', filePath);
  console.log('Upload directory:', uploadDir);
  console.log('File exists:', fs.existsSync(filePath));
  
  if (fs.existsSync(filePath)) {
    console.log('File found, initiating download...');
    res.download(filePath, filename, (err) => {
      if (err) {
        console.error('Download error:', err);
        res.status(500).json({ error: '下载失败', details: err.message });
  } else {
        console.log('Download completed successfully');
      }
    });
  } else {
    console.log('File not found, returning 404');
    res.status(404).json({ error: '文件不存在', requestedFile: filename, uploadDir: uploadDir });
  }
  console.log('=== DOWNLOAD REQUEST END ===');
});

// Get all firmware records
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;
    
    console.log('=== FIRMWARE GET REQUEST START ===');
    console.log('Request query:', req.query);
    console.log('Page:', page, 'PageSize:', pageSize, 'Offset:', offset);
    
    // Get total count
    const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM firmware');
    const total = countResult[0].total;
    console.log('Total records in database:', total);
    
    // Get paginated data - use template literals to avoid parameter issues
    const [rows] = await pool.execute(
      `SELECT * FROM firmware ORDER BY release_time DESC LIMIT ${pageSize} OFFSET ${offset}`
    );
    
    console.log('Fetched rows count:', rows.length);
    console.log('First row sample:', rows[0]);
    
    // Transform snake_case to camelCase for frontend
    const transformedRows = rows.map(row => ({
      id: row.id,
      deviceModel: row.device_model,
      releaseVersion: row.release_version,
      versionNumber: row.version_number,
      description: row.description,
      fileAddress: row.file_address,
      creator: row.creator,
      releaseTime: row.release_time,
      updateTime: row.update_time
    }));
    
    console.log('Transformed rows count:', transformedRows.length);
    console.log('Response pagination:', {
      current: page,
      pageSize: pageSize,
      total: total
    });
    console.log('=== FIRMWARE GET REQUEST END ===');
    
    res.json({
      data: transformedRows,
      pagination: {
        current: page,
        pageSize: pageSize,
        total: total
      }
    });
  } catch (error) {
    console.error('Error fetching firmware records:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Get firmware by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM firmware WHERE id = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Firmware record not found' });
    }
    
    const row = rows[0];
    // Transform snake_case to camelCase for frontend
    const transformedRow = {
      id: row.id,
      deviceModel: row.device_model,
      releaseVersion: row.release_version,
      versionNumber: row.version_number,
      description: row.description,
      fileAddress: row.file_address,
      creator: row.creator,
      releaseTime: row.release_time,
      updateTime: row.update_time
    };
    
    res.json(transformedRow);
  } catch (error) {
    console.error('Error fetching firmware record:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new firmware record
router.post('/', async (req, res) => {
  console.log('=== FIRMWARE CREATE REQUEST START ===');
  console.log('Raw request body:', req.body);
  console.log('Content-Type:', req.get('Content-Type'));
  
  try {
    const {
      deviceModel, // camelCase from frontend
      releaseType, // frontend sends releaseType, we need to map to releaseVersion
      releaseVersion, // alternative field name
      versionNumber,
      contentDescription, // frontend sends contentDescription, we need to map to description
      description, // alternative field name
      fileAddress,
      creator
    } = req.body;

    console.log('Received data:', {
      deviceModel,
      releaseType,
      releaseVersion,
      versionNumber,
      contentDescription,
      description,
      fileAddress,
      creator
    });
    
    console.log('Creator field details:', {
      creator: creator,
      creatorType: typeof creator,
      creatorLength: creator ? creator.length : 'undefined',
      isAdmin: creator === '管理员',
      isEmpty: !creator || creator.trim() === ''
    });

    // Map frontend field names to database column names
    let mappedReleaseVersion = releaseVersion || releaseType || '主版本';
    let mappedDescription = contentDescription || description || '';
    
    // Explicitly map English releaseType to Chinese releaseVersion
    if (releaseType === 'major') {
      mappedReleaseVersion = '主版本';
    } else if (releaseType === 'minor') {
      mappedReleaseVersion = '子版本';
    } else if (releaseType === 'revision') {
      mappedReleaseVersion = '修订版';
    }

    console.log('Mapped data:', {
      deviceModel,
      mappedReleaseVersion,
      versionNumber,
      mappedDescription,
      fileAddress,
      creator
    });
    
    // Check for existing firmware with same device model and version number
    console.log('Checking for existing firmware...');
    try {
      const [existingRows] = await pool.execute(
        'SELECT id, device_model, version_number FROM firmware WHERE device_model = ? AND version_number = ?',
        [deviceModel, versionNumber]
      );
      console.log('Existing firmware check result:', existingRows);
      if (existingRows.length > 0) {
        console.log('Duplicate found:', existingRows[0]);
        return res.status(400).json({ 
          error: 'Firmware version already exists for this device model',
          existingRecord: existingRows[0]
        });
      }
    } catch (checkError) {
      console.error('Error checking for existing firmware:', checkError);
    }

    console.log('Final data to be saved:', {
      deviceModel,
      releaseVersion: mappedReleaseVersion,
      versionNumber,
      description: mappedDescription,
      fileAddress: fileAddress || 'https://example.com/firmware.bin',
      creator: creator
    });
    
    console.log('Database insert values:', [
      deviceModel, 
      mappedReleaseVersion, 
      versionNumber, 
      mappedDescription, 
      fileAddress || 'https://example.com/firmware.bin', 
      creator
    ]);

    // Validate required fields with detailed error messages
    const validationErrors = [];
    
    if (!deviceModel || deviceModel.trim() === '') {
      validationErrors.push('Device model is required and cannot be empty');
    }
    
    if (!versionNumber || versionNumber.trim() === '') {
      validationErrors.push('Version number is required and cannot be empty');
    }
    
    if (!fileAddress || fileAddress.trim() === '') {
      validationErrors.push('File address is required and cannot be empty');
    }
    
    if (!creator || creator.trim() === '') {
      validationErrors.push('Creator is required and cannot be empty');
    }
    
    if (validationErrors.length > 0) {
      console.log('Validation failed:', validationErrors);
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors,
        receivedData: {
          deviceModel,
          versionNumber,
          fileAddress,
          releaseType,
          releaseVersion,
          description: contentDescription || description,
          creator
        }
      });
    }

    // Check if file_address column exists, if not add it
    try {
      console.log('Checking if file_address column exists...');
      await pool.execute('SELECT file_address FROM firmware LIMIT 1');
      console.log('file_address column exists');
    } catch (columnError) {
      console.log('Column error:', columnError.code, columnError.message);
      if (columnError.code === 'ER_BAD_FIELD_ERROR') {
        console.log('file_address column does not exist, adding it...');
        try {
          await pool.execute(`
            ALTER TABLE firmware 
            ADD COLUMN file_address VARCHAR(500) 
            DEFAULT 'https://example.com/firmware.bin' 
            COMMENT '文件地址'
          `);
          console.log('file_address column added successfully');
        } catch (alterError) {
          console.error('Error adding file_address column:', alterError);
          return res.status(500).json({ error: 'Database schema update failed', details: alterError.message });
        }
      } else {
        throw columnError;
      }
    }

    console.log('Executing INSERT query...');
    console.log('Final INSERT values being sent to database:', [
      deviceModel, 
      mappedReleaseVersion, 
      versionNumber, 
      mappedDescription, 
      fileAddress || 'https://example.com/firmware.bin', 
      creator
    ]);
    console.log('Creator value being inserted:', creator);
    console.log('Creator type:', typeof creator);
    console.log('Creator length:', creator ? creator.length : 'undefined');
    
    const [result] = await pool.execute(
      'INSERT INTO firmware (device_model, release_version, version_number, description, file_address, creator) VALUES (?, ?, ?, ?, ?, ?)',
      [deviceModel, mappedReleaseVersion, versionNumber, mappedDescription, fileAddress || 'https://example.com/firmware.bin', creator]
    );

    console.log('Firmware record created successfully with ID:', result.insertId);
    console.log('=== FIRMWARE CREATE REQUEST END ===');

    res.status(201).json({
      id: result.insertId,
      message: 'Firmware record created successfully'
    });
  } catch (error) {
    console.error('=== FIRMWARE CREATE ERROR ===');
    console.error('Error creating firmware record:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error sqlMessage:', error.sqlMessage);
    console.error('=== FIRMWARE CREATE ERROR END ===');
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Firmware version already exists for this device model' });
    }
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Update firmware record
router.put('/:id', async (req, res) => {
  console.log('=== FIRMWARE UPDATE REQUEST START ===');
  console.log('Raw request body:', req.body);
  console.log('Record ID to update:', req.params.id);
  
  try {
    const {
      deviceModel, // camelCase from frontend
      releaseType, // frontend sends releaseType, we need to map to releaseVersion
      releaseVersion, // alternative field name
      versionNumber,
      contentDescription, // frontend sends contentDescription, we need to map to description
      description, // alternative field name
      fileAddress,
      creator
    } = req.body;

    console.log('Received update data:', {
      deviceModel,
      releaseType,
      releaseVersion,
      versionNumber,
      contentDescription,
      description,
      fileAddress,
      creator
    });
    
    console.log('Creator field details for update:', {
      creator: creator,
      creatorType: typeof creator,
      creatorLength: creator ? creator.length : 'undefined',
      isAdmin: creator === '管理员',
      isEmpty: !creator || creator.trim() === ''
    });

    // Map frontend field names to database column names
    const mappedReleaseVersion = releaseType || releaseVersion;
    const mappedDescription = contentDescription || description;

    console.log('Mapped update data:', {
      deviceModel,
      mappedReleaseVersion,
      versionNumber,
      mappedDescription,
      fileAddress,
      creator
    });

    // Validate required fields
    if (!deviceModel || !mappedReleaseVersion || !versionNumber) {
      return res.status(400).json({ error: 'Device model, release version, and version number are required' });
    }
    
    if (!creator || creator.trim() === '') {
      return res.status(400).json({ error: 'Creator is required and cannot be empty' });
    }

    const updateValues = [deviceModel, mappedReleaseVersion, versionNumber, mappedDescription, fileAddress || 'https://example.com/firmware.bin', creator, req.params.id];
    
    console.log('Database update values:', updateValues);
    console.log('SQL query: UPDATE firmware SET device_model = ?, release_version = ?, version_number = ?, description = ?, file_address = ?, creator = ?, update_time = NOW() WHERE id = ?');
    console.log('Creator value being updated:', creator);
    console.log('Creator type:', typeof creator);
    console.log('Creator length:', creator ? creator.length : 'undefined');
    console.log('Update time being set: NOW() (MySQL server timezone)');

    const [result] = await pool.execute(
      'UPDATE firmware SET device_model = ?, release_version = ?, version_number = ?, description = ?, file_address = ?, creator = ?, update_time = NOW() WHERE id = ?',
      updateValues
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Firmware record not found' });
    }

    res.json({ message: 'Firmware record updated successfully' });
  } catch (error) {
    console.error('Error updating firmware record:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Firmware version already exists for this device model' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete firmware record
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM firmware WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Firmware record not found' });
    }

    res.json({ message: 'Firmware record deleted successfully' });
  } catch (error) {
    console.error('Error deleting firmware record:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get firmware by device model
router.get('/device/:deviceModel', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM firmware WHERE device_model = ? ORDER BY release_time DESC',
      [req.params.deviceModel]
    );
    
    // Transform snake_case to camelCase for frontend
    const transformedRows = rows.map(row => ({
      id: row.id,
      deviceModel: row.device_model,
      releaseVersion: row.release_version,
      versionNumber: row.version_number,
      description: row.description,
      fileAddress: row.file_address,
      creator: row.creator,
      releaseTime: row.release_time,
      updateTime: row.update_time
    }));
    
    res.json(transformedRows);
  } catch (error) {
    console.error('Error fetching firmware by device model:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 