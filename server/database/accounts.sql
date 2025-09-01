-- =====================================================
-- Accounts Route Database Operations
-- =====================================================

USE hewan_page_server;

-- =====================================================
-- Create accounts table if not exists
-- =====================================================
CREATE TABLE IF NOT EXISTS account_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    member_id VARCHAR(50) NOT NULL COMMENT '会员ID',
    phone_number VARCHAR(20) COMMENT '手机号码',
    device_model VARCHAR(100) COMMENT '设备型号',
    device_id VARCHAR(100) COMMENT '设备ID',
    ip_role VARCHAR(50) COMMENT 'IP角色',
    product_id VARCHAR(100) COMMENT '产品ID',
    commodity_id VARCHAR(100) COMMENT '商品ID',
    voice_cloning_model_id VARCHAR(100) COMMENT '语音克隆模型ID',
    initial_activation_time DATETIME COMMENT '初始激活时间',
    current_member_type VARCHAR(50) COMMENT '当前会员类型',
    member_payment DECIMAL(10,2) DEFAULT 0.00 COMMENT '会员支付金额',
    member_activation_time DATETIME COMMENT '会员激活时间',
    member_expiration_time DATETIME COMMENT '会员过期时间',
    fourg_card_number VARCHAR(50) COMMENT '4G卡号',
    fourg_plan VARCHAR(100) COMMENT '4G套餐',
    remaining_data_current_month DECIMAL(10,2) DEFAULT 0.00 COMMENT '当月剩余流量',
    fourg_payment DECIMAL(10,2) DEFAULT 0.00 COMMENT '4G支付金额',
    fourg_activation_time DATETIME COMMENT '4G激活时间',
    fourg_expiration_time DATETIME COMMENT '4G过期时间',
    annual_service_fee_balance DECIMAL(10,2) DEFAULT 0.00 COMMENT '年服务费余额',
    asr_usage DECIMAL(10,2) DEFAULT 0.00 COMMENT 'ASR使用量',
    llm_usage DECIMAL(10,2) DEFAULT 0.00 COMMENT 'LLM使用量',
    tts_usage DECIMAL(10,2) DEFAULT 0.00 COMMENT 'TTS使用量',
    voice_clone_usage DECIMAL(10,2) DEFAULT 0.00 COMMENT '语音克隆使用量',
    registration_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
    INDEX idx_member_id (member_id),
    INDEX idx_device_id (device_id),
    INDEX idx_product_id (product_id),
    INDEX idx_registration_time (registration_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='账户数据表';

-- =====================================================
-- Sample data for accounts
-- =====================================================
INSERT INTO account_data (
    member_id, phone_number, device_model, device_id, ip_role, product_id, commodity_id,
    voice_cloning_model_id, initial_activation_time, current_member_type, member_payment,
    member_activation_time, member_expiration_time, fourg_card_number, fourg_plan,
    remaining_data_current_month, fourg_payment, fourg_activation_time, fourg_expiration_time,
    annual_service_fee_balance, asr_usage, llm_usage, tts_usage, voice_clone_usage
) VALUES
('M001', '13800138001', 'HW-001', 'DEVICE_001', '小熊维尼', 'PROD_001', 'COMM_001', 'VOICE_001',
 '2024-01-15 10:30:00', 'VIP', 299.00, '2024-01-15 10:30:00', '2025-01-15 10:30:00',
 '4G_001', '无限流量套餐', 1024.00, 99.00, '2024-01-15 10:30:00', '2025-01-15 10:30:00',
 500.00, 100.50, 200.75, 150.25, 50.00),

('M002', '13800138002', 'HW-002', 'DEVICE_002', '米老鼠', 'PROD_002', 'COMM_002', 'VOICE_002',
 '2024-02-20 14:20:00', '标准', 199.00, '2024-02-20 14:20:00', '2025-02-20 14:20:00',
 '4G_002', '标准流量套餐', 512.00, 79.00, '2024-02-20 14:20:00', '2025-02-20 14:20:00',
 300.00, 80.25, 150.50, 100.75, 30.00),

('M003', '13800138003', 'HW-003', 'DEVICE_003', '唐老鸭', 'PROD_003', 'COMM_003', 'VOICE_003',
 '2024-03-10 09:15:00', 'VIP', 399.00, '2024-03-10 09:15:00', '2025-03-10 09:15:00',
 '4G_003', '无限流量套餐', 2048.00, 99.00, '2024-03-10 09:15:00', '2025-03-10 09:15:00',
 800.00, 200.00, 300.00, 250.00, 75.00);

-- =====================================================
-- Common queries for accounts route
-- =====================================================

-- Get all accounts with pagination
-- SELECT * FROM account_data ORDER BY registration_time DESC LIMIT 10 OFFSET 0;

-- Search accounts by member_id, phone_number, device_model, device_id, or ip_role
-- SELECT * FROM account_data WHERE member_id LIKE '%search%' OR phone_number LIKE '%search%' OR device_model LIKE '%search%' OR device_id LIKE '%search%' OR ip_role LIKE '%search%';

-- Get account by ID
-- SELECT * FROM account_data WHERE id = ?;

-- Update account
-- UPDATE account_data SET member_payment = ?, current_member_type = ?, update_time = CURRENT_TIMESTAMP WHERE id = ?;

-- Delete account
-- DELETE FROM account_data WHERE id = ?;
