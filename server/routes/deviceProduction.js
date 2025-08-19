import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Get all device production records
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;
    
    // Get total count
    const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM device_production');
    const total = countResult[0].total;
    
    // Get paginated data - use template literals to avoid parameter issues
    const [rows] = await pool.execute(
      `SELECT * FROM device_production ORDER BY create_time DESC LIMIT ${pageSize} OFFSET ${offset}`
    );
    
    // Transform snake_case to camelCase for frontend
    const transformedRows = rows.map(row => ({
      id: row.id,
      productionDeviceId: row.production_device_id,
      deviceModel: row.device_model,
      productionBatch: row.production_batch,
      manufacturer: row.manufacturer,
      firmwareVersion: row.firmware_version,
      burnFirmware: row.burn_firmware,
      unitPrice: parseFloat(row.unit_price),
      quantity: row.quantity,
      totalPrice: parseFloat(row.total_price),
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
    console.error('Error fetching device production records:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Get device production by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM device_production WHERE id = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Device production record not found' });
    }
    
    const row = rows[0];
    // Transform snake_case to camelCase for frontend
    const transformedRow = {
      id: row.id,
      productionDeviceId: row.production_device_id,
      deviceModel: row.device_model,
      productionBatch: row.production_batch,
      manufacturer: row.manufacturer,
      firmwareVersion: row.firmware_version,
      burnFirmware: row.burn_firmware,
      unitPrice: parseFloat(row.unit_price),
      quantity: row.quantity,
      totalPrice: parseFloat(row.total_price),
      updater: row.updater,
      createTime: row.create_time,
      updateTime: row.update_time
    };
    
    res.json(transformedRow);
  } catch (error) {
    console.error('Error fetching device production record:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new device production record
router.post('/', async (req, res) => {
  try {
    const {
      production_device_id,
      device_model,
      production_batch,
      manufacturer,
      firmware_version,
      burn_firmware,
      unit_price,
      quantity,
      updater
    } = req.body;

    // Validate required fields
    if (!device_model || !production_batch || !manufacturer || !unit_price || !quantity) {
      return res.status(400).json({ error: 'Device model, production batch, manufacturer, unit price, and quantity are required' });
    }

    const [result] = await pool.execute(
      'INSERT INTO device_production (production_device_id, device_model, production_batch, manufacturer, firmware_version, burn_firmware, unit_price, quantity) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [production_device_id, device_model, production_batch, manufacturer, firmware_version, burn_firmware, unit_price, quantity]
    );

    res.status(201).json({
      id: result.insertId,
      message: 'Device production record created successfully'
    });
  } catch (error) {
    console.error('Error creating device production record:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update device production record
router.put('/:id', async (req, res) => {
  try {
    const {
      production_device_id,
      device_model,
      production_batch,
      manufacturer,
      firmware_version,
      burn_firmware,
      unit_price,
      quantity,
      updater
    } = req.body;

    // Validate required fields
    if (!device_model || !production_batch || !manufacturer || !unit_price || !quantity) {
      return res.status(400).json({ error: 'Device model, production batch, manufacturer, unit price, and quantity are required' });
    }

    const [result] = await pool.execute(
      'UPDATE device_production SET production_device_id = ?, device_model = ?, production_batch = ?, manufacturer = ?, firmware_version = ?, burn_firmware = ?, unit_price = ?, quantity = ? WHERE id = ?',
      [production_device_id, device_model, production_batch, manufacturer, firmware_version, burn_firmware, unit_price, quantity, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Device production record not found' });
    }

    res.json({ message: 'Device production record updated successfully' });
  } catch (error) {
    console.error('Error updating device production record:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete device production record
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM device_production WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Device production record not found' });
    }

    res.json({ message: 'Device production record deleted successfully' });
  } catch (error) {
    console.error('Error deleting device production record:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get device production by device model
router.get('/device/:deviceModel', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM device_production WHERE device_model = ? ORDER BY create_time DESC',
      [req.params.deviceModel]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching device production by device model:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get device production by manufacturer
router.get('/manufacturer/:manufacturer', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM device_production WHERE manufacturer = ? ORDER BY create_time DESC',
      [req.params.manufacturer]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching device production by manufacturer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 