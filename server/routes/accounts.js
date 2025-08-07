import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Get account basic data (member info, device info)
router.get('/basic', async (req, res) => {
  try {
    console.log('Basic endpoint called with params:', req.query);
    const connection = await pool.getConnection();
    
    const {
      page = 1,
      pageSize = 10,
      search = '',
      ipRole = '',
      sortBy = 'registration_time',
      sortOrder = 'desc'
    } = req.query;

    // Convert 'descend' to 'desc' for SQL compatibility
    const sqlSortOrder = sortOrder === 'descend' ? 'desc' : sortOrder;

    let whereConditions = [];
    let params = [];

    // Search filter
    if (search) {
      whereConditions.push(`(
        member_id LIKE ? OR 
        phone_number LIKE ? OR 
        device_model LIKE ? OR 
        device_id LIKE ? OR 
        ip_role LIKE ?
      )`);
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam, searchParam);
    }

    // Specific filters
    if (ipRole && ipRole !== 'all') {
      whereConditions.push('ip_role = ?');
      params.push(ipRole);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    console.log('SQL Query:', `SELECT COUNT(*) as total FROM account_data ${whereClause}`);
    console.log('Params:', params);

    // Count total records
    const countQuery = `SELECT COUNT(*) as total FROM account_data ${whereClause}`;
    const [countResult] = await connection.execute(countQuery, params);
    const total = countResult[0].total;

    console.log('Total records:', total);

    // Get paginated data with ALL columns
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);
    
    const dataQuery = `
      SELECT 
        id,
        member_id as memberId,
        phone_number as phoneNumber,
        device_model as deviceModel,
        device_id as deviceId,
        ip_role as ipRole,
        product_id as productId,
        commodity_id as commodityId,
        voice_cloning_model_id as voiceCloningModelId,
        DATE_FORMAT(initial_activation_time, '%Y-%m-%d %H:%i:%s') as initialActivationTime,
        current_member_type as currentMemberType,
        member_payment as memberPayment,
        DATE_FORMAT(member_activation_time, '%Y-%m-%d %H:%i:%s') as memberActivationTime,
        DATE_FORMAT(member_expiration_time, '%Y-%m-%d %H:%i:%s') as memberExpirationTime,
        fourg_card_number as fourGCardNumber,
        fourg_plan as fourGPlan,
        remaining_data_current_month as remainingDataCurrentMonth,
        fourg_payment as fourGPayment,
        DATE_FORMAT(fourg_activation_time, '%Y-%m-%d %H:%i:%s') as fourGActivationTime,
        DATE_FORMAT(fourg_expiration_time, '%Y-%m-%d %H:%i:%s') as fourGExpirationTime,
        annual_service_fee_balance as annualServiceFeeBalance,
        asr_usage as asrUsage,
        llm_usage as llmUsage,
        tts_usage as ttsUsage,
        voice_clone_usage as voiceCloneUsage,
        DATE_FORMAT(registration_time, '%Y-%m-%d %H:%i:%s') as registrationTime
      FROM account_data 
      ${whereClause}
      ORDER BY ${sortBy} ${sqlSortOrder.toUpperCase()}
      LIMIT ${limit} OFFSET ${offset}
    `;

    console.log('Data Query:', dataQuery);
    console.log('Data Params:', params);

    const [rows] = await connection.execute(dataQuery, params);

    console.log('Rows returned:', rows.length);

    connection.release();

    res.json({
      data: rows.map(row => ({ ...row, key: row.id })),
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });

  } catch (error) {
    console.error('Error in basic endpoint:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Get member subscription data
router.get('/membership', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const {
      page = 1,
      pageSize = 10,
      memberType = '',
      memberPayment = '',
      sortBy = 'member_activation_time',
      sortOrder = 'desc'
    } = req.query;

    // Convert 'descend' to 'desc' for SQL compatibility
    const sqlSortOrder = sortOrder === 'descend' ? 'desc' : sortOrder;

    let whereConditions = [];
    let params = [];

    // Specific filters
    if (memberType && memberType !== 'all') {
      whereConditions.push('current_member_type = ?');
      params.push(memberType);
    }

    if (memberPayment && memberPayment !== 'all') {
      whereConditions.push('member_payment = ?');
      params.push(memberPayment);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Count total records
    const countQuery = `SELECT COUNT(*) as total FROM account_data ${whereClause}`;
    const [countResult] = await connection.execute(countQuery, params);
    const total = countResult[0].total;

    // Get paginated data
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);
    const dataQuery = `
      SELECT 
        id,
        current_member_type as currentMemberType,
        member_payment as memberPayment,
        DATE_FORMAT(member_activation_time, '%Y-%m-%d %H:%i:%s') as memberActivationTime,
        DATE_FORMAT(member_expiration_time, '%Y-%m-%d %H:%i:%s') as memberExpirationTime,
        annual_service_fee_balance as annualServiceFeeBalance
      FROM account_data 
      ${whereClause}
      ORDER BY ${sortBy} ${sqlSortOrder.toUpperCase()}
      LIMIT ${limit} OFFSET ${offset}
    `;

    const [rows] = await connection.execute(dataQuery, [...params, parseInt(pageSize), offset]);

    connection.release();

    res.json({
      data: rows.map(row => ({ ...row, key: row.id })),
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });

  } catch (error) {
    console.error('Error fetching membership data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get 4G service data
router.get('/4g-service', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const {
      page = 1,
      pageSize = 10,
      fourGPlan = '',
      fourGPayment = '',
      sortBy = 'fourg_activation_time',
      sortOrder = 'desc'
    } = req.query;

    // Convert 'descend' to 'desc' for SQL compatibility
    const sqlSortOrder = sortOrder === 'descend' ? 'desc' : sortOrder;

    let whereConditions = [];
    let params = [];

    // Specific filters
    if (fourGPlan && fourGPlan !== 'all') {
      whereConditions.push('fourg_plan = ?');
      params.push(fourGPlan);
    }

    if (fourGPayment && fourGPayment !== 'all') {
      whereConditions.push('fourg_payment = ?');
      params.push(fourGPayment);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Count total records
    const countQuery = `SELECT COUNT(*) as total FROM account_data ${whereClause}`;
    const [countResult] = await connection.execute(countQuery, params);
    const total = countResult[0].total;

    // Get paginated data
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);
    const dataQuery = `
      SELECT 
        id,
        fourg_card_number as fourGCardNumber,
        fourg_plan as fourGPlan,
        remaining_data_current_month as remainingDataCurrentMonth,
        fourg_payment as fourGPayment,
        DATE_FORMAT(fourg_activation_time, '%Y-%m-%d %H:%i:%s') as fourGActivationTime,
        DATE_FORMAT(fourg_expiration_time, '%Y-%m-%d %H:%i:%s') as fourGExpirationTime
      FROM account_data 
      ${whereClause}
      ORDER BY ${sortBy} ${sqlSortOrder.toUpperCase()}
      LIMIT ${limit} OFFSET ${offset}
    `;

    const [rows] = await connection.execute(dataQuery, [...params, parseInt(pageSize), offset]);

    connection.release();

    res.json({
      data: rows.map(row => ({ ...row, key: row.id })),
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });

  } catch (error) {
    console.error('Error fetching 4G service data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get usage statistics data
router.get('/usage', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const {
      page = 1,
      pageSize = 10,
      sortBy = 'asr_usage',
      sortOrder = 'desc'
    } = req.query;

    // Convert 'descend' to 'desc' for SQL compatibility
    const sqlSortOrder = sortOrder === 'descend' ? 'desc' : sortOrder;

    // Count total records
    const countQuery = `SELECT COUNT(*) as total FROM account_data`;
    const [countResult] = await connection.execute(countQuery);
    const total = countResult[0].total;

    // Get paginated data
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);
    const dataQuery = `
      SELECT 
        id,
        asr_usage as asrUsage,
        llm_usage as llmUsage,
        tts_usage as ttsUsage,
        voice_clone_usage as voiceCloneUsage
      FROM account_data 
      ORDER BY ${sortBy} ${sqlSortOrder.toUpperCase()}
      LIMIT ${limit} OFFSET ${offset}
    `;

    const [rows] = await connection.execute(dataQuery, [parseInt(pageSize), offset]);

    connection.release();

    res.json({
      data: rows.map(row => ({ ...row, key: row.id })),
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });

  } catch (error) {
    console.error('Error fetching usage data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all account data (combined for backward compatibility)
router.get('/', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const {
      page = 1,
      pageSize = 10,
      search = '',
      ipRole = '',
      memberType = '',
      memberPayment = '',
      fourGPlan = '',
      fourGPayment = '',
      sortBy = 'registration_time',
      sortOrder = 'desc'
    } = req.query;

    // Convert 'descend' to 'desc' for SQL compatibility
    const sqlSortOrder = sortOrder === 'descend' ? 'desc' : sortOrder;

    let whereConditions = [];
    let params = [];

    // Search filter
    if (search) {
      whereConditions.push(`(
        member_id LIKE ? OR 
        phone_number LIKE ? OR 
        device_model LIKE ? OR 
        device_id LIKE ? OR 
        ip_role LIKE ? OR 
        product_id LIKE ? OR 
        commodity_id LIKE ? OR 
        voice_cloning_model_id LIKE ?
      )`);
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam, searchParam, searchParam, searchParam, searchParam);
    }

    // Specific filters
    if (ipRole && ipRole !== 'all') {
      whereConditions.push('ip_role = ?');
      params.push(ipRole);
    }

    if (memberType && memberType !== 'all') {
      whereConditions.push('current_member_type = ?');
      params.push(memberType);
    }

    if (memberPayment && memberPayment !== 'all') {
      whereConditions.push('member_payment = ?');
      params.push(memberPayment);
    }

    if (fourGPlan && fourGPlan !== 'all') {
      whereConditions.push('fourg_plan = ?');
      params.push(fourGPlan);
    }

    if (fourGPayment && fourGPayment !== 'all') {
      whereConditions.push('fourg_payment = ?');
      params.push(fourGPayment);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Count total records
    const countQuery = `SELECT COUNT(*) as total FROM account_data ${whereClause}`;
    const [countResult] = await connection.execute(countQuery, params);
    const total = countResult[0].total;

    // Get paginated data
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);
    const dataQuery = `
      SELECT 
        id,
        member_id as memberId,
        phone_number as phoneNumber,
        device_model as deviceModel,
        device_id as deviceId,
        ip_role as ipRole,
        product_id as productId,
        commodity_id as commodityId,
        voice_cloning_model_id as voiceCloningModelId,
        DATE_FORMAT(initial_activation_time, '%Y-%m-%d %H:%i:%s') as initialActivationTime,
        current_member_type as currentMemberType,
        member_payment as memberPayment,
        DATE_FORMAT(member_activation_time, '%Y-%m-%d %H:%i:%s') as memberActivationTime,
        DATE_FORMAT(member_expiration_time, '%Y-%m-%d %H:%i:%s') as memberExpirationTime,
        fourg_card_number as fourGCardNumber,
        fourg_plan as fourGPlan,
        remaining_data_current_month as remainingDataCurrentMonth,
        fourg_payment as fourGPayment,
        DATE_FORMAT(fourg_activation_time, '%Y-%m-%d %H:%i:%s') as fourGActivationTime,
        DATE_FORMAT(fourg_expiration_time, '%Y-%m-%d %H:%i:%s') as fourGExpirationTime,
        annual_service_fee_balance as annualServiceFeeBalance,
        asr_usage as asrUsage,
        llm_usage as llmUsage,
        tts_usage as ttsUsage,
        voice_clone_usage as voiceCloneUsage,
        DATE_FORMAT(registration_time, '%Y-%m-%d %H:%i:%s') as registrationTime
      FROM account_data 
      ${whereClause}
      ORDER BY ${sortBy} ${sqlSortOrder.toUpperCase()}
      LIMIT ${limit} OFFSET ${offset}
    `;

    const [rows] = await connection.execute(dataQuery, [...params, parseInt(pageSize), offset]);

    // Add row index for frontend
    const dataWithIndex = rows.map((row, index) => ({
      ...row,
      key: row.id
    }));

    connection.release();

    res.json({
      data: dataWithIndex,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });

  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get filter options for dropdowns
router.get('/filter-options', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [ipRoles] = await connection.execute('SELECT DISTINCT ip_role as value, ip_role as label FROM account_data ORDER BY ip_role');
    const [memberTypes] = await connection.execute('SELECT DISTINCT current_member_type as value, current_member_type as label FROM account_data ORDER BY current_member_type');
    const [memberPayments] = await connection.execute('SELECT DISTINCT member_payment as value, member_payment as label FROM account_data ORDER BY member_payment');
    const [fourGPlans] = await connection.execute('SELECT DISTINCT fourg_plan as value, fourg_plan as label FROM account_data ORDER BY fourg_plan');
    const [fourGPayments] = await connection.execute('SELECT DISTINCT fourg_payment as value, fourg_payment as label FROM account_data ORDER BY fourg_payment');

    connection.release();

    res.json({
      ipRoles,
      memberTypes,
      memberPayments,
      fourGPlans,
      fourGPayments
    });

  } catch (error) {
    console.error('Error fetching filter options:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 