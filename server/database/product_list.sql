-- =====================================================
-- Product List Route Database Operations
-- =====================================================

USE hewan_page_server;

-- =====================================================
-- Create product_list table if not exists
-- =====================================================
CREATE TABLE IF NOT EXISTS product_list (
    id INT AUTO_INCREMENT PRIMARY KEY,
    serial_number VARCHAR(100) NOT NULL COMMENT '序列号',
    product_id VARCHAR(100) NOT NULL COMMENT '产品ID',
    ip_role VARCHAR(50) COMMENT 'IP角色',
    product_model VARCHAR(100) NOT NULL COMMENT '产品型号',
    product_name VARCHAR(200) NOT NULL COMMENT '产品名称',
    product_type VARCHAR(100) NOT NULL COMMENT '产品类型',
    color VARCHAR(50) COMMENT '颜色',
    production_batch VARCHAR(100) NOT NULL COMMENT '生产批次',
    manufacturer VARCHAR(100) NOT NULL COMMENT '制造商',
    qr_code_file_directory VARCHAR(500) COMMENT '二维码文件目录',
    qr_code_exported ENUM('是', '否') DEFAULT '否' COMMENT '二维码是否已导出',
    barcode_file_directory VARCHAR(500) COMMENT '条形码文件目录',
    barcode_exported ENUM('是', '否') DEFAULT '否' COMMENT '条形码是否已导出',
    device_id VARCHAR(100) DEFAULT '' COMMENT '设备ID',
    sub_account_id VARCHAR(100) DEFAULT '' COMMENT '子账户ID',
    file_export_time VARCHAR(100) DEFAULT '' COMMENT '文件导出时间',
    first_binding_time VARCHAR(100) DEFAULT '' COMMENT '首次绑定时间',
    creator_id VARCHAR(100) NOT NULL COMMENT '创建者ID',
    creator_name VARCHAR(100) DEFAULT '管理员' COMMENT '创建者姓名',
    creation_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_product_id (product_id),
    INDEX idx_serial_number (serial_number),
    INDEX idx_device_id (device_id),
    INDEX idx_creation_time (creation_time),
    INDEX idx_update_time (update_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='产品列表表';

-- =====================================================
-- Sample data for product_list
-- =====================================================
INSERT INTO product_list (
    serial_number, product_id, ip_role, product_model, product_name, product_type, color,
    production_batch, manufacturer, qr_code_file_directory, qr_code_exported,
    barcode_file_directory, barcode_exported, device_id, sub_account_id,
    file_export_time, first_binding_time, creator_id, creator_name
) VALUES
('SN001', 'PROD_001', '小熊维尼', 'HW-001', '小熊维尼智能玩具', '智能玩具', '黄色',
 'BATCH_2024_001', 'HeWan制造', '/qr/SN001.png', '是', '/barcode/SN001.png', '是',
 'DEVICE_001', 'SUB_001', '2024-01-15 10:30:00', '2024-01-15 10:30:00', 'ADMIN_001', '管理员'),

('SN002', 'PROD_002', '米老鼠', 'HW-002', '米老鼠智能玩具', '智能玩具', '黑色',
 'BATCH_2024_002', 'HeWan制造', '/qr/SN002.png', '是', '/barcode/SN002.png', '是',
 'DEVICE_002', 'SUB_002', '2024-02-20 14:20:00', '2024-02-20 14:20:00', 'ADMIN_001', '管理员'),

('SN003', 'PROD_003', '唐老鸭', 'HW-003', '唐老鸭智能玩具', '智能玩具', '蓝色',
 'BATCH_2024_003', 'HeWan制造', '/qr/SN003.png', '是', '/barcode/SN003.png', '是',
 'DEVICE_003', 'SUB_003', '2024-03-10 09:15:00', '2024-03-10 09:15:00', 'ADMIN_001', '管理员');

-- =====================================================
-- Common queries for product_list route
-- =====================================================

-- Get all products with pagination
-- SELECT * FROM product_list ORDER BY update_time DESC LIMIT 10 OFFSET 0;

-- Get product by ID
-- SELECT * FROM product_list WHERE id = ?;

-- Get product by serial_number
-- SELECT * FROM product_list WHERE serial_number = ?;

-- Get product by product_id
-- SELECT * FROM product_list WHERE product_id = ?;

-- Search products by product_name, product_model, or ip_role
-- SELECT * FROM product_list WHERE product_name LIKE '%search%' OR product_model LIKE '%search%' OR ip_role LIKE '%search%';

-- Create new product
-- INSERT INTO product_list (serial_number, product_id, ip_role, product_model, product_name, product_type, color, production_batch, manufacturer, qr_code_file_directory, barcode_file_directory, creator_id, creator_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);

-- Update product
-- UPDATE product_list SET product_name = ?, product_type = ?, color = ?, update_time = CURRENT_TIMESTAMP WHERE id = ?;

-- Delete product
-- DELETE FROM product_list WHERE id = ?;

-- Update QR code export status
-- UPDATE product_list SET qr_code_exported = '是', file_export_time = NOW() WHERE id = ?;

-- Update barcode export status
-- UPDATE product_list SET barcode_exported = '是', file_export_time = NOW() WHERE id = ?;
