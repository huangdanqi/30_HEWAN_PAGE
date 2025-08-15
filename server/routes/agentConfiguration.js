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
      sortBy = 'update_time',
      sortOrder = 'desc'
    } = req.query;

    // Convert 'descend' to 'desc' for SQL compatibility
    const sqlSortOrder = sortOrder === 'descend' ? 'desc' : sortOrder;

    let whereConditions = [];
    let params = [];

    // Search filter
    if (search) {
      whereConditions.push(`(
        agent_id LIKE ? OR 
        agent_name LIKE ? OR 
        ip_name LIKE ? OR 
        vad LIKE ? OR 
        asr LIKE ? OR 
        intent_recognition LIKE ? OR 
        knowledge_base LIKE ? OR 
        llm LIKE ? OR 
        memory LIKE ? OR 
        tools LIKE ?
      )`);
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam, searchParam, searchParam, searchParam, searchParam, searchParam, searchParam);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Count total records
    const countQuery = `SELECT COUNT(*) as total FROM agent_configuration ${whereClause}`;
    const [countResult] = await connection.execute(countQuery, params);
    const total = countResult[0].total;

    // Get paginated data
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);
    
    const dataQuery = `
      SELECT 
        id,
        agent_id,
        agent_name,
        ip_name,
        vad,
        asr,
        intent_recognition,
        knowledge_base,
        llm,
        memory,
        tools,
        tts,
        tts_combination_name,
        ip_vcm,
        vcm_combination_name,
        updater,
        DATE_FORMAT(create_time, '%Y-%m-%d %H:%i:%s') as create_time,
        DATE_FORMAT(update_time, '%Y-%m-%d %H:%i:%s') as update_time
      FROM agent_configuration 
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
      ipName,
      vad,
      asr,
      intentRecognition,
      knowledgeBase,
      llm,
      memory,
      tools,
      tts,
      ttsCombinationName,
      ipVcm,
      vcmCombinationName,
      updater
    } = req.body;

    // Validate required fields
    if (!agentName || agentName.trim() === '') {
      return res.status(400).json({ error: 'Agent name is required' });
    }

    if (agentName.length > 200) {
      return res.status(400).json({ error: 'Agent name cannot exceed 200 characters' });
    }

    // Check for duplicate agent name
    const [existingResult] = await connection.execute(
      'SELECT COUNT(*) as count FROM agent_configuration WHERE agent_name = ?',
      [agentName]
    );

    if (existingResult[0].count > 0) {
      return res.status(400).json({ error: 'Agent name already exists' });
    }

    const agentId = `AGENT${Date.now()}`;

    const insertQuery = `
      INSERT INTO agent_configuration (
        agent_id, agent_name, ip_name, vad, asr, 
        intent_recognition, knowledge_base, llm, memory, tools, 
        tts, tts_combination_name, ip_vcm, vcm_combination_name, updater
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const insertParams = [
      agentId,
      agentName,
      ipName || null,
      vad || null,
      asr || null,
      intentRecognition || null,
      knowledgeBase || null,
      llm || null,
      memory || null,
      tools || null,
      tts || null,
      ttsCombinationName || null,
      ipVcm || null,
      vcmCombinationName || null,
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
      ipName,
      vad,
      asr,
      intentRecognition,
      knowledgeBase,
      llm,
      memory,
      tools,
      tts,
      ttsCombinationName,
      ipVcm,
      vcmCombinationName,
      updater
    } = req.body;

    // Validate required fields
    if (!agentName || agentName.trim() === '') {
      return res.status(400).json({ error: 'Agent name is required' });
    }

    if (agentName.length > 200) {
      return res.status(400).json({ error: 'Agent name cannot exceed 200 characters' });
    }

    // Check for duplicate agent name (excluding current record)
    const [existingResult] = await connection.execute(
      'SELECT COUNT(*) as count FROM agent_configuration WHERE agent_name = ? AND id != ?',
      [agentName, id]
    );

    if (existingResult[0].count > 0) {
      return res.status(400).json({ error: 'Agent name already exists' });
    }

    const updateQuery = `
      UPDATE agent_configuration SET
        agent_name = ?, ip_name = ?, vad = ?, asr = ?, 
        intent_recognition = ?, knowledge_base = ?, llm = ?, memory = ?, 
        tools = ?, tts = ?, tts_combination_name = ?, ip_vcm = ?, 
        vcm_combination_name = ?, updater = ?, update_time = NOW()
      WHERE id = ?
    `;

    const updateParams = [
      agentName,
      ipName || null,
      vad || null,
      asr || null,
      intentRecognition || null,
      knowledgeBase || null,
      llm || null,
      memory || null,
      tools || null,
      tts || null,
      ttsCombinationName || null,
      ipVcm || null,
      vcmCombinationName || null,
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
      'DELETE FROM agent_configuration WHERE id = ?',
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