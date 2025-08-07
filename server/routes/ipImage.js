import express from 'express';
import pool from '../config/database.js';
import { imageUpload } from '../middleware/upload.js';
import fs from 'fs';

const router = express.Router();

// IP Image endpoints
router.get('/', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { page = 1, pageSize = 10, search = '', sortBy = 'update_time', sortOrder = 'desc' } = req.query;
    
    // Build WHERE clause for search
    let whereClause = '';
    const params = [];
    
    if (search) {
      whereClause = 'WHERE ip_name LIKE ? OR image_name LIKE ? OR tags LIKE ?';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    // Convert sort order
    const sqlSortOrder = sortOrder === 'ascend' ? 'ASC' : 'DESC';
    
    // Check if we want all data (for large pageSize)
    const isLargePageSize = parseInt(pageSize) >= 1000;
    let dataQuery;
    
    if (isLargePageSize) {
      dataQuery = `
        SELECT id, image_id as imageId, ip_name as ipName, image_name as imageName, scene, weather, emotion, time_period as timePeriod, tags, image_file_address as imageFileAddress, updater, create_time as createTime, update_time as updateTime
        FROM ipimage ${whereClause} ORDER BY ${sortBy} ${sqlSortOrder}
      `;
    } else {
      const offset = (parseInt(page) - 1) * parseInt(pageSize);
      const limit = parseInt(pageSize);
      dataQuery = `
        SELECT id, image_id as imageId, ip_name as ipName, image_name as imageName, scene, weather, emotion, time_period as timePeriod, tags, image_file_address as imageFileAddress, updater, create_time as createTime, update_time as updateTime
        FROM ipimage ${whereClause} ORDER BY ${sortBy} ${sqlSortOrder} LIMIT ${limit} OFFSET ${offset}
      `;
    }
    
    // Count query
    const countQuery = `SELECT COUNT(*) as total FROM ipimage ${whereClause}`;
    
    const [dataRows] = await connection.execute(dataQuery, params);
    const [countRows] = await connection.execute(countQuery, params);
    
    res.json({
      data: dataRows,
      total: countRows[0].total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });
    
  } catch (error) {
    console.error('Error fetching IP image data:', error);
    res.status(500).json({ error: 'Failed to fetch IP image data' });
  } finally {
    connection.release();
  }
});

// IP Image endpoint - POST (Create new image)
router.post('/', imageUpload.single('imageFile'), async (req, res) => {
  try {
    console.log('Creating new image entry');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    
    const connection = await pool.getConnection();
    
    const {
      ipName,
      imageName,
      scene,
      weather,
      emotion,
      timePeriod,
      tags,
      updater
    } = req.body;

    // Validate required fields
    if (!ipName || !imageName || !scene || !weather || !emotion || !timePeriod) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    // Validate image name length
    if (imageName.length > 15) {
      return res.status(400).json({ error: 'Image name cannot exceed 15 characters' });
    }

    // Handle file upload
    const imageFile = req.file;
    console.log('Image file received:', imageFile);
    
    // The file is already saved by multer, just get the path
    const fileName = imageFile.filename;
    const filePath = `/images/${fileName}`;
    
    console.log('File path:', filePath);
    console.log('Full file path:', imageFile.path);

    // Generate image_id
    const imageId = `IMG${Date.now()}`;

    // Insert into database
    const insertQuery = `
      INSERT INTO ipimage (image_id, ip_name, image_name, scene, weather, emotion, time_period, tags, image_file_address, updater, create_time, update_time)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    const insertParams = [
      imageId,
      ipName,
      imageName,
      scene,
      weather,
      emotion,
      timePeriod,
      tags || '',
      filePath,
      updater || '管理员'
    ];
    
    console.log('Insert query:', insertQuery);
    console.log('Insert params:', insertParams);
    
    const [result] = await connection.execute(insertQuery, insertParams);

    connection.release();
    
    console.log('Image created successfully with ID:', result.insertId);
    res.json({ 
      success: true, 
      message: 'Image created successfully',
      id: result.insertId,
      imageId: imageId,
      filePath: filePath
    });
    
  } catch (error) {
    console.error('Error creating image:', error);
    console.error('Error stack:', error.stack);
    
    // Clean up uploaded file if database insertion failed
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
        console.log('Cleaned up uploaded file:', req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }
    
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// IP Image endpoint - PUT (Update existing image)
router.put('/:id', imageUpload.single('imageFile'), async (req, res) => {
  try {
    console.log('Updating image entry');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('Image ID:', req.params.id);
    
    const connection = await pool.getConnection();
    
    const {
      ipName,
      imageName,
      scene,
      weather,
      emotion,
      timePeriod,
      tags,
      updater
    } = req.body;

    const imageId = req.params.id;

    // Validate required fields
    if (!ipName || !imageName || !scene || !weather || !emotion || !timePeriod) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate image name length
    if (imageName.length > 15) {
      return res.status(400).json({ error: 'Image name cannot exceed 15 characters' });
    }

    // Check if image exists
    const [existingResult] = await connection.execute(
      'SELECT * FROM ipimage WHERE id = ?',
      [imageId]
    );

    if (existingResult.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Image not found' });
    }

    const existingImage = existingResult[0];
    let filePath = existingImage.image_file_address; // Keep existing file path by default

    // Handle file upload if new file is provided
    if (req.file) {
      const imageFile = req.file;
      console.log('New image file received:', imageFile);
      
      // Generate new file path
      const fileName = imageFile.filename;
      filePath = `/images/${fileName}`;
      
      console.log('New file path:', filePath);
      console.log('Full file path:', imageFile.path);
    }

    // Update database
    const updateQuery = `
      UPDATE ipimage SET 
        ip_name = ?, 
        image_name = ?, 
        scene = ?, 
        weather = ?, 
        emotion = ?, 
        time_period = ?, 
        tags = ?,
        image_file_address = ?,
        updater = ?,
        update_time = NOW()
      WHERE id = ?
    `;
    
    const updateParams = [
      ipName,
      imageName,
      scene,
      weather,
      emotion,
      timePeriod,
      tags || '',
      filePath,
      updater || '管理员',
      imageId
    ];
    
    console.log('Update query:', updateQuery);
    console.log('Update params:', updateParams);
    
    await connection.execute(updateQuery, updateParams);

    connection.release();
    
    console.log('Image updated successfully with ID:', imageId);
    res.json({ 
      success: true, 
      message: 'Image updated successfully',
      id: imageId,
      filePath: filePath
    });
    
  } catch (error) {
    console.error('Error updating image:', error);
    console.error('Error stack:', error.stack);
    
    // Clean up uploaded file if database update failed
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
        console.log('Cleaned up uploaded file:', req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }
    
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

export default router; 