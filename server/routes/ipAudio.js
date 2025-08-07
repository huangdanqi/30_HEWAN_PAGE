import express from 'express';
import pool from '../config/database.js';
import { upload } from '../middleware/upload.js';
import fs from 'fs';

const router = express.Router();

// IP Audio endpoints
router.get('/', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { page = 1, pageSize = 10, search = '', sortBy = 'update_time', sortOrder = 'desc' } = req.query;
    
    // Build WHERE clause for search
    let whereClause = '';
    const params = [];
    
    if (search) {
      whereClause = 'WHERE ip_name LIKE ? OR audio_name LIKE ? OR tags LIKE ?';
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
        SELECT id, audio_id as audioId, ip_name as ipName, audio_name as audioName, audio_type as audioType, tags, emotion, language, audio_file_address as audioFileAddress, updater, create_time as createTime, update_time as updateTime
        FROM ipaudio ${whereClause} ORDER BY ${sortBy} ${sqlSortOrder}
      `;
    } else {
      const offset = (parseInt(page) - 1) * parseInt(pageSize);
      const limit = parseInt(pageSize);
      dataQuery = `
        SELECT id, audio_id as audioId, ip_name as ipName, audio_name as audioName, audio_type as audioType, tags, emotion, language, audio_file_address as audioFileAddress, updater, create_time as createTime, update_time as updateTime
        FROM ipaudio ${whereClause} ORDER BY ${sortBy} ${sqlSortOrder} LIMIT ${limit} OFFSET ${offset}
      `;
    }
    
    // Count query
    const countQuery = `SELECT COUNT(*) as total FROM ipaudio ${whereClause}`;
    
    const [dataRows] = await connection.execute(dataQuery, params);
    const [countRows] = await connection.execute(countQuery, params);
    
    res.json({
      data: dataRows,
      total: countRows[0].total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });
    
  } catch (error) {
    console.error('Error fetching IP audio data:', error);
    res.status(500).json({ error: 'Failed to fetch IP audio data' });
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

    // Generate audio_id
    const audioId = `AUD${Date.now()}`;

    // Insert into database
    const insertQuery = `
      INSERT INTO ipaudio (audio_id, ip_name, audio_name, audio_type, tags, emotion, language, audio_file_address, updater, create_time, update_time)
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
    let filePath = existingAudio.audio_file_address; // Keep existing file path by default

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

    // Update database
    const updateQuery = `
      UPDATE ipaudio SET 
        ip_name = ?, 
        audio_name = ?, 
        audio_type = ?, 
        tags = ?, 
        emotion = ?, 
        language = ?, 
        audio_file_address = ?,
        updater = ?,
        update_time = NOW()
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