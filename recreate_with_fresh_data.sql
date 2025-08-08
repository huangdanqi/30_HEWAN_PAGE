-- Recreate table with fresh, properly encoded Chinese data
USE page_test;

-- Drop and recreate the table
DROP TABLE IF EXISTS account_data;

CREATE TABLE account_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    member_id VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    phone_number VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    device_model VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    device_id VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    ip_role VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    product_id VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    commodity_id VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    voice_cloning_model_id VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    initial_activation_time DATETIME,
    current_member_type VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    member_payment VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    registration_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fourg_plan VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    remaining_data_current_month VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    fourg_payment VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    asr_usage VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    llm_usage VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    tts_usage VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    voice_clone_usage VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Set session variables
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET collation_connection = 'utf8mb4_unicode_ci';

-- Insert fresh data with proper Chinese characters
INSERT INTO account_data (member_id, phone_number, device_model, device_id, ip_role, product_id, commodity_id, voice_cloning_model_id, initial_activation_time, current_member_type, member_payment, fourg_plan, remaining_data_current_month, fourg_payment, asr_usage, llm_usage, tts_usage, voice_clone_usage) VALUES
('jhg824&3*g0', '180****7950', 'HWZ001', 'D075415252TD250019252GJL', '普通用户', 'HWZ001000', 'hjhwn832nj0', 'hjhwn832nj0', '2025-06-23 23:25:33', '普通会员', '免费', '基础套餐', '5GB', '免费', '100次/月', '50次/月', '200次/月', '10次/月'),
('jhg824&3*g1', '180****7951', 'HWZ002', 'D075415252TD250019252GJL', 'VIP用户', 'HWZ001001', 'hjhwn832nj1', 'hjhwn832nj1', '2025-06-23 23:25:34', 'VIP会员', '月付', 'VIP套餐', '10GB', '月付', '500次/月', '200次/月', '1000次/月', '50次/月'),
('jhg824&3*g2', '180****7952', 'HWZ003', 'D075415252TD250019252GJL', 'SVIP用户', 'HWZ001002', 'hjhwn832nj2', 'hjhwn832nj2', '2025-06-23 23:25:35', 'SVIP会员', '年付', 'SVIP套餐', '20GB', '年付', '1000次/月', '500次/月', '2000次/月', '100次/月'),
('jhg824&3*g3', '180****7953', 'HWZ004', 'D075415252TD250019252GJL', '管理员', 'HWZ001003', 'hjhwn832nj3', 'hjhwn832nj3', '2025-06-23 23:25:36', '高级会员', '终身会员', '管理员套餐', '50GB', '终身', '无限制', '无限制', '无限制', '无限制'),
('jhg824&3*g4', '180****7954', 'HWZ005', 'D075415252TD250019252GJL', '超级管理员', 'HWZ001004', 'hjhwn832nj4', 'hjhwn832nj4', '2025-06-23 23:25:37', 'SVIP会员', '终身会员', '超级管理员套餐', '100GB', '终身', '无限制', '无限制', '无限制', '无限制'),
('jhg824&3*g5', '180****7955', 'HWZ006', 'D075415252TD250019252GJL', '普通用户', 'HWZ001005', 'hjhwn832nj5', 'hjhwn832nj5', '2025-06-23 23:25:38', '普通会员', '免费', '基础套餐', '5GB', '免费', '100次/月', '50次/月', '200次/月', '10次/月'),
('jhg824&3*g6', '180****7956', 'HWZ007', 'D075415252TD250019252GJL', 'VIP用户', 'HWZ001006', 'hjhwn832nj6', 'hjhwn832nj6', '2025-06-23 23:25:39', 'VIP会员', '月付', 'VIP套餐', '10GB', '月付', '500次/月', '200次/月', '1000次/月', '50次/月'),
('jhg824&3*g7', '180****7957', 'HWZ008', 'D075415252TD250019252GJL', 'SVIP用户', 'HWZ001007', 'hjhwn832nj7', 'hjhwn832nj7', '2025-06-23 23:25:40', 'SVIP会员', '年付', 'SVIP套餐', '20GB', '年付', '1000次/月', '500次/月', '2000次/月', '100次/月'),
('jhg824&3*g8', '180****7958', 'HWZ009', 'D075415252TD250019252GJL', '管理员', 'HWZ001008', 'hjhwn832nj8', 'hjhwn832nj8', '2025-06-23 23:25:41', '高级会员', '终身会员', '管理员套餐', '50GB', '终身', '无限制', '无限制', '无限制', '无限制'),
('jhg824&3*g9', '180****7959', 'HWZ010', 'D075415252TD250019252GJL', '超级管理员', 'HWZ001009', 'hjhwn832nj9', 'hjhwn832nj9', '2025-06-23 23:25:42', 'SVIP会员', '终身会员', '超级管理员套餐', '100GB', '终身', '无限制', '无限制', '无限制', '无限制');

-- Verify the results
SELECT 
    id,
    member_id,
    ip_role,
    current_member_type,
    member_payment
FROM account_data 
ORDER BY id;

-- Show hex values to confirm proper encoding
SELECT 
    id,
    ip_role,
    HEX(ip_role) as ip_role_hex,
    current_member_type,
    HEX(current_member_type) as member_type_hex,
    member_payment,
    HEX(member_payment) as payment_hex
FROM account_data 
LIMIT 5; 