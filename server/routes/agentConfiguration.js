import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Agent Configuration API endpoints
router.get('/', async (req, res) => {
  try {
    console.log('Agent configuration endpoint called');
    const connection = await pool.getConnection();
    
    const {
      page = 1,
      pageSize = 10,
      search = '',
      sortBy = 'updateTime',
      sortOrder = 'desc'
    } = req.query;

    // Convert 'descend' to 'desc' for SQL compatibility
    const sqlSortOrder = sortOrder === 'descend' ? 'desc' : sortOrder;

    let whereConditions = [];
    let params = [];

    // Search filter
    if (search) {
      whereConditions.push(`(
        agentId LIKE ? OR 
        agentName LIKE ? OR 
        ipName LIKE ? OR 
        vad LIKE ? OR 
        asr LIKE ? OR 
        intelligentAgent LIKE ? OR 
        llm LIKE ? OR 
        memory LIKE ? OR 
        tools LIKE ?
      )`);
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam, searchParam, searchParam, searchParam, searchParam, searchParam);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Count total records
    const countQuery = `SELECT COUNT(*) as total FROM agentconfiguration ${whereClause}`;
    const [countResult] = await connection.execute(countQuery, params);
    const total = countResult[0].total;

    // Get paginated data
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);
    
    const dataQuery = `
      SELECT 
        id,
        agentId,
        agentName,
        botId,
        apiUrl,
        apiKey,
        ipName,
        vad,
        asr,
        intelligentAgent,
        llm,
        memory,
        tools,
        tts,
        ttsVoiceName,
        ipVcm,
        vcmVoiceName,
        updater,
        DATE_FORMAT(createTime, '%Y-%m-%d %H:%i:%s') as createTime,
        DATE_FORMAT(updateTime, '%Y-%m-%d %H:%i:%s') as updateTime
      FROM agentconfiguration 
      ${whereClause}
      ORDER BY ${sortBy} ${sqlSortOrder}
      LIMIT ${limit} OFFSET ${offset}
    `;

    
    const [dataResult] = await connection.execute(dataQuery, params);

    connection.release();

    res.json({
      success: true,
      data: dataResult,
      total: total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });

  } catch (error) {
    console.error('Error fetching agent configuration data:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

router.post('/', async (req, res) => {
  try {
    console.log('Creating new agent configuration entry');
    console.log('Request body:', req.body);
    
    const connection = await pool.getConnection();
    
    const {
      agentName,
      botId,
      apiUrl,
      apiKey,
      ipName,
      vad,
      asr,
      intelligentAgent,
      llm,
      memory,
      tools,
      tts,
      ttsVoiceName,
      ipVcm,
      vcmVoiceName,
      updater
    } = req.body;

    // Validate required fields
    if (!agentName || agentName.trim() === '') {
      return res.status(400).json({ error: 'Agent name is required' });
    }

    if (agentName.length > 100) {
      return res.status(400).json({ error: 'Agent name cannot exceed 100 characters' });
    }

    // Check for duplicate agent name
    const [existingResult] = await connection.execute(
      'SELECT COUNT(*) as count FROM agentconfiguration WHERE agentName = ?',
      [agentName]
    );

    if (existingResult[0].count > 0) {
      return res.status(400).json({ error: 'Agent name already exists' });
    }

    const agentId = `AGENT${Date.now()}`;

    const insertQuery = `
      INSERT INTO agentconfiguration (
        agentId, agentName, botId, apiUrl, apiKey, ipName, vad, asr, 
        intelligentAgent, llm, memory, tools, tts, ttsVoiceName, 
        ipVcm, vcmVoiceName, updater
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const insertParams = [
      agentId,
      agentName,
      botId || null,
      apiUrl || null,
      apiKey || null,
      ipName || null,
      vad || null,
      asr || null,
      intelligentAgent || null,
      llm || null,
      memory || null,
      tools || null,
      tts || null,
      ttsVoiceName || null,
      ipVcm || null,
      vcmVoiceName || null,
      updater || '管理员'
    ];

    const [result] = await connection.execute(insertQuery, insertParams);

    console.log('Agent configuration created successfully with ID:', result.insertId);
    console.log('Inserted data - Agent ID:', agentId);
    console.log('Inserted data - Agent Name:', agentName);
    console.log('Inserted data - Updater:', updater || '管理员');

    connection.release();

    res.json({ 
      success: true, 
      message: 'Agent configuration created successfully',
      id: result.insertId,
      agentId: agentId
    });

  } catch (error) {
    console.error('Error creating agent configuration:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Updating agent configuration with ID:', id);
    console.log('Request body:', req.body);
    
    const connection = await pool.getConnection();
    
    const {
      agentName,
      botId,
      apiUrl,
      apiKey,
      ipName,
      vad,
      asr,
      intelligentAgent,
      llm,
      memory,
      tools,
      tts,
      ttsVoiceName,
      ipVcm,
      vcmVoiceName,
      updater
    } = req.body;

    // Validate required fields
    if (!agentName || agentName.trim() === '') {
      return res.status(400).json({ error: 'Agent name is required' });
    }

    if (agentName.length > 100) {
      return res.status(400).json({ error: 'Agent name cannot exceed 100 characters' });
    }

    // Check for duplicate agent name (excluding current record)
    const [existingResult] = await connection.execute(
      'SELECT COUNT(*) as count FROM agentconfiguration WHERE agentName = ? AND id != ?',
      [agentName, id]
    );

    if (existingResult[0].count > 0) {
      return res.status(400).json({ error: 'Agent name already exists' });
    }

    const updateQuery = `
      UPDATE agentconfiguration SET
        agentName = ?, botId = ?, apiUrl = ?, apiKey = ?, ipName = ?, 
        vad = ?, asr = ?, intelligentAgent = ?, llm = ?, memory = ?, 
        tools = ?, tts = ?, ttsVoiceName = ?, ipVcm = ?, vcmVoiceName = ?, 
        updater = ?, updateTime = NOW()
      WHERE id = ?
    `;

    const updateParams = [
      agentName,
      botId || null,
      apiUrl || null,
      apiKey || null,
      ipName || null,
      vad || null,
      asr || null,
      intelligentAgent || null,
      llm || null,
      memory || null,
      tools || null,
      tts || null,
      ttsVoiceName || null,
      ipVcm || null,
      vcmVoiceName || null,
      updater || '管理员',
      id
    ];

    const [result] = await connection.execute(updateQuery, updateParams);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Agent configuration not found' });
    }

    console.log('Agent configuration updated successfully');
    connection.release();

    res.json({ 
      success: true, 
      message: 'Agent configuration updated successfully'
    });

  } catch (error) {
    console.error('Error updating agent configuration:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Deleting agent configuration with ID:', id);
    
    const connection = await pool.getConnection();
    
    const [result] = await connection.execute(
      'DELETE FROM agentconfiguration WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Agent configuration not found' });
    }

    console.log('Agent configuration deleted successfully');
    connection.release();

    res.json({ 
      success: true, 
      message: 'Agent configuration deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting agent configuration:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

export default router; 