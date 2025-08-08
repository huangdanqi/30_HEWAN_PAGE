-- Create database
CREATE DATABASE IF NOT EXISTS page_test;
USE page_test;

-- Create table for Account data
CREATE TABLE IF NOT EXISTS account_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  member_id VARCHAR(255) NOT NULL COMMENT '主账户ID',
  phone_number VARCHAR(20) NOT NULL COMMENT '手机号',
  device_model VARCHAR(100) NOT NULL COMMENT '设备型号',
  device_id VARCHAR(255) NOT NULL COMMENT '设备ID',
  ip_role VARCHAR(100) NOT NULL COMMENT 'IP角色',
  product_id VARCHAR(100) NOT NULL COMMENT '产品ID',
  commodity_id VARCHAR(255) NOT NULL COMMENT '商品ID',
  voice_cloning_model_id VARCHAR(255) NOT NULL COMMENT '音色复刻模型ID',
  initial_activation_time DATETIME NOT NULL COMMENT '首次激活时间',
  current_member_type VARCHAR(50) NOT NULL COMMENT '当前会员类型',
  member_payment VARCHAR(50) NOT NULL COMMENT '会员付费',
  member_activation_time DATETIME NOT NULL COMMENT '会员激活时间',
  member_expiration_time DATETIME NOT NULL COMMENT '会员到期时间',
  fourg_card_number VARCHAR(50) NOT NULL COMMENT '4G卡号',
  fourg_plan VARCHAR(100) NOT NULL COMMENT '4G套餐',
  remaining_data_current_month VARCHAR(50) NOT NULL COMMENT '当月剩余流量',
  fourg_payment VARCHAR(50) NOT NULL COMMENT '4G付费',
  fourg_activation_time DATETIME NOT NULL COMMENT '4G激活时间',
  fourg_expiration_time DATETIME NOT NULL COMMENT '4G到期时间',
  annual_service_fee_balance DECIMAL(10,2) NOT NULL COMMENT '服务年费用盈余',
  asr_usage VARCHAR(100) NOT NULL COMMENT 'ASR用量',
  llm_usage VARCHAR(100) NOT NULL COMMENT 'LLM用量',
  tts_usage VARCHAR(100) NOT NULL COMMENT 'TTS用量',
  voice_clone_usage VARCHAR(100) NOT NULL COMMENT '音色克隆用量',
  registration_time DATETIME NOT NULL COMMENT '注册时间',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data
INSERT INTO account_data (
  member_id, phone_number, device_model, device_id, ip_role, product_id, commodity_id,
  voice_cloning_model_id, initial_activation_time, current_member_type, member_payment,
  member_activation_time, member_expiration_time, fourg_card_number, fourg_plan,
  remaining_data_current_month, fourg_payment, fourg_activation_time, fourg_expiration_time,
  annual_service_fee_balance, asr_usage, llm_usage, tts_usage, voice_clone_usage, registration_time
) VALUES
('jhg824&3*g0', '180****7950', 'HWZ001', 'D075415252TD250019252GJL', '王龙', 'HWZ001000', 'hjhwn832nj0', 'hjhwn832nj0', '2025-06-23 23:25:33', '普通会员', '自动续费', '2025-06-23 23:25:33', '2025-07-13 23:25:33', '147762943010', '500M/月', '20M', '赠送', '2025-06-23 23:25:33', '2025-07-13 23:25:33', 26.35, '384,3848 tokens', '384,3848 tokens', '213.55 h', '213.55 h', '2025-06-23 23:25:33'),
('jhg824&3*g1', '180****7951', 'HWZ002', 'D075415252TD250019252GJL', '张三', 'HWZ001001', 'hjhwn832nj1', 'hjhwn832nj1', '2025-06-24 00:25:34', 'VIP', '赠送', '2025-06-24 00:25:34', '2025-07-14 00:25:34', '147762943011', '600M/月', '21M', '停止续费', '2025-06-24 00:25:34', '2025-07-14 00:25:34', 27.35, '384,3848 tokens', '384,3848 tokens', '213.55 h', '213.55 h', '2025-06-24 00:25:34'),
('jhg824&3*g2', '180****7952', 'HWZ001', 'D075415252TD250019252GJL', '王龙', 'HWZ001002', 'hjhwn832nj2', 'hjhwn832nj2', '2025-06-25 01:25:35', 'SVIP', '停止续费', '2025-06-25 01:25:35', '2025-07-15 01:25:35', '147762943012', '700M/月', '22M', '未续购', '2025-06-25 01:25:35', '2025-07-15 01:25:35', 28.35, '384,3848 tokens', '384,3848 tokens', '213.55 h', '213.55 h', '2025-06-25 01:25:35'),
('jhg824&3*g3', '180****7953', 'HWZ002', 'D075415252TD250019252GJL', '张三', 'HWZ001000', 'hjhwn832nj3', 'hjhwn832nj3', '2025-06-26 02:25:36', '普通会员', '未续购', '2025-06-26 02:25:36', '2025-07-16 02:25:36', '147762943013', '500M/月', '23M', '自动续费', '2025-06-26 02:25:36', '2025-07-16 02:25:36', 29.35, '384,3848 tokens', '384,3848 tokens', '213.55 h', '213.55 h', '2025-06-26 02:25:36'),
('jhg824&3*g4', '180****7954', 'HWZ001', 'D075415252TD250019252GJL', '王龙', 'HWZ001001', 'hjhwn832nj4', 'hjhwn832nj4', '2025-06-27 03:25:37', 'VIP', '自动续费', '2025-06-27 03:25:37', '2025-07-17 03:25:37', '147762943014', '600M/月', '24M', '赠送', '2025-06-27 03:25:37', '2025-07-17 03:25:37', 30.35, '384,3848 tokens', '384,3848 tokens', '213.55 h', '213.55 h', '2025-06-27 03:25:37'),
('jhg824&3*g5', '180****7955', 'HWZ002', 'D075415252TD250019252GJL', '张三', 'HWZ001002', 'hjhwn832nj5', 'hjhwn832nj5', '2025-06-28 04:25:38', 'SVIP', '赠送', '2025-06-28 04:25:38', '2025-07-18 04:25:38', '147762943015', '700M/月', '25M', '停止续费', '2025-06-28 04:25:38', '2025-07-18 04:25:38', 31.35, '384,3848 tokens', '384,3848 tokens', '213.55 h', '213.55 h', '2025-06-28 04:25:38'),
('jhg824&3*g6', '180****7956', 'HWZ001', 'D075415252TD250019252GJL', '王龙', 'HWZ001000', 'hjhwn832nj6', 'hjhwn832nj6', '2025-06-29 05:25:39', '普通会员', '停止续费', '2025-06-29 05:25:39', '2025-07-19 05:25:39', '147762943016', '500M/月', '26M', '未续购', '2025-06-29 05:25:39', '2025-07-19 05:25:39', 32.35, '384,3848 tokens', '384,3848 tokens', '213.55 h', '213.55 h', '2025-06-29 05:25:39'),
('jhg824&3*g7', '180****7957', 'HWZ002', 'D075415252TD250019252GJL', '张三', 'HWZ001001', 'hjhwn832nj7', 'hjhwn832nj7', '2025-06-30 06:25:40', 'VIP', '未续购', '2025-06-30 06:25:40', '2025-07-20 06:25:40', '147762943017', '600M/月', '27M', '自动续费', '2025-06-30 06:25:40', '2025-07-20 06:25:40', 33.35, '384,3848 tokens', '384,3848 tokens', '213.55 h', '213.55 h', '2025-06-30 06:25:40'),
('jhg824&3*g8', '180****7958', 'HWZ001', 'D075415252TD250019252GJL', '王龙', 'HWZ001002', 'hjhwn832nj8', 'hjhwn832nj8', '2025-07-01 07:25:41', 'SVIP', '自动续费', '2025-07-01 07:25:41', '2025-07-21 07:25:41', '147762943018', '700M/月', '28M', '赠送', '2025-07-01 07:25:41', '2025-07-21 07:25:41', 34.35, '384,3848 tokens', '384,3848 tokens', '213.55 h', '213.55 h', '2025-07-01 07:25:41'),
('jhg824&3*g9', '180****7959', 'HWZ002', 'D075415252TD250019252GJL', '张三', 'HWZ001000', 'hjhwn832nj9', 'hjhwn832nj9', '2025-07-02 08:25:42', '普通会员', '赠送', '2025-07-02 08:25:42', '2025-07-22 08:25:42', '147762943019', '500M/月', '29M', '停止续费', '2025-07-02 08:25:42', '2025-07-22 08:25:42', 35.35, '384,3848 tokens', '384,3848 tokens', '213.55 h', '213.55 h', '2025-07-02 08:25:42'); 