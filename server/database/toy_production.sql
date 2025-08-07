-- Toy Production Table
-- Based on ToyProduction.vue file content

CREATE TABLE IF NOT EXISTS toy_production (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id VARCHAR(50) NOT NULL COMMENT '产品ID',
  product_name VARCHAR(200) NOT NULL COMMENT '产品名称',
  production_batch DATE NOT NULL COMMENT '生产批次',
  manufacturer VARCHAR(200) NOT NULL COMMENT '生产厂家',
  unit_price DECIMAL(10,2) NOT NULL COMMENT '单价(元)',
  quantity INT NOT NULL COMMENT '数量(个)',
  total_price DECIMAL(12,2) GENERATED ALWAYS AS (unit_price * quantity) STORED COMMENT '总价(元)',
  creator VARCHAR(50) DEFAULT '管理员' COMMENT '创建人',
  create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  device_model VARCHAR(50) COMMENT '设备型号',
  product_type VARCHAR(50) COMMENT '产品类型',
  ip_name VARCHAR(100) COMMENT 'IP名称',
  
  INDEX idx_product_id (product_id),
  INDEX idx_product_name (product_name),
  INDEX idx_production_batch (production_batch),
  INDEX idx_manufacturer (manufacturer),
  INDEX idx_unit_price (unit_price),
  INDEX idx_quantity (quantity),
  INDEX idx_total_price (total_price),
  INDEX idx_creator (creator),
  INDEX idx_create_time (create_time),
  INDEX idx_update_time (update_time),
  INDEX idx_device_model (device_model),
  INDEX idx_product_type (product_type),
  INDEX idx_ip_name (ip_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='玩具生产表';

-- Insert sample data
INSERT INTO toy_production (product_id, product_name, production_batch, manufacturer, unit_price, quantity, creator, device_model, product_type, ip_name) VALUES
('HWSZ001001', '粉色碳碳富盒挂件', '2025-06-10', '扬州中韵工艺品有限公司', 25.80, 200, '33', 'A100', '益智', '迪士尼'),
('HWSZ001002', '蓝色小熊玩偶', '2025-06-11', '深圳乐高玩具厂', 30.50, 150, '44', 'B200', '毛绒', '漫威'),
('HWSZ001003', '绿色恐龙模型', '2025-06-12', '广州童趣玩具公司', 18.20, 300, '55', 'C300', '模型', '宝可梦'),
('HWSZ001004', '红色机器人玩具', '2025-06-13', '上海智能玩具厂', 45.00, 100, '33', 'A100', '益智', '迪士尼'),
('HWSZ001005', '黄色积木套装', '2025-06-14', '北京创意玩具公司', 35.60, 180, '44', 'B200', '益智', '漫威'),
('HWSZ001006', '紫色毛绒兔子', '2025-06-15', '杭州毛绒玩具厂', 28.90, 250, '55', 'C300', '毛绒', '宝可梦'),
('HWSZ001007', '橙色拼图玩具', '2025-06-16', '成都益智玩具公司', 22.40, 220, '33', 'A100', '益智', '迪士尼'),
('HWSZ001008', '白色遥控车', '2025-06-17', '深圳电子玩具厂', 55.00, 80, '44', 'B200', '电子', '漫威'),
('HWSZ001009', '黑色积木城堡', '2025-06-18', '广州建筑玩具公司', 42.30, 120, '55', 'C300', '益智', '宝可梦'),
('HWSZ001010', '彩虹色画笔套装', '2025-06-19', '上海美术用品厂', 15.80, 350, '33', 'A100', '美术', '迪士尼'),
('HWSZ001011', '银色音乐盒', '2025-06-20', '北京音乐玩具公司', 38.90, 90, '44', 'B200', '音乐', '漫威'),
('HWSZ001012', '金色魔法棒', '2025-06-21', '杭州魔法玩具厂', 32.60, 160, '55', 'C300', '角色扮演', '宝可梦'); 