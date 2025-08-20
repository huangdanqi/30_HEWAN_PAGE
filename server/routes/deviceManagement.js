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

// Bulk import devices from Excel file
router.post('/bulk-import', async (req, res) => {
  try {
    const { devices, deviceModel, productionBatch, manufacturer, creator } = req.body;
    
    if (!Array.isArray(devices) || devices.length === 0) {
      return res.status(400).json({ error: 'No devices data provided' });
    }
    
    if (!deviceModel || !productionBatch || !manufacturer || !creator) {
      return res.status(400).json({ error: 'Device model, production batch, manufacturer, and creator are required' });
    }
    
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      const results = [];
      for (const device of devices) {
        try {
          // Map Excel columns to database columns based on the image structure
          const deviceData = {
            device_id: device.deviceId || device['设备ID'] || '',
            bound_sub_account: device.boundSubAccount || device['绑定子账户'] || '-',
            device_model: deviceModel, // From form selection
            production_batch: productionBatch, // From form selection
            manufacturer: manufacturer, // From form selection
            initial_firmware: device.initialFirmware || device['初始烧录固件'] || `${deviceModel} V 1.0.1`,
            latest_firmware: device.latestFirmware || device['最新可更新固件'] || `${deviceModel} V 2.0.1`,
            current_firmware_version: device.currentFirmwareVersion || device['当前固件版本'] || `${deviceModel} V 1.3.0`,
            serial_number_code: device.serialNumberCode || device['SN码'] || '',
            chip_id: device.chipId || device['芯片ID'] || '',
            wifi_mac_address: device.wifiMacAddress || device['Wi-Fi MAC地址'] || '',
            bluetooth_mac_address: device.bluetoothMacAddress || device['蓝牙MAC地址'] || '',
            bluetooth_name: device.bluetoothName || device['蓝牙名称'] || '',
            cellular_network_id: device.cellularNetworkId || device['蜂窝网络识别码'] || '',
            four_g_card_number: device.fourGCardNumber || device['4G卡号'] || '',
            cpu_serial_number: device.cpuSerialNumber || device['CPU序列号'] || '',
            creator: creator
          };
          
          // Validate required fields
          if (!deviceData.device_id) {
            throw new Error(`Device ID is required for row ${results.length + 1}`);
          }
          
          // Check if device already exists
          const [existing] = await connection.execute(
            'SELECT id FROM device_management WHERE device_id = ?',
            [deviceData.device_id]
          );
          
          if (existing.length > 0) {
            // Update existing device
            await connection.execute(
              'UPDATE device_management SET bound_sub_account = ?, device_model = ?, production_batch = ?, manufacturer = ?, initial_firmware = ?, latest_firmware = ?, current_firmware_version = ?, serial_number_code = ?, chip_id = ?, wifi_mac_address = ?, bluetooth_mac_address = ?, bluetooth_name = ?, cellular_network_id = ?, four_g_card_number = ?, cpu_serial_number = ?, creator = ?, update_time = CURRENT_TIMESTAMP WHERE device_id = ?',
              [deviceData.bound_sub_account, deviceData.device_model, deviceData.production_batch, deviceData.manufacturer, deviceData.initial_firmware, deviceData.latest_firmware, deviceData.current_firmware_version, deviceData.serial_number_code, deviceData.chip_id, deviceData.wifi_mac_address, deviceData.bluetooth_mac_address, deviceData.bluetooth_name, deviceData.cellular_network_id, deviceData.four_g_card_number, deviceData.cpu_serial_number, deviceData.creator, deviceData.device_id]
            );
            results.push({ deviceId: deviceData.device_id, status: 'updated' });
          } else {
            // Insert new device
            await connection.execute(
              'INSERT INTO device_management (device_id, bound_sub_account, device_model, production_batch, manufacturer, initial_firmware, latest_firmware, current_firmware_version, serial_number_code, chip_id, wifi_mac_address, bluetooth_mac_address, bluetooth_name, cellular_network_id, four_g_card_number, cpu_serial_number, creator) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
              [deviceData.device_id, deviceData.bound_sub_account, deviceData.device_model, deviceData.production_batch, deviceData.manufacturer, deviceData.initial_firmware, deviceData.latest_firmware, deviceData.current_firmware_version, deviceData.serial_number_code, deviceData.chip_id, deviceData.wifi_mac_address, deviceData.bluetooth_mac_address, deviceData.bluetooth_name, deviceData.cellular_network_id, deviceData.four_g_card_number, deviceData.cpu_serial_number, deviceData.creator]
            );
            results.push({ deviceId: deviceData.device_id, status: 'created' });
          }
        } catch (deviceError) {
          results.push({ deviceId: device.deviceId || device['设备ID'] || 'Unknown', status: 'error', error: deviceError.message });
        }
      }
      
      await connection.commit();
      
      const successCount = results.filter(r => r.status === 'created' || r.status === 'updated').length;
      const errorCount = results.filter(r => r.status === 'error').length;
      
      res.json({
        message: `Bulk import completed. ${successCount} devices processed successfully, ${errorCount} errors.`,
        results,
        totalProcessed: devices.length,
        successCount,
        errorCount
      });
      
    } catch (transactionError) {
      await connection.rollback();
      throw transactionError;
    } finally {
      connection.release();
    }
    
  } catch (error) {
    console.error('Error in bulk import:', error);
    res.status(500).json({ error: 'Bulk import failed: ' + error.message });
  }
});

export default router; 