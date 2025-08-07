-- Product Type Table
-- Based on ProductType.vue file content

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

-- Insert sample data
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