import express from 'express';
import pool from '../config/database.js';
import { upload } from '../middleware/upload.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// IP Music endpoints
router.get('/', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { page = 1, pageSize = 10, search = '', sortBy = 'updateTime', sortOrder = 'desc' } = req.query;
    
    // Build WHERE clause for search
    let whereClause = '';
    const params = [];
    
    if (search) {
      whereClause = 'WHERE musicName LIKE ? OR musicType LIKE ? OR singer LIKE ? OR tags LIKE ?';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    // Convert sort order
    const sqlSortOrder = sortOrder === 'ascend' ? 'ASC' : 'DESC';
    
    // Check if we want all data (for large pageSize)
    const isLargePageSize = parseInt(pageSize) >= 1000;
    let dataQuery;
    
    if (isLargePageSize) {
      dataQuery = `
        SELECT id, musicId, musicName, musicType, singer, tags, musicFileAddress, updater, 
               DATE_FORMAT(createTime, '%Y-%m-%d %H:%i:%s') as createTime, 
               DATE_FORMAT(updateTime, '%Y-%m-%d %H:%i:%s') as updateTime
        FROM ipmusic ${whereClause} ORDER BY ${sortBy} ${sqlSortOrder}
      `;
    } else {
      const offset = (parseInt(page) - 1) * parseInt(pageSize);
      const limit = parseInt(pageSize);
      dataQuery = `
        SELECT id, musicId, musicName, musicType, singer, tags, musicFileAddress, updater, 
               DATE_FORMAT(createTime, '%Y-%m-%d %H:%i:%s') as createTime, 
               DATE_FORMAT(updateTime, '%Y-%m-%d %H:%i:%s') as updateTime
        FROM ipmusic ${whereClause} ORDER BY ${sortBy} ${sqlSortOrder} LIMIT ${limit} OFFSET ${offset}
      `;
    }
    
    // Count query
    const countQuery = `SELECT COUNT(*) as total FROM ipmusic ${whereClause}`;
    
    const [dataRows] = await connection.execute(dataQuery, params);
    const [countRows] = await connection.execute(countQuery, params);
    
    res.json({
      data: dataRows,
      total: countRows[0].total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });
    
  } catch (error) {
    console.error('Error fetching IP music data:', error);
    res.status(500).json({ error: 'Failed to fetch IP music data' });
  } finally {
    connection.release();
  }
});

// IP Music endpoint - POST (Create new music)
router.post('/', upload.single('musicFile'), async (req, res) => {
  try {
    console.log('Creating new music entry');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    
    const connection = await pool.getConnection();
    
    const {
      musicName,
      singer,
      musicType,
      tags,
      updater
    } = req.body;

    // Validate required fields
    if (!musicName || !musicType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate music name length
    if (musicName.length > 15) {
      return res.status(400).json({ error: 'Music name cannot exceed 15 characters' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No music file uploaded' });
    }

    // Handle file upload
    const musicFile = req.file;
    console.log('Music file received:', musicFile);
    
    // The file is already saved by multer, just get the path
    const fileName = musicFile.filename;
    const filePath = `/audio/${fileName}`;
    
    console.log('File path:', filePath);
    console.log('Full file path:', musicFile.path);

    // Generate music_id
    const musicId = `MUS${Date.now()}`;

    // Insert into database
    const insertQuery = `
      INSERT INTO ipmusic (musicId, musicName, musicType, singer, tags, musicFileAddress, updater, createTime, updateTime)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    const insertParams = [
      musicId,
      musicName,
      musicType,
      singer || '',
      tags || '',
      filePath,
      updater || '管理员'
    ];
    
    console.log('Insert query:', insertQuery);
    console.log('Insert params:', insertParams);
    
    const [result] = await connection.execute(insertQuery, insertParams);

    connection.release();
    
    console.log('Music created successfully with ID:', result.insertId);
    res.json({ 
      success: true, 
      message: 'Music created successfully',
      id: result.insertId,
      musicId: musicId,
      filePath: filePath
    });
    
  } catch (error) {
    console.error('Error creating music:', error);
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

// IP Music endpoint - PUT (Update existing music)
router.put('/:id', upload.single('musicFile'), async (req, res) => {
  try {
    console.log('Updating music entry');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('Music ID:', req.params.id);
    
    const connection = await pool.getConnection();
    
    const {
      musicName,
      singer,
      musicType,
      tags,
      updater
    } = req.body;

    const musicId = req.params.id;

    // Validate required fields
    if (!musicName || !musicType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate music name length
    if (musicName.length > 15) {
      return res.status(400).json({ error: 'Music name cannot exceed 15 characters' });
    }

    // Check if music exists
    const [existingResult] = await connection.execute(
      'SELECT * FROM ipmusic WHERE id = ?',
      [musicId]
    );

    if (existingResult.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Music not found' });
    }

    const existingMusic = existingResult[0];
    let filePath = existingMusic.musicFileAddress; // Keep existing file path by default

    // Handle file upload if new file is provided
    if (req.file) {
      const musicFile = req.file;
      console.log('New music file received:', musicFile);
      
      // Generate new file path
      const fileName = musicFile.filename;
      filePath = `/audio/${fileName}`;
      
      console.log('New file path:', filePath);
      console.log('Full file path:', musicFile.path);
    }

    // Update database
    const updateQuery = `
      UPDATE ipmusic SET 
        musicName = ?, 
        musicType = ?, 
        singer = ?, 
        tags = ?, 
        musicFileAddress = ?,
        updater = ?,
        updateTime = NOW()
      WHERE id = ?
    `;
    
    const updateParams = [
      musicName,
      musicType,
      singer || '',
      tags || '',
      filePath,
      updater || '管理员',
      musicId
    ];
    
    console.log('Update query:', updateQuery);
    console.log('Update params:', updateParams);
    
    await connection.execute(updateQuery, updateParams);

    connection.release();
    
    console.log('Music updated successfully with ID:', musicId);
    res.json({ 
      success: true, 
      message: 'Music updated successfully',
      id: musicId,
      filePath: filePath
    });
    
  } catch (error) {
    console.error('Error updating music:', error);
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

// IP Music endpoint - DELETE
router.delete('/:id', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const musicId = req.params.id;
    
    // Get music info before deletion
    const [musicResult] = await connection.execute(
      'SELECT musicFileAddress FROM ipmusic WHERE id = ?',
      [musicId]
    );
    
    if (musicResult.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Music not found' });
    }
    
    // Delete from database
    await connection.execute('DELETE FROM ipmusic WHERE id = ?', [musicId]);
    
    // Delete file if it exists
    const musicFile = musicResult[0].musicFileAddress;
    if (musicFile && musicFile !== 'https://example.com/firmware.bin') {
      const filePath = path.join(__dirname, '..', '..', 'public', musicFile);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('Deleted music file:', filePath);
      }
    }
    
    connection.release();
    
    console.log('Music deleted successfully with ID:', musicId);
    res.json({ 
      success: true, 
      message: 'Music deleted successfully',
      id: musicId
    });
    
  } catch (error) {
    console.error('Error deleting music:', error);
    connection.release();
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
});

export default router; 