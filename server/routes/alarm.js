import express from 'express';
import pool from '../config/database.js';
import { upload } from '../middleware/upload.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Alarm API endpoints
router.get('/', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { page = 1, pageSize = 10, search = '', sortBy = 'updateTime', sortOrder = 'desc' } = req.query;
    
    // Build WHERE clause for search
    let whereClause = '';
    const params = [];
    
    if (search) {
      whereClause = 'WHERE alarmName LIKE ? OR alarmId LIKE ?';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }
    
    // Convert sort order
    const sqlSortOrder = sortOrder === 'ascend' ? 'ASC' : 'DESC';
    
    // Check if we want all data (for large pageSize)
    const isLargePageSize = parseInt(pageSize) >= 1000;
    let dataQuery;
    
    if (isLargePageSize) {
      dataQuery = `
        SELECT id, alarmId, alarmName, alarmFileAddress, updater, 
               DATE_FORMAT(createTime, '%Y-%m-%d %H:%i:%s') as createTime, 
               DATE_FORMAT(updateTime, '%Y-%m-%d %H:%i:%s') as updateTime
        FROM alarm ${whereClause} ORDER BY ${sortBy} ${sqlSortOrder}
      `;
    } else {
      const offset = (parseInt(page) - 1) * parseInt(pageSize);
      const limit = parseInt(pageSize);
      dataQuery = `
        SELECT id, alarmId, alarmName, alarmFileAddress, updater, 
               DATE_FORMAT(createTime, '%Y-%m-%d %H:%i:%s') as createTime, 
               DATE_FORMAT(updateTime, '%Y-%m-%d %H:%i:%s') as updateTime
        FROM alarm ${whereClause} ORDER BY ${sortBy} ${sqlSortOrder} LIMIT ${limit} OFFSET ${offset}
      `;
    }
    
    // Count query
    const countQuery = `SELECT COUNT(*) as total FROM alarm ${whereClause}`;
    
    const [dataRows] = await connection.execute(dataQuery, params);
    const [countRows] = await connection.execute(countQuery, params);
    
    res.json({
      data: dataRows,
      total: countRows[0].total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });
    
  } catch (error) {
    console.error('Error fetching alarm data:', error);
    res.status(500).json({ error: 'Failed to fetch alarm data' });
  } finally {
    connection.release();
  }
});

// Alarm endpoint - POST (Create new alarm)
router.post('/', upload.single('alarmFile'), async (req, res) => {
  try {
    console.log('Creating new alarm entry');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    
    const connection = await pool.getConnection();
    
    const {
      alarmName,
      updater
    } = req.body;

    // Validate required fields
    if (!alarmName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No alarm file uploaded' });
    }

    // Validate alarm name length
    if (alarmName.length > 15) {
      return res.status(400).json({ error: 'Alarm name cannot exceed 15 characters' });
    }

    // Check for duplicate alarm name
    const [existingResult] = await connection.execute(
      'SELECT COUNT(*) as count FROM alarm WHERE alarmName = ?',
      [alarmName]
    );
    
    if (existingResult[0].count > 0) {
      return res.status(400).json({ error: 'Alarm name already exists' });
    }

    // Handle file upload
    const alarmFile = req.file;
    console.log('Alarm file received:', alarmFile);
    
    // The file is already saved by multer, just get the path
    const fileName = alarmFile.filename;
    const filePath = `/audio/${fileName}`;
    
    console.log('File path:', filePath);
    console.log('Full file path:', alarmFile.path);

    // Generate alarm_id
    const alarmId = `ALM${Date.now()}`;

    // Insert into database
    const insertQuery = `
      INSERT INTO alarm (alarmId, alarmName, alarmFileAddress, updater, createTime, updateTime)
      VALUES (?, ?, ?, ?, NOW(), NOW())
    `;
    
    const insertParams = [
      alarmId,
      alarmName,
      filePath,
      updater || '管理员'
    ];
    
    console.log('Insert query:', insertQuery);
    console.log('Insert params:', insertParams);
    
    const [result] = await connection.execute(insertQuery, insertParams);

    connection.release();
    
    console.log('Alarm created successfully with ID:', result.insertId);
    res.json({ 
      success: true, 
      message: 'Alarm created successfully',
      id: result.insertId,
      alarmId: alarmId,
      filePath: filePath
    });
    
  } catch (error) {
    console.error('Error creating alarm:', error);
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

// Alarm endpoint - PUT (Update existing alarm)
router.put('/:id', upload.single('alarmFile'), async (req, res) => {
  try {
    console.log('Updating alarm entry');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('Alarm ID:', req.params.id);
    
    const connection = await pool.getConnection();
    
    const {
      alarmName,
      updater
    } = req.body;

    const alarmId = req.params.id;

    // Validate required fields
    if (!alarmName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate alarm name length
    if (alarmName.length > 15) {
      return res.status(400).json({ error: 'Alarm name cannot exceed 15 characters' });
    }

    // Check if alarm exists
    const [existingResult] = await connection.execute(
      'SELECT * FROM alarm WHERE id = ?',
      [alarmId]
    );

    if (existingResult.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Alarm not found' });
    }

    // Check for duplicate alarm name (excluding current record)
    const [duplicateResult] = await connection.execute(
      'SELECT COUNT(*) as count FROM alarm WHERE alarmName = ? AND id != ?',
      [alarmName, alarmId]
    );
    
    if (duplicateResult[0].count > 0) {
      connection.release();
      return res.status(400).json({ error: 'Alarm name already exists' });
    }

    const existingAlarm = existingResult[0];
    let filePath = existingAlarm.alarmFileAddress; // Keep existing file path by default

    // Handle file upload if new file is provided
    if (req.file) {
      const alarmFile = req.file;
      console.log('New alarm file received:', alarmFile);
      
      // Generate new file path
      const fileName = alarmFile.filename;
      filePath = `/audio/${fileName}`;
      
      console.log('New file path:', filePath);
      console.log('Full file path:', alarmFile.path);
    }

    // Update database
    const updateQuery = `
      UPDATE alarm SET 
        alarmName = ?, 
        alarmFileAddress = ?,
        updater = ?,
        updateTime = NOW()
      WHERE id = ?
    `;
    
    const updateParams = [
      alarmName,
      filePath,
      updater || '管理员',
      alarmId
    ];
    
    console.log('Update query:', updateQuery);
    console.log('Update params:', updateParams);
    
    await connection.execute(updateQuery, updateParams);

    connection.release();
    
    console.log('Alarm updated successfully with ID:', alarmId);
    res.json({ 
      success: true, 
      message: 'Alarm updated successfully',
      id: alarmId,
      filePath: filePath
    });
    
  } catch (error) {
    console.error('Error updating alarm:', error);
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

// Alarm endpoint - DELETE
router.delete('/:id', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const alarmId = req.params.id;
    
    // Get alarm info before deletion
    const [alarmResult] = await connection.execute(
      'SELECT alarmFileAddress FROM alarm WHERE id = ?',
      [alarmId]
    );
    
    if (alarmResult.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Alarm not found' });
    }
    
    // Delete from database
    await connection.execute('DELETE FROM alarm WHERE id = ?', [alarmId]);
    
    // Delete file if it exists
    const alarmFile = alarmResult[0].alarmFileAddress;
    if (alarmFile && alarmFile !== 'https://example.com/firmware.bin') {
      const filePath = path.join(__dirname, '..', '..', 'public', alarmFile);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('Deleted alarm file:', filePath);
      }
    }
    
    connection.release();
    
    console.log('Alarm deleted successfully with ID:', alarmId);
    res.json({ 
      success: true, 
      message: 'Alarm deleted successfully',
      id: alarmId
    });
    
  } catch (error) {
    console.error('Error deleting alarm:', error);
    connection.release();
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
});

export default router; 