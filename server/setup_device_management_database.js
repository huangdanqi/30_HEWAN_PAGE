import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'h05010501',
  database: process.env.DB_NAME || 'page_test',
  charset: 'utf8mb4',
  supportBigNumbers: true,
  bigNumberStrings: true,
  dateStrings: true,
  timezone: '+00:00',
  connectionLimit: 10
});

async function setupDeviceManagementDatabase() {
  try {
    console.log('Setting up device management database tables...');
    
    // Create device_management table
    const createDeviceManagementTable = `
      CREATE TABLE IF NOT EXISTS device_management (
        id INT AUTO_INCREMENT PRIMARY KEY,
        device_id VARCHAR(100) NOT NULL COMMENT '设备ID',
        bound_sub_account VARCHAR(50) COMMENT '绑定子账户',
        device_model VARCHAR(50) NOT NULL COMMENT '设备型号',
        production_batch DATE NOT NULL COMMENT '生产批次',
        manufacturer VARCHAR(200) NOT NULL COMMENT '生产厂家',
        initial_firmware VARCHAR(100) COMMENT '初始烧录固件',
        latest_firmware VARCHAR(100) COMMENT '最新可更新固件',
        current_firmware_version VARCHAR(100) COMMENT '当前固件版本',
        serial_number_code VARCHAR(100) COMMENT 'SN码',
        chip_id VARCHAR(100) COMMENT '芯片ID',
        wifi_mac_address VARCHAR(50) COMMENT 'Wi-Fi MAC 地址',
        bluetooth_mac_address VARCHAR(50) COMMENT '蓝牙MAC地址',
        bluetooth_name VARCHAR(100) COMMENT '蓝牙名称',
        cellular_network_id VARCHAR(50) COMMENT '蜂窝网络识别码',
        four_g_card_number VARCHAR(50) COMMENT '4G卡号',
        cpu_serial_number VARCHAR(100) COMMENT 'CPU序列号',
        creator VARCHAR(50) DEFAULT '管理员' COMMENT '创建人',
        create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        
        UNIQUE KEY unique_device_id (device_id),
        INDEX idx_bound_sub_account (bound_sub_account),
        INDEX idx_device_model (device_model),
        INDEX idx_production_batch (production_batch),
        INDEX idx_manufacturer (manufacturer),
        INDEX idx_serial_number_code (serial_number_code),
        INDEX idx_chip_id (chip_id),
        INDEX idx_wifi_mac_address (wifi_mac_address),
        INDEX idx_bluetooth_mac_address (bluetooth_mac_address),
        INDEX idx_cellular_network_id (cellular_network_id),
        INDEX idx_four_g_card_number (four_g_card_number),
        INDEX idx_cpu_serial_number (cpu_serial_number),
        INDEX idx_create_time (create_time),
        INDEX idx_update_time (update_time)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='设备管理表'
    `;
    
    await pool.execute(createDeviceManagementTable);
    console.log('Device management table created successfully!');
    
    // Insert sample data
    const insertSampleData = `
      INSERT IGNORE INTO device_management (device_id, bound_sub_account, device_model, production_batch, manufacturer, initial_firmware, latest_firmware, current_firmware_version, serial_number_code, chip_id, wifi_mac_address, bluetooth_mac_address, bluetooth_name, cellular_network_id, four_g_card_number, cpu_serial_number, creator) VALUES
      ('0075A1B2SZTDS25061982X01', '183****7953', 'HW2001', '2025-06-30', '深圳天德胜科技有限公司', 'HW2001 V 1.0.1', 'HW2001 V 2.0.1', 'HW2001 V 1.3.0', 'SZTDS25061982X01', 'ESP32-0075A1B01', 'DC:54:75:62:01:70', 'DC:54:75:62:01:70', 'ZBMU 001 250619X01', '353801003000174', '14776294300136', '0xFFFFFF6B', '33'),
      ('0075A1B2SZTDS25061982X02', '-', 'HW2001', '2025-06-30', '深圳天德胜科技有限公司', 'HW2001 V 1.0.1', 'HW2001 V 2.0.1', 'HW2001 V 1.3.0', 'SZTDS25061982X02', 'ESP32-0075A1B02', 'DC:54:75:62:02:70', 'DC:54:75:62:02:70', 'ZBMU 001 250619X02', '353801003000274', '14776294300236', '0xFFFFFF6A', '33'),
      ('0075A1B2SZTDS25061982X03', '183****7953', 'HW2001', '2025-06-30', '深圳天德胜科技有限公司', 'HW2001 V 1.0.1', 'HW2001 V 2.0.1', 'HW2001 V 1.3.0', 'SZTDS25061982X03', 'ESP32-0075A1B03', 'DC:54:75:62:03:70', 'DC:54:75:62:03:70', 'ZBMU 001 250619X03', '353801003000374', '14776294300336', '0xFFFFFF69', '33'),
      ('0075A1B2SZTDS25061982X04', '-', 'HW2001', '2025-06-30', '深圳天德胜科技有限公司', 'HW2001 V 1.0.1', 'HW2001 V 2.0.1', 'HW2001 V 1.3.0', 'SZTDS25061982X04', 'ESP32-0075A1B04', 'DC:54:75:62:04:70', 'DC:54:75:62:04:70', 'ZBMU 001 250619X04', '353801003000474', '14776294300436', '0xFFFFFF68', '33'),
      ('0075A1B2SZTDS25061982X05', '183****7953', 'HW2001', '2025-06-30', '深圳天德胜科技有限公司', 'HW2001 V 1.0.1', 'HW2001 V 2.0.1', 'HW2001 V 1.3.0', 'SZTDS25061982X05', 'ESP32-0075A1B05', 'DC:54:75:62:05:70', 'DC:54:75:62:05:70', 'ZBMU 001 250619X05', '353801003000574', '14776294300536', '0xFFFFFF67', '33'),
      ('0075A1B2SZTDS25061982X06', '186****1234', 'HW2001', '2025-07-01', '深圳天德胜科技有限公司', 'HW2001 V 1.0.1', 'HW2001 V 2.0.1', 'HW2001 V 1.3.0', 'SZTDS25061982X06', 'ESP32-0075A1B06', 'DC:54:75:62:06:70', 'DC:54:75:62:06:70', 'ZBMU 001 250619X06', '353801003000674', '14776294300636', '0xFFFFFF66', '33'),
      ('0075A1B2SZTDS25061982X07', '-', 'HW2001', '2025-07-01', '深圳天德胜科技有限公司', 'HW2001 V 1.0.1', 'HW2001 V 2.0.1', 'HW2001 V 1.3.0', 'SZTDS25061982X07', 'ESP32-0075A1B07', 'DC:54:75:62:07:70', 'DC:54:75:62:07:70', 'ZBMU 001 250619X07', '353801003000774', '14776294300736', '0xFFFFFF65', '33'),
      ('0075A1B2SZTDS25061982X08', '139****5678', 'HW2001', '2025-07-01', '深圳天德胜科技有限公司', 'HW2001 V 1.0.1', 'HW2001 V 2.0.1', 'HW2001 V 1.3.0', 'SZTDS25061982X08', 'ESP32-0075A1B08', 'DC:54:75:62:08:70', 'DC:54:75:62:08:70', 'ZBMU 001 250619X08', '353801003000874', '14776294300836', '0xFFFFFF64', '33'),
      ('0075A1B2SZTDS25061982X09', '-', 'HW2001', '2025-07-01', '深圳天德胜科技有限公司', 'HW2001 V 1.0.1', 'HW2001 V 2.0.1', 'HW2001 V 1.3.0', 'SZTDS25061982X09', 'ESP32-0075A1B09', 'DC:54:75:62:09:70', 'DC:54:75:62:09:70', 'ZBMU 001 250619X09', '353801003000974', '14776294300936', '0xFFFFFF63', '33'),
      ('0075A1B2SZTDS25061982X10', '135****9012', 'HW2001', '2025-07-01', '深圳天德胜科技有限公司', 'HW2001 V 1.0.1', 'HW2001 V 2.0.1', 'HW2001 V 1.3.0', 'SZTDS25061982X10', 'ESP32-0075A1B10', 'DC:54:75:62:10:70', 'DC:54:75:62:10:70', 'ZBMU 001 250619X10', '353801003001074', '14776294301036', '0xFFFFFF62', '33'),
      ('0075A1B2SZTDS25061982X11', '-', 'HW2001', '2025-07-02', '深圳天德胜科技有限公司', 'HW2001 V 1.0.1', 'HW2001 V 2.0.1', 'HW2001 V 1.3.0', 'SZTDS25061982X11', 'ESP32-0075A1B11', 'DC:54:75:62:11:70', 'DC:54:75:62:11:70', 'ZBMU 001 250619X11', '353801003001174', '14776294301136', '0xFFFFFF61', '33'),
      ('0075A1B2SZTDS25061982X12', '188****3456', 'HW2001', '2025-07-02', '深圳天德胜科技有限公司', 'HW2001 V 1.0.1', 'HW2001 V 2.0.1', 'HW2001 V 1.3.0', 'SZTDS25061982X12', 'ESP32-0075A1B12', 'DC:54:75:62:12:70', 'DC:54:75:62:12:70', 'ZBMU 001 250619X12', '353801003001274', '14776294301236', '0xFFFFFF60', '33'),
      ('0075A1B2SZTDS25061982X13', '-', 'HW2001', '2025-07-02', '深圳天德胜科技有限公司', 'HW2001 V 1.0.1', 'HW2001 V 2.0.1', 'HW2001 V 1.3.0', 'SZTDS25061982X13', 'ESP32-0075A1B13', 'DC:54:75:62:13:70', 'DC:54:75:62:13:70', 'ZBMU 001 250619X13', '353801003001374', '14776294301336', '0xFFFFFF5F', '33'),
      ('0075A1B2SZTDS25061982X14', '177****7890', 'HW2001', '2025-07-02', '深圳天德胜科技有限公司', 'HW2001 V 1.0.1', 'HW2001 V 2.0.1', 'HW2001 V 1.3.0', 'SZTDS25061982X14', 'ESP32-0075A1B14', 'DC:54:75:62:14:70', 'DC:54:75:62:14:70', 'ZBMU 001 250619X14', '353801003001474', '14776294301436', '0xFFFFFF5E', '33'),
      ('0075A1B2SZTDS25061982X15', '-', 'HW2001', '2025-07-02', '深圳天德胜科技有限公司', 'HW2001 V 1.0.1', 'HW2001 V 2.0.1', 'HW2001 V 1.3.0', 'SZTDS25061982X15', 'ESP32-0075A1B15', 'DC:54:75:62:15:70', 'DC:54:75:62:15:70', 'ZBMU 001 250619X15', '353801003001574', '14776294301536', '0xFFFFFF5D', '33'),
      ('0075A1B2SZTDS25061982X16', '159****2345', 'HW2001', '2025-07-03', '深圳天德胜科技有限公司', 'HW2001 V 1.0.1', 'HW2001 V 2.0.1', 'HW2001 V 1.3.0', 'SZTDS25061982X16', 'ESP32-0075A1B16', 'DC:54:75:62:16:70', 'DC:54:75:62:16:70', 'ZBMU 001 250619X16', '353801003001674', '14776294301636', '0xFFFFFF5C', '33'),
      ('0075A1B2SZTDS25061982X17', '-', 'HW2001', '2025-07-03', '深圳天德胜科技有限公司', 'HW2001 V 1.0.1', 'HW2001 V 2.0.1', 'HW2001 V 1.3.0', 'SZTDS25061982X17', 'ESP32-0075A1B17', 'DC:54:75:62:17:70', 'DC:54:75:62:17:70', 'ZBMU 001 250619X17', '353801003001774', '14776294301736', '0xFFFFFF5B', '33'),
      ('0075A1B2SZTDS25061982X18', '138****6789', 'HW2001', '2025-07-03', '深圳天德胜科技有限公司', 'HW2001 V 1.0.1', 'HW2001 V 2.0.1', 'HW2001 V 1.3.0', 'SZTDS25061982X18', 'ESP32-0075A1B18', 'DC:54:75:62:18:70', 'DC:54:75:62:18:70', 'ZBMU 001 250619X18', '353801003001874', '14776294301836', '0xFFFFFF5A', '33'),
      ('0075A1B2SZTDS25061982X19', '-', 'HW2001', '2025-07-03', '深圳天德胜科技有限公司', 'HW2001 V 1.0.1', 'HW2001 V 2.0.1', 'HW2001 V 1.3.0', 'SZTDS25061982X19', 'ESP32-0075A1B19', 'DC:54:75:62:19:70', 'DC:54:75:62:19:70', 'ZBMU 001 250619X19', '353801003001974', '14776294301936', '0xFFFFFF59', '33'),
      ('0075A1B2SZTDS25061982X20', '136****0123', 'HW2001', '2025-07-03', '深圳天德胜科技有限公司', 'HW2001 V 1.0.1', 'HW2001 V 2.0.1', 'HW2001 V 1.3.0', 'SZTDS25061982X20', 'ESP32-0075A1B20', 'DC:54:75:62:20:70', 'DC:54:75:62:20:70', 'ZBMU 001 250619X20', '353801003002074', '14776294302036', '0xFFFFFF58', '33')
    `;
    
    await pool.execute(insertSampleData);
    console.log('Sample device management data inserted successfully!');
    
    console.log('Device management database setup completed successfully!');
  } catch (error) {
    console.error('Error setting up device management database:', error);
  } finally {
    await pool.end();
  }
}

setupDeviceManagementDatabase(); 