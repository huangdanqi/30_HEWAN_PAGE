-- New Toy Production Table Structure
-- Based on the MySQL image showing the toy_production table

CREATE TABLE IF NOT EXISTS `toy_production_new` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `production_batch_id` VARCHAR(50) NOT NULL COMMENT '生产批次ID',
  `product_model` VARCHAR(50) NOT NULL COMMENT '产品型号',
  `product_name` VARCHAR(200) NOT NULL COMMENT '产品名称',
  `production_batch_date` DATE NOT NULL COMMENT '生产批次日期',
  `manufacturer` VARCHAR(200) NOT NULL COMMENT '生产厂家',
  `unit_price` DECIMAL(10,2) NOT NULL COMMENT '单价(元)',
  `quantity` INT NOT NULL COMMENT '数量(个)',
  `total_price` DECIMAL(12,2) GENERATED ALWAYS AS (unit_price * quantity) STORED COMMENT '总价(元)',
  `updater_id` INT NOT NULL COMMENT '更新人ID',
  `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  INDEX idx_production_batch_id (production_batch_id),
  INDEX idx_product_model (product_model),
  INDEX idx_product_name (product_name),
  INDEX idx_production_batch_date (production_batch_date),
  INDEX idx_manufacturer (manufacturer),
  INDEX idx_unit_price (unit_price),
  INDEX idx_quantity (quantity),
  INDEX idx_total_price (total_price),
  INDEX idx_updater_id (updater_id),
  INDEX idx_create_time (create_time),
  INDEX idx_update_time (update_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='玩具生产表(新结构)';

-- Insert sample data based on the MySQL image
INSERT INTO `toy_production_new` (production_batch_id, product_model, product_name, production_batch_date, manufacturer, unit_price, quantity, updater_id) VALUES
('HWSZ001001_001', 'HWSZ001001', '粉色啵啵盲盒挂件', '2025-06-30', '扬州华中韵工艺品有限公司', 25.80, 200, 33),
('HWSZ001002_001', 'HWSZ001002', '蓝色小熊玩偶', '2025-06-30', '扬州华中韵工艺品有限公司', 30.50, 150, 44),
('HWSZ001003_001', 'HWSZ001003', '绿色恐龙模型', '2025-06-30', '扬州华中韵工艺品有限公司', 18.20, 300, 55),
('HWSZ002001_001', 'HWSZ002001', '智能玩具机器人', '2025-06-30', '扬州华中韵工艺品有限公司', 45.80, 150, 45),
('HWSZ002002_001', 'HWSZ002002', '遥控汽车玩具', '2025-06-30', '扬州华中韵工艺品有限公司', 35.60, 180, 33),
('HWSZ003001_001', 'HWSZ003001', '积木拼装套装', '2025-06-30', '扬州华中韵工艺品有限公司', 199.00, 200, 44),
('HWSZ004001_001', 'HWSZ004001', '毛绒玩具套装', '2025-06-30', '扬州华中韵工艺品有限公司', 89.50, 300, 55),
('HWSZ005001_001', 'HWSZ005001', '益智拼图玩具', '2025-06-30', '扬州华中韵工艺品有限公司', 79.90, 250, 33),
('HWSZ006001_001', 'HWSZ006001', '智能手表', '2025-07-01', '扬州华中韵工艺品有限公司', 85.80, 120, 40),
('HWSZ007001_001', 'HWSZ007001', '音乐盒玩具', '2025-07-01', '扬州华中韵工艺品有限公司', 159.80, 120, 45),
('HWSZ008001_001', 'HWSZ008001', '科学实验套装', '2025-07-02', '扬州华中韵工艺品有限公司', 299.00, 90, 33),
('HWSZ009001_001', 'HWSZ009001', '绘画艺术套装', '2025-07-02', '扬州华中韵工艺品有限公司', 149.80, 200, 44),
('HWSZ010001_001', 'HWSZ010001', '运动健身玩具', '2025-07-03', '扬州华中韵工艺品有限公司', 179.99, 150, 55),
('HWSZ011001_001', 'HWSZ011001', '建筑模型套装', '2025-07-03', '扬州华中韵工艺品有限公司', 399.00, 70, 33),
('HWSZ012001_001', 'HWSZ012001', '汽车模型玩具', '2025-07-04', '扬州华中韵工艺品有限公司', 259.50, 120, 44),
('HWSZ013001_001', 'HWSZ013001', '恐龙化石模型', '2025-07-04', '扬州华中韵工艺品有限公司', 189.99, 100, 55),
('HWSZ014001_001', 'HWSZ014001', '太空探索套装', '2025-07-05', '扬州华中韵工艺品有限公司', 349.00, 80, 33),
('HWSZ015001_001', 'HWSZ015001', '海洋生物模型', '2025-07-05', '扬州华中韵工艺品有限公司', 229.80, 110, 44),
('HWSZ016001_001', 'HWSZ016001', '运动玩具套装', '2025-07-06', '扬州华中韵工艺品有限公司', 58.80, 110, 38),
('HWSZ017001_001', 'HWSZ017001', '未来科技套装', '2025-07-06', '扬州华中韵工艺品有限公司', 459.99, 60, 33); 