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

async function setupFirmwareDatabase() {
  try {
    console.log('Setting up firmware database tables...');
    
    // Create firmware table
    const createFirmwareTable = `
      CREATE TABLE IF NOT EXISTS firmware (
        id INT AUTO_INCREMENT PRIMARY KEY,
        device_model VARCHAR(50) NOT NULL COMMENT '设备型号',
        release_version VARCHAR(50) NOT NULL COMMENT '发布版本',
        version_number VARCHAR(100) NOT NULL COMMENT '版本号',
        description TEXT COMMENT '内容描述',
        file_address VARCHAR(500) COMMENT '文件地址',
        creator VARCHAR(50) DEFAULT '管理员' COMMENT '创建人',
        release_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '发布时间',
        update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        
        UNIQUE KEY unique_version (device_model, version_number),
        INDEX idx_device_model (device_model),
        INDEX idx_release_version (release_version),
        INDEX idx_version_number (version_number),
        INDEX idx_release_time (release_time),
        INDEX idx_update_time (update_time)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='固件管理表'
    `;
    
    await pool.execute(createFirmwareTable);
    console.log('Firmware table created successfully!');
    
    // Insert sample data
    const insertSampleData = `
      INSERT IGNORE INTO firmware (device_model, release_version, version_number, description, file_address, creator) VALUES
      ('HWSZ001', '主版本', 'Z001 V 1.0.0', 'ESP32-S3芯片固件，支持Wi-Fi和蓝牙功能，加入4G模块，支持语音识别和语音合成', '/firmware/hwsz001_v1.0.0.bin', '张三'),
      ('HWSZ001', '主版本', 'Z001 V 2.0.0', 'ESP32-S3芯片固件，支持Wi-Fi和蓝牙功能，加入4G模块，支持语音识别和语音合成，支持AI对话', '/firmware/hwsz001_v2.0.0.bin', '张三'),
      ('HWSZ002', '子版本', 'Z001 V 1.1.0', 'ESP32-S3芯片固件，支持Wi-Fi和蓝牙功能，加入4G模块，支持语音识别和语音合成，支持AI对话', '/firmware/hwsz002_v1.1.0.bin', '李四'),
      ('HWSZ002', '修订版', 'Z001 V 1.0.1', 'ESP32-S3芯片固件，修复已知问题，提升稳定性', '/firmware/hwsz002_v1.0.1.bin', '李四'),
      ('HWSZ003', '主版本', 'Z001 V 3.0.0', 'ESP32-S3芯片固件，支持Wi-Fi和蓝牙功能，加入4G模块，支持语音识别和语音合成，支持AI对话，支持情感识别', '/firmware/hwsz003_v3.0.0.bin', '王五'),
      ('HWSZ003', '子版本', 'Z001 V 2.1.0', 'ESP32-S3芯片固件，新增情感识别功能，优化AI对话体验', '/firmware/hwsz003_v2.1.0.bin', '王五'),
      ('HWSZ004', '主版本', 'Z001 V 4.0.0', 'ESP32-S3芯片固件，支持Wi-Fi和蓝牙功能，加入4G模块，支持语音识别和语音合成，支持AI对话，支持情感识别，支持多模态交互', '/firmware/hwsz004_v4.0.0.bin', '赵六')
    `;
    
    await pool.execute(insertSampleData);
    console.log('Sample firmware data inserted successfully!');
    
    console.log('Firmware database setup completed successfully!');
  } catch (error) {
    console.error('Error setting up firmware database:', error);
  } finally {
    await pool.end();
  }
}

setupFirmwareDatabase(); 