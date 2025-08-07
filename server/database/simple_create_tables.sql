-- Simple script to create missing tables
-- Run this in your MySQL database

USE page_test;

-- 1. Device Type Table
CREATE TABLE IF NOT EXISTS device_type (
  id INT AUTO_INCREMENT PRIMARY KEY,
  device_model_id VARCHAR(50) NOT NULL,
  device_model_name VARCHAR(100) NOT NULL,
  introduction TEXT,
  enable_4g ENUM('是', '否') DEFAULT '是',
  latest_firmware_version VARCHAR(100),
  updater VARCHAR(50) DEFAULT '管理员',
  create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_device_model_name (device_model_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Firmware Table
CREATE TABLE IF NOT EXISTS firmware (
  id INT AUTO_INCREMENT PRIMARY KEY,
  device_model VARCHAR(50) NOT NULL,
  release_version VARCHAR(50) NOT NULL,
  version_number VARCHAR(100) NOT NULL,
  description TEXT,
  creator VARCHAR(50) DEFAULT '管理员',
  release_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_version (device_model, version_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Device Production Table
CREATE TABLE IF NOT EXISTS device_production (
  id INT AUTO_INCREMENT PRIMARY KEY,
  production_device_id VARCHAR(50) NOT NULL,
  device_model VARCHAR(50) NOT NULL,
  production_batch DATE NOT NULL,
  manufacturer VARCHAR(200) NOT NULL,
  firmware_version VARCHAR(100),
  burn_firmware VARCHAR(100),
  unit_price DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL,
  total_price DECIMAL(12,2) GENERATED ALWAYS AS (unit_price * quantity) STORED,
  create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Device Management Table
CREATE TABLE IF NOT EXISTS device_management (
  id INT AUTO_INCREMENT PRIMARY KEY,
  device_id VARCHAR(100) NOT NULL,
  bound_sub_account VARCHAR(50),
  device_model VARCHAR(50) NOT NULL,
  production_batch DATE NOT NULL,
  manufacturer VARCHAR(200) NOT NULL,
  initial_firmware VARCHAR(100),
  latest_firmware VARCHAR(100),
  current_firmware_version VARCHAR(100),
  serial_number_code VARCHAR(100),
  chip_id VARCHAR(100),
  wifi_mac_address VARCHAR(50),
  bluetooth_mac_address VARCHAR(50),
  bluetooth_name VARCHAR(100),
  cellular_network_id VARCHAR(50),
  four_g_card_number VARCHAR(50),
  cpu_serial_number VARCHAR(100),
  creator VARCHAR(50) DEFAULT '管理员',
  create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_device_id (device_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Product Type Table
CREATE TABLE IF NOT EXISTS product_type (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id VARCHAR(50) NOT NULL,
  product_model VARCHAR(50) NOT NULL,
  product_name VARCHAR(200) NOT NULL,
  product_type VARCHAR(50) NOT NULL,
  color VARCHAR(50),
  product_details TEXT,
  device_model VARCHAR(50) NOT NULL,
  ip_name VARCHAR(100),
  creator VARCHAR(50) DEFAULT '管理员',
  create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_product_id (product_id),
  UNIQUE KEY unique_product_model (product_model)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Product List Table
CREATE TABLE IF NOT EXISTS product_list (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id VARCHAR(50) NOT NULL,
  product_name VARCHAR(200) NOT NULL,
  product_code VARCHAR(50) NOT NULL,
  product_name2 VARCHAR(200) NOT NULL,
  product_type VARCHAR(50) NOT NULL,
  color VARCHAR(50),
  member_type VARCHAR(50),
  device_id VARCHAR(100),
  sub_account_id VARCHAR(50),
  activation_time TIMESTAMP,
  update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert sample data
INSERT INTO device_type (device_model_id, device_model_name, introduction, enable_4g, latest_firmware_version, updater) VALUES
('hjhwn832nj2f', 'HWZ001', 'ESP32-S3芯片,自带Wi-Fi和蓝牙功能,加入4G模块,支持语音识别和语音合成', '是', 'Z001 V 1.0.0', '33'),
('hjhwn832nj2f', 'HWZ002', 'ESP32-S3芯片,自带Wi-Fi和蓝牙功能,加入4G模块,支持语音识别和语音合成,支持AI对话', '是', 'Z001 V 1.1.0', '33'),
('hjhwn832nj2f', 'HWZ003', 'ESP32-S3芯片,自带Wi-Fi和蓝牙功能,加入4G模块,支持语音识别和语音合成,支持AI对话,支持情感识别', '是', 'Z001 V 1.2.0', '33'),
('hjhwn832nj2f', 'HWZ004', 'ESP32-S3芯片,自带Wi-Fi和蓝牙功能,加入4G模块,支持语音识别和语音合成,支持AI对话,支持情感识别,支持多模态交互', '是', 'Z001 V 2.0.0', '33');

INSERT INTO firmware (device_model, release_version, version_number, description, creator, release_time) VALUES
('HWSZ001', '主版本', 'Z001 V 1.0.0', 'desc', '张三', '2025-07-13 19:25:11'),
('HWSZ001', '主版本', 'Z001 V 2.0.0', 'desc', '张三', '2025-08-13 19:25:11'),
('HWSZ002', '主版本', 'Z002 V 1.0.0', 'desc', '李四', '2025-07-14 19:25:11'),
('HWSZ002', '主版本', 'Z002 V 2.0.0', 'desc', '李四', '2025-08-14 19:25:11'),
('HWSZ003', '主版本', 'Z003 V 1.0.0', 'desc', '王五', '2025-07-15 19:25:11'),
('HWSZ003', '主版本', 'Z003 V 2.0.0', 'desc', '王五', '2025-08-15 19:25:11'),
('HWSZ003', '主版本', 'Z003 V 3.0.0', 'desc', '王五', '2025-09-15 19:25:11');

INSERT INTO device_production (production_device_id, device_model, production_batch, manufacturer, firmware_version, burn_firmware, unit_price, quantity) VALUES
('hjhwrn632q2f', 'HWZ001', '2025-06-30', '第一天德科技有限公司', '2001 V 1.0.0', '2001 V 1.0.0', 86.75, 500),
('hjhwrn632q2f', 'HWZ002', '2025-07-01', '深圳市华为技术有限公司', '2001 V 1.1.0', '2001 V 1.1.0', 87.75, 550),
('hjhwrn632q2f', 'HWZ003', '2025-07-02', '深圳市中兴通讯股份有限公司', '2001 V 1.2.0', '2001 V 1.2.0', 88.75, 600),
('hjhwrn632q2f', 'HWZ004', '2025-07-03', '深圳市大疆创新科技有限公司', '2001 V 2.0.0', '2001 V 2.0.0', 89.75, 650);

INSERT INTO device_management (device_id, bound_sub_account, device_model, production_batch, manufacturer, initial_firmware, latest_firmware, current_firmware_version, serial_number_code, chip_id, wifi_mac_address, bluetooth_mac_address, bluetooth_name, cellular_network_id, four_g_card_number, cpu_serial_number, creator) VALUES
('0075A1B2SZTDS25061982X01', '183****7953', 'HW2001', '2025-06-30', '深圳天德胜科技有限公司', 'HW2001 V 1.0.1', 'HW2001 V 2.0.1', 'HW2001 V 1.3.0', 'SZTDS25061982X01', 'ESP32-0075A1B01', 'DC:54:75:62:01:70', 'DC:54:75:62:01:70', 'ZBMU 001 250619X01', '353801003000174', '14776294300136', '0xFFFFFF6B', '33'),
('0075A1B2SZTDS25061982X02', '-', 'HW2001', '2025-06-30', '深圳天德胜科技有限公司', 'HW2001 V 1.0.1', 'HW2001 V 2.0.1', 'HW2001 V 1.3.0', 'SZTDS25061982X02', 'ESP32-0075A1B02', 'DC:54:75:62:02:70', 'DC:54:75:62:02:70', 'ZBMU 001 250619X02', '353801003000274', '14776294300236', '0xFFFFFF6A', '33'),
('0075A1B2SZTDS25061982X03', '183****7953', 'HW2001', '2025-06-30', '深圳天德胜科技有限公司', 'HW2001 V 1.0.1', 'HW2001 V 2.0.1', 'HW2001 V 1.3.0', 'SZTDS25061982X03', 'ESP32-0075A1B03', 'DC:54:75:62:03:70', 'DC:54:75:62:03:70', 'ZBMU 001 250619X03', '353801003000374', '14776294300336', '0xFFFFFF69', '33');

INSERT INTO product_type (product_id, product_model, product_name, product_type, color, product_details, device_model, ip_name, creator) VALUES
('hjhwn632ng21', 'HWSZ001001', '红色蝴蝶结蓝牙配件', '蓝牙配件', '荧光粉', '材料: 云南蝴蝶 颜色: 10号, 22号...', 'HWSZ001', '查看', '33'),
('hjhwn632ng22', 'HWSZ001002', '蓝色蝴蝶结蓝牙配件', '蓝牙配件', '天蓝色', '材料: 云南蝴蝶 颜色: 15号, 28号...', 'HWSZ001', '查看', '45'),
('hjhwn632ng23', 'HWSZ001003', '绿色蝴蝶结蓝牙配件', '蓝牙配件', '翠绿色', '材料: 云南蝴蝶 颜色: 12号, 25号...', 'HWSZ001', '查看', '28');

INSERT INTO product_list (product_id, product_name, product_code, product_name2, product_type, color, member_type, device_id, sub_account_id, activation_time) VALUES
('A1', '粉色碳碳娃挂件富盒普通款', 'HWSZ001001', '粉色碳碳娃挂件富盒普通款', '普通挂件', '亮光粉', '普通会员', '0075A1B2SZTD5ZSD69I892XJUB', '183****7953', '2025-07-13 10:25:11'),
('A2', '蓝色小熊玩偶', 'HWSZ001002', '蓝色小熊玩偶', '毛绒玩具', '天蓝', 'VIP', '0075A1B2SZTD5ZSD69I892XJUC', '183****7963', '2025-07-14 11:25:12'),
('A3', '绿色恐龙模型', 'HWSZ001003', '绿色恐龙模型', '模型', '草绿', 'SVIP', '0075A1B2SZTD5ZSD69I892XJUD', '183****7973', '2025-07-15 12:25:13');

-- Show all tables
SHOW TABLES; 