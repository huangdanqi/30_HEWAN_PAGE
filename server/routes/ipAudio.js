import express from 'express';
import pool from '../config/database.js';
import { upload } from '../middleware/upload.js';
import fs from 'fs';

const router = express.Router();

// IP Audio endpoints
router.get('/', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { page = 1, pageSize = 10, search = '', sortBy = 'updateTime', sortOrder = 'descend' } = req.query;
    
    console.log('IPAudio GET request - params:', { page, pageSize, search, sortBy, sortOrder });
    
    // First check if the table exists
    const tableCheckQuery = `SHOW TABLES LIKE 'ipaudio'`;
    const [tableExists] = await connection.execute(tableCheckQuery);
    
    if (tableExists.length === 0) {
      console.error('Table ipaudio does not exist');
      return res.status(500).json({ error: '数据库表不存在，请检查数据库结构' });
    }
    
    console.log('Table ipaudio exists, proceeding with query');
    
    // Build WHERE clause for search
    let whereClause = '';
    const params = [];
    
    if (search) {
      whereClause = 'WHERE ipName LIKE ? OR audioName LIKE ? OR tags LIKE ?';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    // Convert sort order - now column names match frontend expectations
    const sqlSortOrder = sortOrder === 'ascend' ? 'ASC' : 'DESC';
    
    // Map frontend sortBy to database column names (now they match!)
    const sortByMap = {
      'updateTime': 'updateTime',
      'createTime': 'createTime',
      'audioName': 'audioName',
      'ipName': 'ipName',
      'audioType': 'audioType',
      'audioId': 'audioId',
      'emotion': 'emotion',
      'language': 'language'
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
          audioId,
          ipName,
          audioName,
          audioType,
          tags,
          emotion,
          language,
          audioFileAddress,
          updater,
          DATE_FORMAT(createTime, '%Y-%m-%d %H:%i:%s') as createTime,
          DATE_FORMAT(updateTime, '%Y-%m-%d %H:%i:%s') as updateTime
        FROM ipaudio ${whereClause} ORDER BY ${dbSortBy} ${sqlSortOrder}
      `;
    } else {
      const offset = (parseInt(page) - 1) * parseInt(pageSize);
      const limit = parseInt(pageSize);
      dataQuery = `
        SELECT 
          id,
          audioId,
          ipName,
          audioName,
          audioType,
          tags,
          emotion,
          language,
          audioFileAddress,
          updater,
          DATE_FORMAT(createTime, '%Y-%m-%d %H:%i:%s') as createTime,
          DATE_FORMAT(updateTime, '%Y-%m-%d %H:%i:%s') as updateTime
        FROM ipaudio ${whereClause} ORDER BY ${dbSortBy} ${sqlSortOrder} LIMIT ${limit} OFFSET ${offset}
      `;
    }
    
    // Count query
    const countQuery = `SELECT COUNT(*) as total FROM ipaudio ${whereClause}`;
    
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
    console.error('Error fetching IP audio data:', error);
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

// IPaudio endpoint - POST (Create new audio)
router.post('/', upload.single('audioFile'), async (req, res) => {
  try {
    console.log('Creating new audio entry');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    
    const connection = await pool.getConnection();
    
    const {
      ipName,
      audioName,
      audioType,
      tags,
      emotion,
      language,
      updater
    } = req.body;

    // Validate required fields
    if (!ipName || !audioName || !audioType || !emotion || !language) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No audio file uploaded' });
    }

    // Validate audio name length
    if (audioName.length > 15) {
      return res.status(400).json({ error: 'Audio name cannot exceed 15 characters' });
    }

    // Handle file upload
    const audioFile = req.file;
    console.log('Audio file received:', audioFile);
    
    // The file is already saved by multer, just get the path
    const fileName = audioFile.filename;
    const filePath = `/audio/${fileName}`;
    
    console.log('File path:', filePath);
    console.log('Full file path:', audioFile.path);

    // Generate audioId
    const audioId = `AUD${Date.now()}`;

    // Insert into database - now using camelCase column names
    const insertQuery = `
      INSERT INTO ipaudio (audioId, ipName, audioName, audioType, tags, emotion, language, audioFileAddress, updater, createTime, updateTime)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    const insertParams = [
      audioId,
      ipName,
      audioName,
      audioType,
      tags || '',
      emotion,
      language,
      filePath,
      updater || '管理员'
    ];
    
    console.log('Insert query:', insertQuery);
    console.log('Insert params:', insertParams);
    
    const [result] = await connection.execute(insertQuery, insertParams);

    connection.release();
    
    console.log('Audio created successfully with ID:', result.insertId);
    res.json({ 
      success: true, 
      message: 'Audio created successfully',
      id: result.insertId,
      audioId: audioId,
      filePath: filePath
    });
    
  } catch (error) {
    console.error('Error creating audio:', error);
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

// IPaudio endpoint - PUT (Update existing audio)
router.put('/:id', upload.single('audioFile'), async (req, res) => {
  try {
    console.log('Updating audio entry');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('Audio ID:', req.params.id);
    
    const connection = await pool.getConnection();
    
    const {
      ipName,
      audioName,
      audioType,
      tags,
      emotion,
      language,
      updater
    } = req.body;

    const audioId = req.params.id;

    // Validate required fields
    if (!ipName || !audioName || !audioType || !emotion || !language) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate audio name length
    if (audioName.length > 15) {
      return res.status(400).json({ error: 'Audio name cannot exceed 15 characters' });
    }

    // Check if audio exists
    const [existingResult] = await connection.execute(
      'SELECT * FROM ipaudio WHERE id = ?',
      [audioId]
    );

    if (existingResult.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Audio not found' });
    }

    const existingAudio = existingResult[0];
    let filePath = existingAudio.audioFileAddress; // Keep existing file path by default

    // Handle file upload if new file is provided
    if (req.file) {
      const audioFile = req.file;
      console.log('New audio file received:', audioFile);
      
      // Generate new file path
      const fileName = audioFile.filename;
      filePath = `/audio/${fileName}`;
      
      console.log('New file path:', filePath);
      console.log('Full file path:', audioFile.path);
    }

    // Update database - now using camelCase column names
    const updateQuery = `
      UPDATE ipaudio SET 
        ipName = ?, 
        audioName = ?, 
        audioType = ?, 
        tags = ?, 
        emotion = ?, 
        language = ?, 
        audioFileAddress = ?,
        updater = ?,
        updateTime = NOW()
      WHERE id = ?
    `;
    
    const updateParams = [
      ipName,
      audioName,
      audioType,
      tags || '',
      emotion,
      language,
      filePath,
      updater || '管理员',
      audioId
    ];
    
    console.log('Update query:', updateQuery);
    console.log('Update params:', updateParams);
    
    await connection.execute(updateQuery, updateParams);

    connection.release();
    
    console.log('Audio updated successfully with ID:', audioId);
    res.json({ 
      success: true, 
      message: 'Audio updated successfully',
      id: audioId,
      filePath: filePath
    });
    
  } catch (error) {
    console.error('Error updating audio:', error);
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