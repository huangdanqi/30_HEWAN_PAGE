import express from 'express';
import pool from '../config/database.js';
import { videoUpload } from '../middleware/upload.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Video API endpoints
router.get('/', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { page = 1, pageSize = 10, sortBy = 'updateTime', sortOrder = 'descend' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);
    
    // Build the query with sorting
    let orderClause = 'ORDER BY updateTime DESC'; // Default sorting
    if (sortBy && sortOrder) {
      const validColumns = ['videoId', 'ipName', 'videoName', 'scene', 'weather', 'emotion', 'timePeriod', 'createTime', 'updateTime'];
      if (validColumns.includes(sortBy)) {
        orderClause = `ORDER BY ${sortBy} ${sortOrder === 'ascend' ? 'ASC' : 'DESC'}`;
      }
    }
    
    const query = `
      SELECT 
        id,
        videoId,
        ipName,
        videoName,
        scene,
        weather,
        emotion,
        timePeriod,
        tags,
        videoFileAddress,
        updater,
        DATE_FORMAT(createTime, '%Y-%m-%d %H:%i:%s') as createTime,
        DATE_FORMAT(updateTime, '%Y-%m-%d %H:%i:%s') as updateTime
      FROM ipvideo 
      ${orderClause}
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    const [rows] = await connection.execute(query);
    
    // Get total count
    const [countResult] = await connection.execute('SELECT COUNT(*) as total FROM ipvideo');
    const total = countResult[0].total;
    
    connection.release();
    
    res.json({
      success: true,
      data: rows,
      total: total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });
    
  } catch (error) {
    console.error('Error fetching video data:', error);
    connection.release();
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
});

router.post('/', videoUpload.single('videoFile'), async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const {
      ipName,
      videoName,
      scene,
      weather,
      emotion,
      timePeriod,
      tags,
      updater
    } = req.body;
    
    // Validate required fields
    if (!ipName || !videoName || !scene || !weather || !emotion || !timePeriod) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'No video file uploaded' });
    }
    
    // Generate video ID
    const videoId = 'hjhwn' + Math.random().toString(36).substr(2, 9) + 'f';
    
    // Save file path
    const filePath = `/videos/${req.file.filename}`;
    
    const insertQuery = `
      INSERT INTO ipvideo (
        videoId, ipName, videoName, scene, weather, emotion, timePeriod, tags, videoFileAddress, updater
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const insertParams = [
      videoId,
      ipName,
      videoName,
      scene,
      weather,
      emotion,
      timePeriod,
      tags || '',
      filePath,
      updater || '管理员'
    ];
    
    const [result] = await connection.execute(insertQuery, insertParams);
    const videoIdInserted = result.insertId;
    
    connection.release();
    
    console.log('Video created successfully with ID:', videoIdInserted);
    res.json({ 
      success: true, 
      message: 'Video created successfully',
      id: videoIdInserted,
      videoId: videoId,
      filePath: filePath
    });
    
  } catch (error) {
    console.error('Error creating video:', error);
    console.error('Error stack:', error.stack);
    
    // Clean up uploaded file if database insert failed
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
        console.log('Cleaned up uploaded file:', req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }
    
    connection.release();
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

router.put('/:id', videoUpload.single('videoFile'), async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const videoId = req.params.id;
    const {
      ipName,
      videoName,
      scene,
      weather,
      emotion,
      timePeriod,
      tags,
      updater
    } = req.body;
    
    // Validate required fields
    if (!ipName || !videoName || !scene || !weather || !emotion || !timePeriod) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    let filePath = null;
    if (req.file) {
      filePath = `/videos/${req.file.filename}`;
    }
    
    let updateQuery = `
      UPDATE ipvideo SET 
        ipName = ?, videoName = ?, scene = ?, weather = ?, 
        emotion = ?, timePeriod = ?, tags = ?, updater = ?
    `;
    
    let updateParams = [
      ipName,
      videoName,
      scene,
      weather,
      emotion,
      timePeriod,
      tags || '',
      updater || '管理员'
    ];
    
    // Add file path to update if new file was uploaded
    if (filePath) {
      updateQuery += ', videoFileAddress = ?';
      updateParams.push(filePath);
    }
    
    updateQuery += ' WHERE id = ?';
    updateParams.push(videoId);
    
    console.log('Update query:', updateQuery);
    console.log('Update params:', updateParams);
    
    await connection.execute(updateQuery, updateParams);

    connection.release();
    
    console.log('Video updated successfully with ID:', videoId);
    res.json({ 
      success: true, 
      message: 'Video updated successfully',
      id: videoId,
      filePath: filePath
    });
    
  } catch (error) {
    console.error('Error updating video:', error);
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
    
    connection.release();
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

router.delete('/:id', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const videoId = req.params.id;
    
    // Get video info before deletion
    const [videoResult] = await connection.execute(
      'SELECT videoFileAddress FROM ipvideo WHERE id = ?',
      [videoId]
    );
    
    if (videoResult.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Video not found' });
    }
    
    // Delete from database
    await connection.execute('DELETE FROM ipvideo WHERE id = ?', [videoId]);
    
    // Delete file if it exists
    const videoFile = videoResult[0].videoFileAddress;
    if (videoFile && videoFile !== 'https://example.com/firmware.bin') {
      const filePath = path.join(__dirname, '..', '..', 'public', videoFile);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('Deleted video file:', filePath);
      }
    }
    
    connection.release();
    
    console.log('Video deleted successfully with ID:', videoId);
    res.json({ 
      success: true, 
      message: 'Video deleted successfully',
      id: videoId
    });
    
  } catch (error) {
    console.error('Error deleting video:', error);
    connection.release();
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
});

export default router; 