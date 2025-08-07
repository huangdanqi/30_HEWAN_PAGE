import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Get all device types
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;
    
    // Get total count
    const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM device_type');
    const total = countResult[0].total;
    
    // Get paginated data - use a simpler approach
    const [rows] = await pool.execute(
      `SELECT * FROM device_type ORDER BY create_time DESC LIMIT ${pageSize} OFFSET ${offset}`
    );
    
    // Transform snake_case to camelCase for frontend compatibility
    const transformedRows = rows.map(row => ({
      id: row.id,
      deviceModelId: row.device_model_id,
      deviceModelName: row.device_model_name,
      introduction: row.introduction,
      enable4G: row.enable_4g,
      latestFirmwareVersion: row.latest_firmware_version,
      updater: row.updater,
      createTime: row.create_time,
      updateTime: row.update_time
    }));
    
    res.json({
      data: transformedRows,
      pagination: {
        current: page,
        pageSize: pageSize,
        total: total
      }
    });
  } catch (error) {
    console.error('Error fetching device types:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Get device type by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM device_type WHERE id = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Device type not found' });
    }
    
    const row = rows[0];
    // Transform snake_case to camelCase for frontend compatibility
    const transformedRow = {
      id: row.id,
      deviceModelId: row.device_model_id,
      deviceModelName: row.device_model_name,
      introduction: row.introduction,
      enable4G: row.enable_4g,
      latestFirmwareVersion: row.latest_firmware_version,
      updater: row.updater,
      createTime: row.create_time,
      updateTime: row.update_time
    };
    
    res.json(transformedRow);
  } catch (error) {
    console.error('Error fetching device type:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new device type
router.post('/', async (req, res) => {
  try {
    const {
      deviceModelId,
      deviceModelName,
      introduction,
      enable4G,
      latestFirmwareVersion,
      updater
    } = req.body;

    // Validate required fields
    if (!deviceModelName) {
      return res.status(400).json({ error: 'Device model name is required' });
    }

    const [result] = await pool.execute(
      'INSERT INTO device_type (device_model_id, device_model_name, introduction, enable_4g, latest_firmware_version, updater) VALUES (?, ?, ?, ?, ?, ?)',
      [deviceModelId, deviceModelName, introduction, enable4G, latestFirmwareVersion, updater]
    );

    res.status(201).json({
      id: result.insertId,
      message: 'Device type created successfully'
    });
  } catch (error) {
    console.error('Error creating device type:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Device model name already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update device type
router.put('/:id', async (req, res) => {
  try {
    const {
      deviceModelId,
      deviceModelName,
      introduction,
      enable4G,
      latestFirmwareVersion,
      updater
    } = req.body;

    // Validate required fields
    if (!deviceModelName) {
      return res.status(400).json({ error: 'Device model name is required' });
    }

    const [result] = await pool.execute(
      'UPDATE device_type SET device_model_id = ?, device_model_name = ?, introduction = ?, enable_4g = ?, latest_firmware_version = ?, updater = ? WHERE id = ?',
      [deviceModelId, deviceModelName, introduction, enable4G, latestFirmwareVersion, updater, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Device type not found' });
    }

    res.json({ message: 'Device type updated successfully' });
  } catch (error) {
    console.error('Error updating device type:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Device model name already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete device type
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM device_type WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Device type not found' });
    }

    res.json({ message: 'Device type deleted successfully' });
  } catch (error) {
    console.error('Error deleting device type:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 