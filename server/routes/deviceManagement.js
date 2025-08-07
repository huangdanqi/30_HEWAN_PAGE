import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Get all device management records
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM device_management ORDER BY create_time DESC'
    );
    
    // Transform snake_case to camelCase for frontend
    const transformedRows = rows.map(row => ({
      id: row.id,
      deviceId: row.device_id,
      boundSubAccount: row.bound_sub_account,
      deviceModel: row.device_model,
      productionBatch: row.production_batch,
      manufacturer: row.manufacturer,
      initialFirmware: row.initial_firmware,
      latestFirmware: row.latest_firmware,
      currentFirmwareVersion: row.current_firmware_version,
      serialNumberCode: row.serial_number_code,
      chipId: row.chip_id,
      wifiMacAddress: row.wifi_mac_address,
      bluetoothMacAddress: row.bluetooth_mac_address,
      bluetoothName: row.bluetooth_name,
      cellularNetworkId: row.cellular_network_id,
      fourGCardNumber: row.four_g_card_number,
      cpuSerialNumber: row.cpu_serial_number,
      creator: row.creator,
      createTime: row.create_time,
      updateTime: row.update_time
    }));
    
    res.json(transformedRows);
  } catch (error) {
    console.error('Error fetching device management records:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get device management by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM device_management WHERE id = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Device management record not found' });
    }
    
    const row = rows[0];
    // Transform snake_case to camelCase for frontend
    const transformedRow = {
      id: row.id,
      deviceId: row.device_id,
      boundSubAccount: row.bound_sub_account,
      deviceModel: row.device_model,
      productionBatch: row.production_batch,
      manufacturer: row.manufacturer,
      initialFirmware: row.initial_firmware,
      latestFirmware: row.latest_firmware,
      currentFirmwareVersion: row.current_firmware_version,
      serialNumberCode: row.serial_number_code,
      chipId: row.chip_id,
      wifiMacAddress: row.wifi_mac_address,
      bluetoothMacAddress: row.bluetooth_mac_address,
      bluetoothName: row.bluetooth_name,
      cellularNetworkId: row.cellular_network_id,
      fourGCardNumber: row.four_g_card_number,
      cpuSerialNumber: row.cpu_serial_number,
      creator: row.creator,
      createTime: row.create_time,
      updateTime: row.update_time
    };
    
    res.json(transformedRow);
  } catch (error) {
    console.error('Error fetching device management record:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new device management record
router.post('/', async (req, res) => {
  try {
    const {
      device_id,
      bound_sub_account,
      device_model,
      production_batch,
      manufacturer,
      initial_firmware,
      latest_firmware,
      current_firmware_version,
      serial_number_code,
      chip_id,
      wifi_mac_address,
      bluetooth_mac_address,
      bluetooth_name,
      cellular_network_id,
      four_g_card_number,
      cpu_serial_number,
      creator
    } = req.body;

    // Validate required fields
    if (!device_id || !device_model || !production_batch || !manufacturer) {
      return res.status(400).json({ error: 'Device ID, device model, production batch, and manufacturer are required' });
    }

    const [result] = await pool.execute(
      'INSERT INTO device_management (device_id, bound_sub_account, device_model, production_batch, manufacturer, initial_firmware, latest_firmware, current_firmware_version, serial_number_code, chip_id, wifi_mac_address, bluetooth_mac_address, bluetooth_name, cellular_network_id, four_g_card_number, cpu_serial_number, creator) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [device_id, bound_sub_account, device_model, production_batch, manufacturer, initial_firmware, latest_firmware, current_firmware_version, serial_number_code, chip_id, wifi_mac_address, bluetooth_mac_address, bluetooth_name, cellular_network_id, four_g_card_number, cpu_serial_number, creator]
    );

    res.status(201).json({
      id: result.insertId,
      message: 'Device management record created successfully'
    });
  } catch (error) {
    console.error('Error creating device management record:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Device ID already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update device management record
router.put('/:id', async (req, res) => {
  try {
    const {
      device_id,
      bound_sub_account,
      device_model,
      production_batch,
      manufacturer,
      initial_firmware,
      latest_firmware,
      current_firmware_version,
      serial_number_code,
      chip_id,
      wifi_mac_address,
      bluetooth_mac_address,
      bluetooth_name,
      cellular_network_id,
      four_g_card_number,
      cpu_serial_number,
      creator
    } = req.body;

    // Validate required fields
    if (!device_id || !device_model || !production_batch || !manufacturer) {
      return res.status(400).json({ error: 'Device ID, device model, production batch, and manufacturer are required' });
    }

    const [result] = await pool.execute(
      'UPDATE device_management SET device_id = ?, bound_sub_account = ?, device_model = ?, production_batch = ?, manufacturer = ?, initial_firmware = ?, latest_firmware = ?, current_firmware_version = ?, serial_number_code = ?, chip_id = ?, wifi_mac_address = ?, bluetooth_mac_address = ?, bluetooth_name = ?, cellular_network_id = ?, four_g_card_number = ?, cpu_serial_number = ?, creator = ? WHERE id = ?',
      [device_id, bound_sub_account, device_model, production_batch, manufacturer, initial_firmware, latest_firmware, current_firmware_version, serial_number_code, chip_id, wifi_mac_address, bluetooth_mac_address, bluetooth_name, cellular_network_id, four_g_card_number, cpu_serial_number, creator, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Device management record not found' });
    }

    res.json({ message: 'Device management record updated successfully' });
  } catch (error) {
    console.error('Error updating device management record:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Device ID already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete device management record
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM device_management WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Device management record not found' });
    }

    res.json({ message: 'Device management record deleted successfully' });
  } catch (error) {
    console.error('Error deleting device management record:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get device management by device model
router.get('/device/:deviceModel', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM device_management WHERE device_model = ? ORDER BY create_time DESC',
      [req.params.deviceModel]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching device management by device model:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get device management by manufacturer
router.get('/manufacturer/:manufacturer', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM device_management WHERE manufacturer = ? ORDER BY create_time DESC',
      [req.params.manufacturer]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching device management by manufacturer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get device management by device ID
router.get('/device-id/:deviceId', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM device_management WHERE device_id = ?',
      [req.params.deviceId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Device not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching device management by device ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 