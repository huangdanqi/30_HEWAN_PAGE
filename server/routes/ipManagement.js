import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// IP Management API endpoint
router.get('/', async (req, res) => {
  try {
    console.log('IP Management endpoint called');
    
    // Simple query to get all data
    const dataQuery = `
      SELECT 
        id,
        ip_id,
        ip_name,
        ip_intro,
        ip_address,
        device_id,
        device_model,
        status,
        running,
        portrait,
        mbti,
        preference,
        agent_link,
        last_seen,
        creator,
        updater,
        create_time,
        update_time
      FROM ip_management 
      ORDER BY update_time DESC
    `;
    
    console.log('Data query:', dataQuery);
    
    const [dataResult] = await pool.execute(dataQuery);
    console.log('Data result count:', dataResult.length);
    
    // Transform data to camelCase for frontend
    const transformedData = dataResult.map(row => ({
      id: row.id,
      ipId: row.ip_id,
      ipName: row.ip_name,
      ipIntro: row.ip_intro,
      ipAddress: row.ip_address,
      deviceId: row.device_id,
      deviceModel: row.device_model,
      status: row.status,
      running: row.running,
      portrait: row.portrait,
      mbti: row.mbti,
      preference: row.preference,
      agentLink: row.agent_link,
      lastSeen: row.last_seen,
      creator: row.creator,
      updater: row.updater,
      createTime: row.create_time,
      updateTime: row.update_time
    }));
    
    console.log('Transformed data count:', transformedData.length);
    
    res.json({
      data: transformedData,
      total: transformedData.length,
      page: 1,
      pageSize: transformedData.length
    });
  } catch (error) {
    console.error('Error fetching IP management data:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Create new IP Management record
router.post('/', async (req, res) => {
  try {
    const { ipName, ipIntro, running, portrait, mbti, preference, agentLink, updater } = req.body;
    
    console.log('Received data:', { ipName, ipIntro, running, portrait, mbti, preference, agentLink, updater });
    
    // Validate required fields
    if (!ipName) {
      return res.status(400).json({ error: 'IP名称不能为空' });
    }
    if (!ipIntro) {
      return res.status(400).json({ error: 'IP介绍不能为空' });
    }
    if (!running) {
      return res.status(400).json({ error: '请选择五行' });
    }
    if (!portrait) {
      return res.status(400).json({ error: '请选择星座' });
    }
    if (!mbti) {
      return res.status(400).json({ error: '请选择MBTI' });
    }
    if (!preference) {
      return res.status(400).json({ error: '喜好不能为空' });
    }
    
    // Check for duplicate IP name
    const [existingResult] = await pool.execute(
      'SELECT COUNT(*) as count FROM ip_management WHERE ip_name = ?',
      [ipName]
    );
    
    if (existingResult[0].count > 0) {
      return res.status(400).json({ error: 'IP名称已存在，请使用其他名称' });
    }
    
    // Generate unique IP ID and IP address
    const timestamp = Date.now();
    const ipId = `hjhwx${timestamp}`;
    
    // Generate a unique IP address by checking for conflicts
    let ipAddress;
    let attempts = 0;
    do {
      ipAddress = `192.168.1.${Math.floor(Math.random() * 254) + 1}`;
      attempts++;
      
      // Check if this IP address already exists
      const [ipCheckResult] = await pool.execute(
        'SELECT COUNT(*) as count FROM ip_management WHERE ip_address = ?',
        [ipAddress]
      );
      
      if (ipCheckResult[0].count === 0) {
        break; // IP address is unique
      }
      
      if (attempts > 10) {
        // Fallback to timestamp-based IP if random generation fails
        ipAddress = `192.168.1.${timestamp % 254 + 1}`;
        break;
      }
    } while (attempts <= 10);
    
    console.log('Generated IP ID:', ipId);
    console.log('Generated IP Address:', ipAddress);
    
    // Insert new record
    const insertQuery = `
      INSERT INTO ip_management (
        ip_id, ip_name, ip_intro, ip_address, running, portrait, mbti, preference, agent_link, updater
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const insertParams = [
      ipId, ipName, ipIntro, ipAddress, running, portrait, mbti, preference, agentLink || '', updater || '管理员'
    ];
    
    console.log('Insert query:', insertQuery);
    console.log('Insert params:', insertParams);
    
    await pool.execute(insertQuery, insertParams);
    
    res.status(201).json({ 
      message: 'IP创建成功',
      ipId: ipId,
      ipAddress: ipAddress
    });
  } catch (error) {
    console.error('Error creating IP management record:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    
    // Check if it's a database constraint error
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'IP地址或ID已存在，请重试' });
    }
    
    // Check if it's a database connection error
    if (error.code === 'ECONNREFUSED' || error.code === 'ER_ACCESS_DENIED_ERROR') {
      return res.status(500).json({ error: '数据库连接失败，请检查数据库配置' });
    }
    
    res.status(500).json({ error: '服务器内部错误，请稍后重试', details: error.message });
  }
});

// Update IP Management record
router.put('/:ipId', async (req, res) => {
  try {
    const { ipId } = req.params;
    const { ipName, ipIntro, ipAddress, running, portrait, mbti, preference, agentLink, updater } = req.body;
    
    // Validate required fields
    if (!ipName) {
      return res.status(400).json({ error: 'IP名称不能为空' });
    }
    if (!ipIntro) {
      return res.status(400).json({ error: 'IP介绍不能为空' });
    }
    if (!running) {
      return res.status(400).json({ error: '请选择五行' });
    }
    if (!portrait) {
      return res.status(400).json({ error: '请选择星座' });
    }
    if (!mbti) {
      return res.status(400).json({ error: '请选择MBTI' });
    }
    if (!preference) {
      return res.status(400).json({ error: '喜好不能为空' });
    }
    
    // Check if IP name already exists (excluding current record)
    const [existingResult] = await pool.execute(
      'SELECT COUNT(*) as count FROM ip_management WHERE ip_name = ? AND ip_id != ?',
      [ipName, ipId]
    );
    
    if (existingResult[0].count > 0) {
      return res.status(400).json({ error: 'IP名称已存在，请使用其他名称' });
    }
    
    // Update record
    const updateQuery = `
      UPDATE ip_management SET 
        ip_name = ?, 
        ip_intro = ?, 
        ip_address = ?,
        running = ?, 
        portrait = ?, 
        mbti = ?, 
        preference = ?, 
        agent_link = ?,
        updater = ?,
        update_time = NOW()
      WHERE ip_id = ?
    `;
    
    await pool.execute(updateQuery, [
      ipName, ipIntro, ipAddress || '', running, portrait, mbti, preference, agentLink || '', updater || '管理员', ipId
    ]);
    
    res.json({ 
      message: 'IP更新成功',
      ipId: ipId
    });
  } catch (error) {
    console.error('Error updating IP management record:', error);
    res.status(500).json({ error: '服务器内部错误，请稍后重试' });
  }
});

export default router; 