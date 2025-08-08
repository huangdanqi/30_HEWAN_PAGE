-- Test simple insertion with Chinese characters
USE page_test;

-- Set proper session variables
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET collation_connection = 'utf8mb4_unicode_ci';

-- Test with a simple record
INSERT INTO account_data (id, member_id, phone_number, device_model, device_id, ip_role, product_id, commodity_id, voice_cloning_model_id, initial_activation_time, current_member_type, member_payment, member_activation_time, member_expiration_time, fourg_card_number, fourg_plan, remaining_data_current_month, fourg_payment, fourg_activation_time, fourg_expiration_time, annual_service_fee_balance, asr_usage, llm_usage, tts_usage, voice_clone_usage) VALUES
(21, 'test123', '180****9999', 'TEST001', 'TESTDEVICE123', '普通用户', 'TEST001', 'test123', 'test123', '2025-06-23 23:25:53', '普通会员', '免费', '2025-06-23 23:25:53', '2026-06-23 23:25:53', '4G999', '基础套餐', '5GB', '免费', '2025-06-23 23:25:53', '2026-06-23 23:25:53', 0.00, '100次/月', '50次/月', '200次/月', '10次/月');

-- Check the inserted data
SELECT id, member_id, ip_role, HEX(ip_role) FROM account_data WHERE id = 21; 