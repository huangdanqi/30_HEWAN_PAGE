import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Model Configuration endpoint - GET (Fetch model configuration data)
router.get('/', async (req, res) => {
  try {
    console.log('Fetching model configuration data');
    const connection = await pool.getConnection();
    
    const {
      page = 1,
      pageSize = 10,
      search = '',
      modelType = '',
      sortBy = 'updateTime',
      sortOrder = 'desc'
    } = req.query;

    // Build WHERE clause for search
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (search) {
      whereClause += ' AND (modelId LIKE ? OR modelName LIKE ? OR modelType LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (modelType && modelType !== 'all') {
      whereClause += ' AND modelType = ?';
      params.push(modelType);
    }

    // Build ORDER BY clause
    const sqlSortOrder = sortOrder === 'asc' ? 'ASC' : 'DESC';
    const validSortFields = ['modelId', 'modelName', 'modelType', 'createTime', 'updateTime', 'unitCost', 'remainingTrainingTimes'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'updateTime';

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM model_configuration ${whereClause}`;
    const [countResult] = await connection.execute(countQuery, params);
    const total = countResult[0].total;

    // Check if it's a large page size request (get all data)
    const isLargePageSize = parseInt(pageSize) >= 1000;
    
    let dataQuery;
    if (isLargePageSize) {
      dataQuery = `
        SELECT id, modelId, modelType, modelName, containerId, versionNumber,
               apiUrl, localModelFileDir, remainingTrainingTimes,
               DATE_FORMAT(buildTime, '%Y-%m-%d %H:%i:%s') as buildTime,
               DATE_FORMAT(enableTime, '%Y-%m-%d %H:%i:%s') as enableTime,
               DATE_FORMAT(disableTime, '%Y-%m-%d %H:%i:%s') as disableTime,
               billingUnit, unitCost, accumulatedUsage, accumulatedCost,
               updater, DATE_FORMAT(createTime, '%Y-%m-%d %H:%i:%s') as createTime,
               DATE_FORMAT(updateTime, '%Y-%m-%d %H:%i:%s') as updateTime
        FROM model_configuration ${whereClause} ORDER BY ${sortField} ${sqlSortOrder}
      `;
    } else {
      const offset = (parseInt(page) - 1) * parseInt(pageSize);
      const limit = parseInt(pageSize);
      dataQuery = `
        SELECT id, modelId, modelType, modelName, containerId, versionNumber,
               apiUrl, localModelFileDir, remainingTrainingTimes,
               DATE_FORMAT(buildTime, '%Y-%m-%d %H:%i:%s') as buildTime,
               DATE_FORMAT(enableTime, '%Y-%m-%d %H:%i:%s') as enableTime,
               DATE_FORMAT(disableTime, '%Y-%m-%d %H:%i:%s') as disableTime,
               billingUnit, unitCost, accumulatedUsage, accumulatedCost,
               updater, DATE_FORMAT(createTime, '%Y-%m-%d %H:%i:%s') as createTime,
               DATE_FORMAT(updateTime, '%Y-%m-%d %H:%i:%s') as updateTime
        FROM model_configuration ${whereClause} ORDER BY ${sortField} ${sqlSortOrder} LIMIT ${limit} OFFSET ${offset}
      `;
    }

    const [dataResult] = await connection.execute(dataQuery, params);
    connection.release();

    console.log(`Model configuration data fetched: ${dataResult.length} records`);
    
    res.json({
      data: dataResult,
      total: total.toString(),
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });

  } catch (error) {
    console.error('Error fetching model configuration data:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
});

// Model Configuration endpoint - POST (Create new model configuration)
router.post('/', async (req, res) => {
  try {
    console.log('=== CREATE MODEL CONFIGURATION START ===');
    console.log('Creating new model configuration entry');
    console.log('Request body:', req.body);
    console.log('Updater from request:', req.body.updater);
    
    const connection = await pool.getConnection();
    
    const {
      modelType,
      modelName,
      voiceId,
      voiceName,
      accessType,
      apiUrl,
      localModelFileDir,
      billingUnit,
      unitCost,
      authFields,
      customFields,
      updater
    } = req.body;

    // Validate required fields
    if (!modelType || !modelName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate model name length
    if (modelName.length > 15) {
      return res.status(400).json({ error: 'Model name cannot exceed 15 characters' });
    }

    // Validate voice fields for TTS, IP VCM, User VCM
    if (['TTS', 'IP VCM', 'User VCM'].includes(modelType)) {
      if (!voiceId || voiceId.trim() === '') {
        return res.status(400).json({ error: 'Voice ID is required for TTS, IP VCM, and User VCM models' });
      }
      if (!voiceName || voiceName.trim() === '') {
        return res.status(400).json({ error: 'Voice name is required for TTS, IP VCM, and User VCM models' });
      }
      if (voiceName.length > 15) {
        return res.status(400).json({ error: 'Voice name cannot exceed 15 characters' });
      }
    }

    // Validate access information
    if (accessType === 'api') {
      if (!apiUrl || apiUrl.trim() === '') {
        return res.status(400).json({ error: 'API URL is required for API models' });
      }
    } else if (accessType === 'local') {
      if (!localModelFileDir || localModelFileDir.trim() === '') {
        return res.status(400).json({ error: 'Local model file directory is required for local models' });
      }
    }

    // Generate model_id and container_id first
    const modelId = `MDL${Date.now()}`;
    const containerId = voiceId || modelId;

    // Check for duplicate model name + container ID combination
    const [existingResult] = await connection.execute(
      'SELECT COUNT(*) as count FROM model_configuration WHERE modelName = ? AND containerId = ?',
      [modelName, containerId]
    );
    
    if (existingResult[0].count > 0) {
      return res.status(400).json({ error: 'Model name and container ID combination already exists' });
    }

    // Insert into database
    const insertQuery = `
      INSERT INTO model_configuration (
        modelId, modelType, modelName, containerId, versionNumber,
        apiUrl, localModelFileDir, billingUnit, unitCost, 
        accumulatedUsage, accumulatedCost, updater,
        createTime, updateTime
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    const insertParams = [
      modelId,
      modelType,
      modelName,
      containerId,
      voiceName || 'v1.0', // Use voiceName as versionNumber
      apiUrl || null,
      localModelFileDir || null,
      billingUnit || 'h',
      unitCost || 0,
      '0h', // Default accumulated usage
      '0元', // Default accumulated cost
      updater || '管理员'
    ];
    
    console.log('Insert query:', insertQuery);
    console.log('Insert params:', insertParams);
    
    const [result] = await connection.execute(insertQuery, insertParams);

    connection.release();
    
    console.log('Model configuration created successfully with ID:', result.insertId);
    console.log('Inserted data - Model ID:', modelId);
    console.log('Inserted data - Updater:', updater || '管理员');
    console.log('=== CREATE MODEL CONFIGURATION END ===');
    res.json({ 
      success: true, 
      message: 'Model configuration created successfully',
      id: result.insertId,
      modelId: modelId
    });
    
  } catch (error) {
    console.error('Error creating model configuration:', error);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Model Configuration endpoint - PUT (Update model configuration)
router.put('/:id', async (req, res) => {
  try {
    console.log('Updating model configuration entry');
    console.log('Request body:', req.body);
    console.log('Model ID:', req.params.id);
    
    const connection = await pool.getConnection();
    
    const {
      modelType,
      modelName,
      containerId,
      versionNumber,
      voiceId, // Accept both field names for backward compatibility
      voiceName,
      apiUrl,
      localModelFileDir,
      billingUnit,
      unitCost,
      updater
    } = req.body;

    // Use voiceId/voiceName if containerId/versionNumber are not provided
    const finalContainerId = containerId || voiceId;
    const finalVersionNumber = versionNumber || voiceName;

    // Validate required fields
    if (!modelType || !modelName) {
      return res.status(400).json({ error: 'Missing required fields: modelType, modelName' });
    }

    // For voice models (TTS, IP VCM, User VCM), require voice fields
    if (['TTS', 'IP VCM', 'User VCM'].includes(modelType)) {
      if (!finalContainerId || !finalVersionNumber) {
        return res.status(400).json({ error: 'Voice ID and Voice Name are required for TTS, IP VCM, and User VCM models' });
      }
    }

    // Validate model name length
    if (modelName.length > 100) {
      return res.status(400).json({ error: 'Model name cannot exceed 100 characters' });
    }

    // Check for duplicate model name (excluding current record)
    const [existingResult] = await connection.execute(
      'SELECT COUNT(*) as count FROM model_configuration WHERE modelName = ? AND id != ?',
      [modelName, req.params.id]
    );
    
    if (existingResult[0].count > 0) {
      return res.status(400).json({ error: 'Model name already exists' });
    }

    // Update database
    const updateQuery = `
      UPDATE model_configuration SET
        modelType = ?, modelName = ?, containerId = ?, versionNumber = ?,
        apiUrl = ?, localModelFileDir = ?, billingUnit = ?, unitCost = ?,
        updater = ?, updateTime = NOW()
      WHERE id = ?
    `;
    
    const updateParams = [
      modelType,
      modelName,
      finalContainerId,
      finalVersionNumber,
      apiUrl || null,
      localModelFileDir || null,
      billingUnit || 'h',
      unitCost || 0,
      updater || '管理员',
      req.params.id
    ];
    
    console.log('Update query:', updateQuery);
    console.log('Update params:', updateParams);
    
    const [result] = await connection.execute(updateQuery, updateParams);

    connection.release();
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Model configuration not found' });
    }
    
    console.log('Model configuration updated successfully');
    res.json({ 
      success: true, 
      message: 'Model configuration updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating model configuration:', error);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Model Configuration endpoint - DELETE (Delete model configuration)
router.delete('/:id', async (req, res) => {
  try {
    console.log('Deleting model configuration entry');
    console.log('Model ID:', req.params.id);
    
    const connection = await pool.getConnection();
    
    // Check if record exists
    const [existingResult] = await connection.execute(
      'SELECT modelName FROM model_configuration WHERE id = ?',
      [req.params.id]
    );
    
    if (existingResult.length === 0) {
      return res.status(404).json({ error: 'Model configuration not found' });
    }
    
    // Delete from database
    const deleteQuery = 'DELETE FROM model_configuration WHERE id = ?';
    const [result] = await connection.execute(deleteQuery, [req.params.id]);

    connection.release();
    
    console.log('Model configuration deleted successfully');
    res.json({ 
      success: true, 
      message: 'Model configuration deleted successfully',
      deletedModelName: existingResult[0].modelName
    });
    
  } catch (error) {
    console.error('Error deleting model configuration:', error);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

export default router; 