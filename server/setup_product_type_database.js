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

async function setupProductTypeDatabase() {
  try {
    console.log('Setting up product type database tables...');
    
    // Create product_type table
    const createProductTypeTable = `
      CREATE TABLE IF NOT EXISTS product_type (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id VARCHAR(50) NOT NULL COMMENT '产品ID',
        product_model VARCHAR(50) NOT NULL COMMENT '产品型号',
        product_name VARCHAR(200) NOT NULL COMMENT '产品名称',
        product_type VARCHAR(50) NOT NULL COMMENT '产品类型',
        color VARCHAR(50) COMMENT '颜色',
        product_details TEXT COMMENT '产品详情',
        device_model VARCHAR(50) NOT NULL COMMENT '设备型号',
        ip_name VARCHAR(100) COMMENT 'IP名称',
        creator VARCHAR(50) DEFAULT '管理员' COMMENT '创建人',
        create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        
        UNIQUE KEY unique_product_id (product_id),
        UNIQUE KEY unique_product_model (product_model),
        INDEX idx_product_name (product_name),
        INDEX idx_product_type (product_type),
        INDEX idx_device_model (device_model),
        INDEX idx_color (color),
        INDEX idx_creator (creator),
        INDEX idx_create_time (create_time),
        INDEX idx_update_time (update_time)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='产品型号表'
    `;
    
    await pool.execute(createProductTypeTable);
    console.log('Product type table created successfully!');
    
    // Insert sample data
    const insertSampleData = `
      INSERT IGNORE INTO product_type (product_id, product_model, product_name, product_type, color, product_details, device_model, ip_name, creator) VALUES
      ('hjhwn632ng21', 'HWSZ001001', '红色蝴蝶结蓝牙配件', '蓝牙配件', '荧光粉', '材料: 云南蝴蝶 颜色: 10号, 22号...', 'HWSZ001', '查看', '33'),
      ('hjhwn632ng22', 'HWSZ001002', '蓝色蝴蝶结蓝牙配件', '蓝牙配件', '天蓝色', '材料: 云南蝴蝶 颜色: 15号, 28号...', 'HWSZ001', '查看', '45'),
      ('hjhwn632ng23', 'HWSZ001003', '绿色蝴蝶结蓝牙配件', '蓝牙配件', '翠绿色', '材料: 云南蝴蝶 颜色: 12号, 25号...', 'HWSZ001', '查看', '28'),
      ('hjhwn632ng24', 'HWSZ002001', '智能玩具机器人', '智能玩具', '银白色', '智能对话机器人，支持语音交互', 'HWSZ002', '查看', '33'),
      ('hjhwn632ng25', 'HWSZ002002', '教育编程套件', '教育设备', '深蓝色', '编程教育套件，适合儿童学习', 'HWSZ002', '查看', '45'),
      ('hjhwn632ng26', 'HWSZ003001', '盲盒配件套装', '盲盒配件', '彩虹色', '盲盒配件套装，包含多种配件', 'HWSZ003', '查看', '28'),
      ('hjhwn632ng27', 'HWSZ003002', '智能音箱', '智能玩具', '黑色', '智能音箱，支持语音控制', 'HWSZ003', '查看', '33'),
      ('hjhwn632ng28', 'HWSZ004001', 'VR眼镜配件', '蓝牙配件', '透明色', 'VR眼镜配件，支持虚拟现实', 'HWSZ004', '查看', '45'),
      ('hjhwn632ng29', 'HWSZ004002', '智能手表', '智能玩具', '玫瑰金', '智能手表，支持健康监测', 'HWSZ004', '查看', '28'),
      ('hjhwn632ng30', 'HWSZ001004', '无线充电器', '蓝牙配件', '白色', '无线充电器，支持快速充电', 'HWSZ001', '查看', '33')
    `;
    
    await pool.execute(insertSampleData);
    console.log('Sample product type data inserted successfully!');
    
    console.log('Product type database setup completed successfully!');
  } catch (error) {
    console.error('Error setting up product type database:', error);
  } finally {
    await pool.end();
  }
}

setupProductTypeDatabase(); 