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

async function setupDeviceProductionDatabase() {
  try {
    console.log('Setting up device production database tables...');
    
    // Create device_production table
    const createDeviceProductionTable = `
      CREATE TABLE IF NOT EXISTS device_production (
        id INT AUTO_INCREMENT PRIMARY KEY,
        production_device_id VARCHAR(50) NOT NULL COMMENT '生产设备ID',
        device_model VARCHAR(50) NOT NULL COMMENT '设备型号',
        production_batch DATE NOT NULL COMMENT '生产批次',
        manufacturer VARCHAR(200) NOT NULL COMMENT '生产厂家',
        firmware_version VARCHAR(100) COMMENT '固件版本',
        burn_firmware VARCHAR(100) COMMENT '烧录固件',
        unit_price DECIMAL(10,2) NOT NULL COMMENT '单价 (元)',
        quantity INT NOT NULL COMMENT '数量 (个)',
        total_price DECIMAL(12,2) GENERATED ALWAYS AS (unit_price * quantity) STORED COMMENT '总价 (元)',
        updater VARCHAR(100) COMMENT '更新人',
        create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        
        INDEX idx_production_device_id (production_device_id),
        INDEX idx_device_model (device_model),
        INDEX idx_production_batch (production_batch),
        INDEX idx_manufacturer (manufacturer),
        INDEX idx_firmware_version (firmware_version),
        INDEX idx_unit_price (unit_price),
        INDEX idx_quantity (quantity),
        INDEX idx_total_price (total_price),
        INDEX idx_updater (updater),
        INDEX idx_create_time (create_time),
        INDEX idx_update_time (update_time)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='设备生产表'
    `;
    
    await pool.execute(createDeviceProductionTable);
    console.log('Device production table created successfully!');
    
    // Insert sample data
    const insertSampleData = `
      INSERT IGNORE INTO device_production (production_device_id, device_model, production_batch, manufacturer, firmware_version, burn_firmware, unit_price, quantity, updater) VALUES
      ('hjhwrn632q2f', 'HWZ001', '2025-06-30', '第一天德科技有限公司', '2001 V 1.0.0', '2001 V 1.0.0', 86.75, 500, 'admin'),
      ('hjhwrn632q2f', 'HWZ002', '2025-07-01', '深圳市华为技术有限公司', '2001 V 1.1.0', '2001 V 1.1.0', 87.75, 550, 'admin'),
      ('hjhwrn632q2f', 'HWZ003', '2025-07-02', '深圳市中兴通讯股份有限公司', '2001 V 1.2.0', '2001 V 1.2.0', 88.75, 600, 'admin'),
      ('hjhwrn632q2f', 'HWZ004', '2025-07-03', '深圳市大疆创新科技有限公司', '2001 V 2.0.0', '2001 V 2.0.0', 89.75, 650, 'admin'),
      ('hjhwrn632q2f', 'HWZ001', '2025-07-04', '第一天德科技有限公司', '2001 V 1.0.0', '2001 V 1.0.0', 90.75, 700, 'admin'),
      ('hjhwrn632q2f', 'HWZ002', '2025-07-05', '深圳市华为技术有限公司', '2001 V 1.1.0', '2001 V 1.1.0', 91.75, 750, 'admin'),
      ('hjhwrn632q2f', 'HWZ003', '2025-07-06', '深圳市中兴通讯股份有限公司', '2001 V 1.2.0', '2001 V 1.2.0', 92.75, 800, 'admin'),
      ('hjhwrn632q2f', 'HWZ004', '2025-07-07', '深圳市大疆创新科技有限公司', '2001 V 2.0.0', '2001 V 2.0.0', 93.75, 850, 'admin')
    `;
    
    await pool.execute(insertSampleData);
    console.log('Sample device production data inserted successfully!');
    
    console.log('Device production database setup completed successfully!');
  } catch (error) {
    console.error('Error setting up device production database:', error);
  } finally {
    await pool.end();
  }
}

setupDeviceProductionDatabase(); 