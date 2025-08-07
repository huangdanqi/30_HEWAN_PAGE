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

async function addProductTypeData() {
  try {
    console.log('Adding 10 new rows to product_type table...');
    
    // Insert 10 new rows of sample data
    const insertNewData = `
      INSERT IGNORE INTO product_type (product_id, product_model, product_name, product_type, color, product_details, device_model, ip_name, creator) VALUES
      ('hjhwn632ng31', 'HWSZ001005', '粉色蓝牙耳机', '蓝牙配件', '粉色', '无线蓝牙耳机，支持降噪功能', 'HWSZ001', '查看', '33'),
      ('hjhwn632ng32', 'HWSZ002003', '智能摄像头', '智能玩具', '黑色', '智能摄像头，支持人脸识别', 'HWSZ002', '查看', '45'),
      ('hjhwn632ng33', 'HWSZ003003', '智能门锁', '智能玩具', '银色', '智能门锁，支持指纹识别', 'HWSZ003', '查看', '28'),
      ('hjhwn632ng34', 'HWSZ004003', '智能灯泡', '蓝牙配件', '白色', '智能灯泡，支持语音控制', 'HWSZ004', '查看', '33'),
      ('hjhwn632ng35', 'HWSZ001006', '无线充电板', '蓝牙配件', '深灰色', '无线充电板，支持快速充电', 'HWSZ001', '查看', '45'),
      ('hjhwn632ng36', 'HWSZ002004', '智能扫地机器人', '智能玩具', '白色', '智能扫地机器人，支持自动回充', 'HWSZ002', '查看', '28'),
      ('hjhwn632ng37', 'HWSZ003004', '智能窗帘', '智能玩具', '米色', '智能窗帘，支持定时开关', 'HWSZ003', '查看', '33'),
      ('hjhwn632ng38', 'HWSZ004004', '智能插座', '蓝牙配件', '黑色', '智能插座，支持远程控制', 'HWSZ004', '查看', '45'),
      ('hjhwn632ng39', 'HWSZ001007', '蓝牙音箱', '蓝牙配件', '蓝色', '便携式蓝牙音箱，音质清晰', 'HWSZ001', '查看', '28'),
      ('hjhwn632ng40', 'HWSZ002005', '智能空气净化器', '智能玩具', '白色', '智能空气净化器，支持PM2.5检测', 'HWSZ002', '查看', '33')
    `;
    
    const [result] = await pool.execute(insertNewData);
    console.log(`Successfully added ${result.affectedRows} new rows to product_type table!`);
    
    // Check total count
    const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM product_type');
    console.log(`Total product_type records: ${countResult[0].total}`);
    
  } catch (error) {
    console.error('Error adding product type data:', error);
  } finally {
    await pool.end();
  }
}

addProductTypeData(); 