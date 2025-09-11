import express from 'express';
import pool from '../config/database.js';
import { imageUpload } from '../middleware/upload.js';
import fs from 'fs';

const router = express.Router();

// IP Image endpoints
router.get('/', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { page = 1, pageSize = 10, search = '', sortBy = 'updateTime', sortOrder = 'descend' } = req.query;
    
    console.log('IPImage GET request - params:', { page, pageSize, search, sortBy, sortOrder });
    
    // First check if the table exists
    const tableCheckQuery = `SHOW TABLES LIKE 'ipimage'`;
    const [tableExists] = await connection.execute(tableCheckQuery);
    
    if (tableExists.length === 0) {
      console.error('Table ipimage does not exist');
      return res.status(500).json({ error: '数据库表不存在，请检查数据库结构' });
    }
    
    console.log('Table ipimage exists, proceeding with query');
    
    // Build WHERE clause for search
    let whereClause = '';
    const params = [];
    
    if (search) {
      whereClause = 'WHERE ipName LIKE ? OR imageName LIKE ? OR tags LIKE ?';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    // Convert sort order - now column names match frontend expectations
    const sqlSortOrder = sortOrder === 'ascend' ? 'ASC' : 'DESC';
    
    // Map frontend sortBy to database column names (now they match!)
    const sortByMap = {
      'updateTime': 'updateTime',
      'createTime': 'createTime',
      'imageName': 'imageName',
      'ipName': 'ipName',
      'imageId': 'imageId',
      'scene': 'scene',
      'weather': 'weather',
      'emotion': 'emotion',
      'timePeriod': 'timePeriod'
    };
    
    const dbSortBy = sortByMap[sortBy] || 'updateTime';
    
    console.log('Mapped sortBy:', sortBy, '->', dbSortBy);
    console.log('SQL Sort Order:', sqlSortOrder);
    
    // Check if we want all data (for large pageSize)
    const isLargePageSize = parseInt(pageSize) >= 1000;
    let dataQuery;
    
    if (isLargePageSize) {
      dataQuery = `
        SELECT 
          id,
          imageId,
          ipName,
          imageName,
          scene,
          weather,
          emotion,
          timePeriod,
          tags,
          imageFileAddress,
          updater,
          DATE_FORMAT(createTime, '%Y-%m-%d %H:%i:%s') as createTime,
          DATE_FORMAT(updateTime, '%Y-%m-%d %H:%i:%s') as updateTime
        FROM ipimage ${whereClause} ORDER BY ${dbSortBy} ${sqlSortOrder}
      `;
    } else {
      const offset = (parseInt(page) - 1) * parseInt(pageSize);
      const limit = parseInt(pageSize);
      dataQuery = `
        SELECT 
          id,
          imageId,
          ipName,
          imageName,
          scene,
          weather,
          emotion,
          timePeriod,
          tags,
          imageFileAddress,
          updater,
          DATE_FORMAT(createTime, '%Y-%m-%d %H:%i:%s') as createTime,
          DATE_FORMAT(updateTime, '%Y-%m-%d %H:%i:%s') as updateTime
        FROM ipimage ${whereClause} ORDER BY ${dbSortBy} ${sqlSortOrder} LIMIT ${limit} OFFSET ${offset}
      `;
    }
    
    // Count query
    const countQuery = `SELECT COUNT(*) as total FROM ipimage ${whereClause}`;
    
    console.log('Data query:', dataQuery);
    console.log('Count query:', countQuery);
    console.log('Query params:', params);
    
    const [dataRows] = await connection.execute(dataQuery, params);
    const [countRows] = await connection.execute(countQuery, params);
    
    console.log('Data rows count:', dataRows.length);
    console.log('Total count:', countRows[0].total);
    
    // No transformation needed - column names now match frontend expectations!
    res.json({
      data: dataRows,
      total: countRows[0].total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });
    
  } catch (error) {
    console.error('Error fetching IP image data:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    
    // Check if it's a database connection error
    if (error.code === 'ECONNREFUSED' || error.code === 'ER_ACCESS_DENIED_ERROR') {
      return res.status(500).json({ error: '数据库连接失败，请检查数据库配置' });
    }
    
    // Check if it's a table not found error
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return res.status(500).json({ error: '数据库表不存在，请检查数据库结构' });
    }
    
    res.status(500).json({ error: '服务器内部错误，请稍后重试', details: error.message });
  } finally {
    connection.release();
  }
});

// IPimage endpoint - POST (Create new image)
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

    // Handle file upload
    const imageFile = req.file;
    console.log('Image file received:', imageFile);
    
    // The file is already saved by multer, just get the path
    const fileName = imageFile.filename;
    const filePath = `/images/${fileName}`;
    
    console.log('File path:', filePath);
    console.log('Full file path:', imageFile.path);

    // Generate imageId
    const imageId = `IMG${Date.now()}`;

    // Insert into database - now using camelCase column names
    const insertQuery = `
      INSERT INTO ipimage (imageId, ipName, imageName, scene, weather, emotion, timePeriod, tags, imageFileAddress, updater, createTime, updateTime)
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

// IPimage endpoint - PUT (Update existing image)
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
    let filePath = existingImage.imageFileAddress; // Keep existing file path by default

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

    // Update database - now using camelCase column names
    const updateQuery = `
      UPDATE ipimage SET 
        ipName = ?, 
        imageName = ?, 
        scene = ?, 
        weather = ?, 
        emotion = ?, 
        timePeriod = ?, 
        tags = ?, 
        imageFileAddress = ?,
        updater = ?,
        updateTime = NOW()
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