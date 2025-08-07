-- Toy Production Table (with hyphen)
-- New table for toy production management

CREATE TABLE IF NOT EXISTS `toy-production` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='玩具生产表(新)';

-- Insert 20 rows of sample data
INSERT INTO `toy-production` (product_id, product_name, production_batch, manufacturer, unit_price, quantity, creator, device_model, product_type, ip_name) VALUES
('TP001', '智能机器人玩具', '2025-01-15', '深圳智能玩具制造有限公司', 299.99, 150, '张三', 'SMART-001', '智能玩具', '机器人总动员'),
('TP002', '毛绒小熊玩偶', '2025-01-16', '杭州毛绒玩具厂', 89.50, 300, '李四', 'PLUSH-002', '毛绒玩具', '小熊维尼'),
('TP003', '积木拼装套装', '2025-01-17', '北京创意积木公司', 199.00, 200, '王五', 'BLOCK-003', '益智玩具', '乐高'),
('TP004', '遥控飞机模型', '2025-01-18', '广州航空模型厂', 599.99, 80, '赵六', 'RC-004', '遥控玩具', '航空模型'),
('TP005', '音乐盒玩具', '2025-01-19', '上海音乐玩具公司', 159.80, 120, '钱七', 'MUSIC-005', '音乐玩具', '音乐盒'),
('TP006', '拼图游戏套装', '2025-01-20', '成都益智游戏厂', 79.90, 250, '孙八', 'PUZZLE-006', '益智玩具', '拼图大师'),
('TP007', '电子宠物玩具', '2025-01-21', '深圳电子玩具厂', 129.99, 180, '周九', 'ELECTRONIC-007', '电子玩具', '电子宠物'),
('TP008', '角色扮演服装', '2025-01-22', '杭州服装玩具厂', 199.50, 100, '吴十', 'COSTUME-008', '角色扮演', '迪士尼公主'),
('TP009', '科学实验套装', '2025-01-23', '北京科学玩具公司', 299.00, 90, '郑十一', 'SCIENCE-009', '科学玩具', '科学实验室'),
('TP010', '绘画艺术套装', '2025-01-24', '上海艺术用品厂', 149.80, 200, '王十二', 'ART-010', '艺术玩具', '艺术大师'),
('TP011', '运动健身玩具', '2025-01-25', '广州运动玩具厂', 179.99, 150, '李十三', 'SPORT-011', '运动玩具', '运动达人'),
('TP012', '建筑模型套装', '2025-01-26', '深圳建筑模型厂', 399.00, 70, '张十四', 'ARCHITECT-012', '建筑模型', '建筑大师'),
('TP013', '汽车模型玩具', '2025-01-27', '杭州汽车模型厂', 259.50, 120, '陈十五', 'CAR-013', '汽车模型', '汽车总动员'),
('TP014', '恐龙化石模型', '2025-01-28', '北京古生物模型厂', 189.99, 100, '刘十六', 'DINOSAUR-014', '古生物模型', '侏罗纪公园'),
('TP015', '太空探索套装', '2025-01-29', '上海太空玩具公司', 349.00, 80, '黄十七', 'SPACE-015', '太空玩具', '星际穿越'),
('TP016', '海洋生物模型', '2025-01-30', '广州海洋模型厂', 229.80, 110, '周十八', 'OCEAN-016', '海洋模型', '海底总动员'),
('TP017', '农场动物套装', '2025-02-01', '成都农场玩具厂', 159.50, 180, '吴十九', 'FARM-017', '农场玩具', '农场物语'),
('TP018', '城市交通模型', '2025-02-02', '深圳交通模型厂', 279.99, 95, '郑二十', 'TRAFFIC-018', '交通模型', '城市交通'),
('TP019', '魔法城堡玩具', '2025-02-03', '杭州魔法玩具厂', 189.00, 130, '王二一', 'MAGIC-019', '魔法玩具', '魔法世界'),
('TP020', '未来科技套装', '2025-02-04', '北京科技玩具公司', 459.99, 60, '李二二', 'FUTURE-020', '科技玩具', '未来世界'); 