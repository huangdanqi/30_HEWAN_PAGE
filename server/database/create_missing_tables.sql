-- Create missing tables for Vue components
-- This script creates all the tables needed for the updated Vue components

-- 1. Device Type Table
CREATE TABLE IF NOT EXISTS device_type (
  id INT AUTO_INCREMENT PRIMARY KEY,
  device_model_id VARCHAR(50) NOT NULL COMMENT '设备型号ID',
  device_model_name VARCHAR(100) NOT NULL COMMENT '设备型号名称',
  introduction TEXT COMMENT '介绍',
  enable_4g ENUM('是', '否') DEFAULT '是' COMMENT '是否开通4G',
  latest_firmware_version VARCHAR(100) COMMENT '最新可更新固件版本',
  updater VARCHAR(50) DEFAULT '管理员' COMMENT '更新人',
  create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  UNIQUE KEY unique_device_model_name (device_model_name),
  INDEX idx_device_model_id (device_model_id),
  INDEX idx_enable_4g (enable_4g),
  INDEX idx_create_time (create_time),
  INDEX idx_update_time (update_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='设备型号表';

-- 2. Firmware Table
CREATE TABLE IF NOT EXISTS firmware (
  id INT AUTO_INCREMENT PRIMARY KEY,
  device_model VARCHAR(50) NOT NULL COMMENT '设备型号',
  release_version VARCHAR(50) NOT NULL COMMENT '发布版本',
  version_number VARCHAR(100) NOT NULL COMMENT '版本号',
  description TEXT COMMENT '内容描述',
  creator VARCHAR(50) DEFAULT '管理员' COMMENT '创建人',
  release_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '发布时间',
  update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  UNIQUE KEY unique_version (device_model, version_number),
  INDEX idx_device_model (device_model),
  INDEX idx_release_version (release_version),
  INDEX idx_version_number (version_number),
  INDEX idx_release_time (release_time),
  INDEX idx_update_time (update_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='固件管理表';

-- 3. Device Production Table
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
  INDEX idx_create_time (create_time),
  INDEX idx_update_time (update_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='设备生产表';

-- 4. Device Management Table
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='设备管理表';

-- 5. Product Type Table
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='产品型号表';

-- 6. Product List Table
CREATE TABLE IF NOT EXISTS product_list (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id VARCHAR(50) NOT NULL COMMENT '商品ID',
  product_name VARCHAR(200) NOT NULL COMMENT '商品名称',
  product_code VARCHAR(50) NOT NULL COMMENT '产品ID',
  product_name2 VARCHAR(200) NOT NULL COMMENT '产品名称',
  product_type VARCHAR(50) NOT NULL COMMENT '产品类型',
  color VARCHAR(50) COMMENT '颜色',
  member_type VARCHAR(50) COMMENT '初始会员',
  device_id VARCHAR(100) COMMENT '设备ID',
  sub_account_id VARCHAR(50) COMMENT '子账户ID',
  activation_time TIMESTAMP COMMENT '激活时间',
  update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  UNIQUE KEY unique_product_id (product_id),
  INDEX idx_product_name (product_name),
  INDEX idx_product_code (product_code),
  INDEX idx_product_type (product_type),
  INDEX idx_color (color),
  INDEX idx_member_type (member_type),
  INDEX idx_device_id (device_id),
  INDEX idx_sub_account_id (sub_account_id),
  INDEX idx_activation_time (activation_time),
  INDEX idx_update_time (update_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品列表表';

-- Insert sample data for device_type
INSERT INTO device_type (device_model_id, device_model_name, introduction, enable_4g, latest_firmware_version, updater) VALUES
('hjhwn832nj2f', 'HWZ001', 'ESP32-S3芯片,自带Wi-Fi和蓝牙功能,加入4G模块,支持语音识别和语音合成', '是', 'Z001 V 1.0.0', '33'),
('hjhwn832nj2f', 'HWZ002', 'ESP32-S3芯片,自带Wi-Fi和蓝牙功能,加入4G模块,支持语音识别和语音合成,支持AI对话', '是', 'Z001 V 1.1.0', '33'),
('hjhwn832nj2f', 'HWZ003', 'ESP32-S3芯片,自带Wi-Fi和蓝牙功能,加入4G模块,支持语音识别和语音合成,支持AI对话,支持情感识别', '是', 'Z001 V 1.2.0', '33'),
('hjhwn832nj2f', 'HWZ004', 'ESP32-S3芯片,自带Wi-Fi和蓝牙功能,加入4G模块,支持语音识别和语音合成,支持AI对话,支持情感识别,支持多模态交互', '是', 'Z001 V 2.0.0', '33');

-- Insert sample data for firmware
INSERT INTO firmware (device_model, release_version, version_number, description, creator, release_time) VALUES
('HWSZ001', '主版本', 'Z001 V 1.0.0', 'desc', '张三', '2025-07-13 19:25:11'),
('HWSZ001', '主版本', 'Z001 V 2.0.0', 'desc', '张三', '2025-08-13 19:25:11'),
('HWSZ002', '主版本', 'Z002 V 1.0.0', 'desc', '李四', '2025-07-14 19:25:11'),
('HWSZ002', '主版本', 'Z002 V 2.0.0', 'desc', '李四', '2025-08-14 19:25:11'),
('HWSZ003', '主版本', 'Z003 V 1.0.0', 'desc', '王五', '2025-07-15 19:25:11'),
('HWSZ003', '主版本', 'Z003 V 2.0.0', 'desc', '王五', '2025-08-15 19:25:11'),
('HWSZ003', '主版本', 'Z003 V 3.0.0', 'desc', '王五', '2025-09-15 19:25:11');

-- Insert sample data for device_production
INSERT INTO device_production (production_device_id, device_model, production_batch, manufacturer, firmware_version, burn_firmware, unit_price, quantity) VALUES
('hjhwrn632q2f', 'HWZ001', '2025-06-30', '第一天德科技有限公司', '2001 V 1.0.0', '2001 V 1.0.0', 86.75, 500),
('hjhwrn632q2f', 'HWZ002', '2025-07-01', '深圳市华为技术有限公司', '2001 V 1.1.0', '2001 V 1.1.0', 87.75, 550),
('hjhwrn632q2f', 'HWZ003', '2025-07-02', '深圳市中兴通讯股份有限公司', '2001 V 1.2.0', '2001 V 1.2.0', 88.75, 600),
('hjhwrn632q2f', 'HWZ004', '2025-07-03', '深圳市大疆创新科技有限公司', '2001 V 2.0.0', '2001 V 2.0.0', 89.75, 650),
('hjhwrn632q2f', 'HWZ001', '2025-07-04', '第一天德科技有限公司', '2001 V 1.0.0', '2001 V 1.0.0', 90.75, 700),
('hjhwrn632q2f', 'HWZ002', '2025-07-05', '深圳市华为技术有限公司', '2001 V 1.1.0', '2001 V 1.1.0', 91.75, 750),
('hjhwrn632q2f', 'HWZ003', '2025-07-06', '深圳市中兴通讯股份有限公司', '2001 V 1.2.0', '2001 V 1.2.0', 92.75, 800),
('hjhwrn632q2f', 'HWZ004', '2025-07-07', '深圳市大疆创新科技有限公司', '2001 V 2.0.0', '2001 V 2.0.0', 93.75, 850);

-- Insert sample data for device_management
INSERT INTO device_management (device_id, bound_sub_account, device_model, production_batch, manufacturer, initial_firmware, latest_firmware, current_firmware_version, serial_number_code, chip_id, wifi_mac_address, bluetooth_mac_address, bluetooth_name, cellular_network_id, four_g_card_number, cpu_serial_number, creator) VALUES
('0075A1B2SZTDS25061982X01', '183****7953', 'HW2001', '2025-06-30', '深圳天德胜科技有限公司', 'HW2001 V 1.0.1', 'HW2001 V 2.0.1', 'HW2001 V 1.3.0', 'SZTDS25061982X01', 'ESP32-0075A1B01', 'DC:54:75:62:01:70', 'DC:54:75:62:01:70', 'ZBMU 001 250619X01', '353801003000174', '14776294300136', '0xFFFFFF6B', '33'),
('0075A1B2SZTDS25061982X02', '-', 'HW2001', '2025-06-30', '深圳天德胜科技有限公司', 'HW2001 V 1.0.1', 'HW2001 V 2.0.1', 'HW2001 V 1.3.0', 'SZTDS25061982X02', 'ESP32-0075A1B02', 'DC:54:75:62:02:70', 'DC:54:75:62:02:70', 'ZBMU 001 250619X02', '353801003000274', '14776294300236', '0xFFFFFF6A', '33'),
('0075A1B2SZTDS25061982X03', '183****7953', 'HW2001', '2025-06-30', '深圳天德胜科技有限公司', 'HW2001 V 1.0.1', 'HW2001 V 2.0.1', 'HW2001 V 1.3.0', 'SZTDS25061982X03', 'ESP32-0075A1B03', 'DC:54:75:62:03:70', 'DC:54:75:62:03:70', 'ZBMU 001 250619X03', '353801003000374', '14776294300336', '0xFFFFFF69', '33'),
('0075A1B2SZTDS25061982X04', '-', 'HW2001', '2025-06-30', '深圳天德胜科技有限公司', 'HW2001 V 1.0.1', 'HW2001 V 2.0.1', 'HW2001 V 1.3.0', 'SZTDS25061982X04', 'ESP32-0075A1B04', 'DC:54:75:62:04:70', 'DC:54:75:62:04:70', 'ZBMU 001 250619X04', '353801003000474', '14776294300436', '0xFFFFFF68', '33'),
('0075A1B2SZTDS25061982X05', '183****7953', 'HW2001', '2025-06-30', '深圳天德胜科技有限公司', 'HW2001 V 1.0.1', 'HW2001 V 2.0.1', 'HW2001 V 1.3.0', 'SZTDS25061982X05', 'ESP32-0075A1B05', 'DC:54:75:62:05:70', 'DC:54:75:62:05:70', 'ZBMU 001 250619X05', '353801003000574', '14776294300536', '0xFFFFFF67', '33');

-- Insert sample data for product_type
INSERT INTO product_type (product_id, product_model, product_name, product_type, color, product_details, device_model, ip_name, creator) VALUES
('hjhwn632ng21', 'HWSZ001001', '红色蝴蝶结蓝牙配件', '蓝牙配件', '荧光粉', '材料: 云南蝴蝶 颜色: 10号, 22号...', 'HWSZ001', '查看', '33'),
('hjhwn632ng22', 'HWSZ001002', '蓝色蝴蝶结蓝牙配件', '蓝牙配件', '天蓝色', '材料: 云南蝴蝶 颜色: 15号, 28号...', 'HWSZ001', '查看', '45'),
('hjhwn632ng23', 'HWSZ001003', '绿色蝴蝶结蓝牙配件', '蓝牙配件', '翠绿色', '材料: 云南蝴蝶 颜色: 12号, 25号...', 'HWSZ001', '查看', '28'),
('hjhwn632ng24', 'HWSZ001004', '紫色蝴蝶结蓝牙配件', '蓝牙配件', '深紫色', '材料: 云南蝴蝶 颜色: 18号, 30号...', 'HWSZ001', '查看', '52'),
('hjhwn632ng25', 'HWSZ001005', '橙色蝴蝶结蓝牙配件', '蓝牙配件', '亮橙色', '材料: 云南蝴蝶 颜色: 20号, 35号...', 'HWSZ001', '查看', '39'),
('hjhwn632ng26', 'HWSZ001006', '黄色蝴蝶结蓝牙配件', '蓝牙配件', '金黄色', '材料: 云南蝴蝶 颜色: 25号, 40号...', 'HWSZ001', '查看', '41'),
('hjhwn632ng27', 'HWSZ001007', '青色蝴蝶结蓝牙配件', '蓝牙配件', '浅青色', '材料: 云南蝴蝶 颜色: 30号, 45号...', 'HWSZ001', '查看', '36'),
('hjhwn632ng28', 'HWSZ001008', '粉色蝴蝶结蓝牙配件', '蓝牙配件', '淡粉色', '材料: 云南蝴蝶 颜色: 35号, 50号...', 'HWSZ001', '查看', '48'),
('hjhwn632ng29', 'HWSZ001009', '银色蝴蝶结蓝牙配件', '蓝牙配件', '银白色', '材料: 云南蝴蝶 颜色: 40号, 55号...', 'HWSZ001', '查看', '44'),
('hjhwn632ng30', 'HWSZ001010', '金色蝴蝶结蓝牙配件', '蓝牙配件', '纯金色', '材料: 云南蝴蝶 颜色: 45号, 60号...', 'HWSZ001', '查看', '37');

-- Insert sample data for product_list
INSERT INTO product_list (product_id, product_name, product_code, product_name2, product_type, color, member_type, device_id, sub_account_id, activation_time) VALUES
('A1', '粉色碳碳娃挂件富盒普通款', 'HWSZ001001', '粉色碳碳娃挂件富盒普通款', '普通挂件', '亮光粉', '普通会员', '0075A1B2SZTD5ZSD69I892XJUB', '183****7953', '2025-07-13 10:25:11'),
('A2', '蓝色小熊玩偶', 'HWSZ001002', '蓝色小熊玩偶', '毛绒玩具', '天蓝', 'VIP', '0075A1B2SZTD5ZSD69I892XJUC', '183****7963', '2025-07-14 11:25:12'),
('A3', '绿色恐龙模型', 'HWSZ001003', '绿色恐龙模型', '模型', '草绿', 'SVIP', '0075A1B2SZTD5ZSD69I892XJUD', '183****7973', '2025-07-15 12:25:13'),
('A1', '粉色碳碳娃挂件富盒普通款', 'HWSZ001001', '粉色碳碳娃挂件富盒普通款', '普通挂件', '亮光粉', '普通会员', '0075A1B2SZTD5ZSD69I892XJUE', '183****7983', '2025-07-16 13:25:14'),
('A2', '蓝色小熊玩偶', 'HWSZ001002', '蓝色小熊玩偶', '毛绒玩具', '天蓝', 'VIP', '0075A1B2SZTD5ZSD69I892XJUF', '183****7993', '2025-07-17 14:25:15'),
('A3', '绿色恐龙模型', 'HWSZ001003', '绿色恐龙模型', '模型', '草绿', 'SVIP', '0075A1B2SZTD5ZSD69I892XJUG', '183****8003', '2025-07-18 15:25:16'),
('A1', '粉色碳碳娃挂件富盒普通款', 'HWSZ001001', '粉色碳碳娃挂件富盒普通款', '普通挂件', '亮光粉', '普通会员', '0075A1B2SZTD5ZSD69I892XJUH', '183****8013', '2025-07-19 16:25:17'),
('A2', '蓝色小熊玩偶', 'HWSZ001002', '蓝色小熊玩偶', '毛绒玩具', '天蓝', 'VIP', '0075A1B2SZTD5ZSD69I892XJUI', '183****8023', '2025-07-20 17:25:18'),
('A3', '绿色恐龙模型', 'HWSZ001003', '绿色恐龙模型', '模型', '草绿', 'SVIP', '0075A1B2SZTD5ZSD69I892XJUJ', '183****8033', '2025-07-21 18:25:19'),
('A1', '粉色碳碳娃挂件富盒普通款', 'HWSZ001001', '粉色碳碳娃挂件富盒普通款', '普通挂件', '亮光粉', '普通会员', '0075A1B2SZTD5ZSD69I892XJUK', '183****8043', '2025-07-22 19:25:20');

-- Show all tables in the database
SHOW TABLES; 