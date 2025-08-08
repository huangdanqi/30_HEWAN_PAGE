-- Insert only missing records 19 and 20
USE page_test;

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET collation_connection = 'utf8mb4_unicode_ci';

-- Insert missing records 19 and 20
INSERT INTO account_data (id, member_id, phone_number, device_model, device_id, ip_role, product_id, commodity_id, voice_cloning_model_id, initial_activation_time, current_member_type, member_payment, member_activation_time, member_expiration_time, fourg_card_number, fourg_plan, remaining_data_current_month, fourg_payment, fourg_activation_time, fourg_expiration_time, annual_service_fee_balance, asr_usage, llm_usage, tts_usage, voice_clone_usage) VALUES
(19, 'jhg824&3*g18', '180****7968', 'HWZ019', 'D075415252TD250019252GJL', '管理员', 'HWZ001018', 'hjhwn832nj18', 'hjhwn832nj18', '2025-06-23 23:25:51', '高级会员', '终身会员', '2025-06-23 23:25:51', '2099-12-31 23:59:59', '4G019', '管理员套餐', '50GB', '终身', '2025-06-23 23:25:51', '2099-12-31 23:59:59', 999.00, '无限制', '无限制', '无限制', '无限制'),
(20, 'jhg824&3*g19', '180****7969', 'HWZ020', 'D075415252TD250019252GJL', '超级管理员', 'HWZ001019', 'hjhwn832nj19', 'hjhwn832nj19', '2025-06-23 23:25:52', 'SVIP会员', '终身会员', '2025-06-23 23:25:52', '2099-12-31 23:59:59', '4G020', '超级管理员套餐', '100GB', '终身', '2025-06-23 23:25:52', '2099-12-31 23:59:59', 1999.00, '无限制', '无限制', '无限制', '无限制');

-- Verify all records
SELECT COUNT(*) as total FROM account_data;
SELECT id, member_id, ip_role FROM account_data ORDER BY id; 