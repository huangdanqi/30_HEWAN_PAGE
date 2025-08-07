import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Tool Configuration API endpoints
router.get('/', async (req, res) => {
  try {
    console.log('Tool configuration endpoint called');
    const connection = await pool.getConnection();
    
    const {
      page = 1,
      pageSize = 10,
      search = '',
      sortBy = 'updatedAt',
      sortOrder = 'desc'
    } = req.query;

    // Convert 'descend' to 'desc' for SQL compatibility
    const sqlSortOrder = sortOrder === 'descend' ? 'desc' : sortOrder;

    let whereConditions = [];
    let params = [];

    // Search filter
    if (search) {
      whereConditions.push(`(
        toolId LIKE ? OR 
        toolType LIKE ? OR 
        toolName LIKE ? OR 
        apiAddress LIKE ? OR 
        localToolFilePath LIKE ?
      )`);
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam, searchParam);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Count total records
    const countQuery = `SELECT COUNT(*) as total FROM toolconfiguration ${whereClause}`;
    const [countResult] = await connection.execute(countQuery, params);
    const total = countResult[0].total;

    // Get paginated data
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);
    
    const dataQuery = `
      SELECT 
        id,
        toolId,
        toolType,
        toolName,
        apiAddress,
        localToolFilePath,
        DATE_FORMAT(purchaseTime, '%Y-%m-%d %H:%i:%s') as purchaseTime,
        DATE_FORMAT(activationTime, '%Y-%m-%d %H:%i:%s') as activationTime,
        DATE_FORMAT(expirationTime, '%Y-%m-%d %H:%i:%s') as expirationTime,
        accumulatedUsage,
        accumulatedCost,
        updater,
        DATE_FORMAT(createdAt, '%Y-%m-%d %H:%i:%s') as createdAt,
        DATE_FORMAT(updatedAt, '%Y-%m-%d %H:%i:%s') as updatedAt
      FROM toolconfiguration 
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
    console.error('Error fetching tool configuration data:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

router.post('/', async (req, res) => {
  try {
    console.log('Creating tool configuration:', req.body);
    const connection = await pool.getConnection();
    
    const {
      toolId,
      toolType,
      toolName,
      apiAddress,
      localToolFilePath,
      purchaseTime,
      activationTime,
      expirationTime,
      accumulatedUsage = 0,
      accumulatedCost = 0.00,
      updater
    } = req.body;

    const insertQuery = `
      INSERT INTO toolconfiguration (
        toolId, toolType, toolName, apiAddress, localToolFilePath,
        purchaseTime, activationTime, expirationTime,
        accumulatedUsage, accumulatedCost, updater
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const insertParams = [
      toolId,
      toolType,
      toolName,
      apiAddress,
      localToolFilePath,
      purchaseTime,
      activationTime,
      expirationTime,
      accumulatedUsage,
      accumulatedCost,
      updater
    ];

    const [result] = await connection.execute(insertQuery, insertParams);

    console.log('Tool configuration created successfully with ID:', result.insertId);
    connection.release();

    res.json({ 
      success: true, 
      message: 'Tool configuration created successfully',
      id: result.insertId
    });

  } catch (error) {
    console.error('Error creating tool configuration:', error);
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
    console.log('Updating tool configuration with ID:', id, req.body);
    
    const connection = await pool.getConnection();
    
    const {
      toolId,
      toolType,
      toolName,
      apiAddress,
      localToolFilePath,
      purchaseTime,
      activationTime,
      expirationTime,
      accumulatedUsage,
      accumulatedCost,
      updater
    } = req.body;

    const updateQuery = `
      UPDATE toolconfiguration SET
        toolId = ?,
        toolType = ?,
        toolName = ?,
        apiAddress = ?,
        localToolFilePath = ?,
        purchaseTime = ?,
        activationTime = ?,
        expirationTime = ?,
        accumulatedUsage = ?,
        accumulatedCost = ?,
        updater = ?
      WHERE id = ?
    `;

    const updateParams = [
      toolId,
      toolType,
      toolName,
      apiAddress,
      localToolFilePath,
      purchaseTime,
      activationTime,
      expirationTime,
      accumulatedUsage,
      accumulatedCost,
      updater,
      id
    ];

    const [result] = await connection.execute(updateQuery, updateParams);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Tool configuration not found' });
    }

    console.log('Tool configuration updated successfully');
    connection.release();

    res.json({ 
      success: true, 
      message: 'Tool configuration updated successfully'
    });

  } catch (error) {
    console.error('Error updating tool configuration:', error);
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
    console.log('Deleting tool configuration with ID:', id);
    
    const connection = await pool.getConnection();
    
    const [result] = await connection.execute(
      'DELETE FROM toolconfiguration WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Tool configuration not found' });
    }

    console.log('Tool configuration deleted successfully');
    connection.release();

    res.json({ 
      success: true, 
      message: 'Tool configuration deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting tool configuration:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

export default router; 