-- Fix missing data by recreating table with all 20 records
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
    member_activation_time DATETIME,
    member_expiration_time DATETIME,
    fourg_card_number VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    fourg_plan VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    remaining_data_current_month VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    fourg_payment VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    fourg_activation_time DATETIME,
    fourg_expiration_time DATETIME,
    annual_service_fee_balance DECIMAL(10,2),
    asr_usage VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    llm_usage VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    tts_usage VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    voice_clone_usage VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    registration_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Set session variables for proper encoding
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET collation_connection = 'utf8mb4_unicode_ci';

-- Insert all 20 records with proper Chinese characters
INSERT INTO account_data (id, member_id, phone_number, device_model, device_id, ip_role, product_id, commodity_id, voice_cloning_model_id, initial_activation_time, current_member_type, member_payment, member_activation_time, member_expiration_time, fourg_card_number, fourg_plan, remaining_data_current_month, fourg_payment, fourg_activation_time, fourg_expiration_time, annual_service_fee_balance, asr_usage, llm_usage, tts_usage, voice_clone_usage) VALUES
(1, 'jhg824&3*g0', '180****7950', 'HWZ001', 'D075415252TD250019252GJL', '普通用户', 'HWZ001000', 'hjhwn832nj0', 'hjhwn832nj0', '2025-06-23 23:25:33', '普通会员', '免费', '2025-06-23 23:25:33', '2026-06-23 23:25:33', '4G001', '基础套餐', '5GB', '免费', '2025-06-23 23:25:33', '2026-06-23 23:25:33', 0.00, '100次/月', '50次/月', '200次/月', '10次/月'),
(2, 'jhg824&3*g1', '180****7951', 'HWZ002', 'D075415252TD250019252GJL', 'VIP用户', 'HWZ001001', 'hjhwn832nj1', 'hjhwn832nj1', '2025-06-23 23:25:34', 'VIP会员', '月付', '2025-06-23 23:25:34', '2026-06-23 23:25:34', '4G002', 'VIP套餐', '10GB', '月付', '2025-06-23 23:25:34', '2026-06-23 23:25:34', 99.00, '500次/月', '200次/月', '1000次/月', '50次/月'),
(3, 'jhg824&3*g2', '180****7952', 'HWZ003', 'D075415252TD250019252GJL', 'SVIP用户', 'HWZ001002', 'hjhwn832nj2', 'hjhwn832nj2', '2025-06-23 23:25:35', 'SVIP会员', '年付', '2025-06-23 23:25:35', '2026-06-23 23:25:35', '4G003', 'SVIP套餐', '20GB', '年付', '2025-06-23 23:25:35', '2026-06-23 23:25:35', 299.00, '1000次/月', '500次/月', '2000次/月', '100次/月'),
(4, 'jhg824&3*g3', '180****7953', 'HWZ004', 'D075415252TD250019252GJL', '管理员', 'HWZ001003', 'hjhwn832nj3', 'hjhwn832nj3', '2025-06-23 23:25:36', '高级会员', '终身会员', '2025-06-23 23:25:36', '2099-12-31 23:59:59', '4G004', '管理员套餐', '50GB', '终身', '2025-06-23 23:25:36', '2099-12-31 23:59:59', 999.00, '无限制', '无限制', '无限制', '无限制'),
(5, 'jhg824&3*g4', '180****7954', 'HWZ005', 'D075415252TD250019252GJL', '超级管理员', 'HWZ001004', 'hjhwn832nj4', 'hjhwn832nj4', '2025-06-23 23:25:37', 'SVIP会员', '终身会员', '2025-06-23 23:25:37', '2099-12-31 23:59:59', '4G005', '超级管理员套餐', '100GB', '终身', '2025-06-23 23:25:37', '2099-12-31 23:59:59', 1999.00, '无限制', '无限制', '无限制', '无限制'),
(6, 'jhg824&3*g5', '180****7955', 'HWZ006', 'D075415252TD250019252GJL', '普通用户', 'HWZ001005', 'hjhwn832nj5', 'hjhwn832nj5', '2025-06-23 23:25:38', '普通会员', '免费', '2025-06-23 23:25:38', '2026-06-23 23:25:38', '4G006', '基础套餐', '5GB', '免费', '2025-06-23 23:25:38', '2026-06-23 23:25:38', 0.00, '100次/月', '50次/月', '200次/月', '10次/月'),
(7, 'jhg824&3*g6', '180****7956', 'HWZ007', 'D075415252TD250019252GJL', 'VIP用户', 'HWZ001006', 'hjhwn832nj6', 'hjhwn832nj6', '2025-06-23 23:25:39', 'VIP会员', '月付', '2025-06-23 23:25:39', '2026-06-23 23:25:39', '4G007', 'VIP套餐', '10GB', '月付', '2025-06-23 23:25:39', '2026-06-23 23:25:39', 99.00, '500次/月', '200次/月', '1000次/月', '50次/月'),
(8, 'jhg824&3*g7', '180****7957', 'HWZ008', 'D075415252TD250019252GJL', 'SVIP用户', 'HWZ001007', 'hjhwn832nj7', 'hjhwn832nj7', '2025-06-23 23:25:40', 'SVIP会员', '年付', '2025-06-23 23:25:40', '2026-06-23 23:25:40', '4G008', 'SVIP套餐', '20GB', '年付', '2025-06-23 23:25:40', '2026-06-23 23:25:40', 299.00, '1000次/月', '500次/月', '2000次/月', '100次/月'),
(9, 'jhg824&3*g8', '180****7958', 'HWZ009', 'D075415252TD250019252GJL', '管理员', 'HWZ001008', 'hjhwn832nj8', 'hjhwn832nj8', '2025-06-23 23:25:41', '高级会员', '终身会员', '2025-06-23 23:25:41', '2099-12-31 23:59:59', '4G009', '管理员套餐', '50GB', '终身', '2025-06-23 23:25:41', '2099-12-31 23:59:59', 999.00, '无限制', '无限制', '无限制', '无限制'),
(10, 'jhg824&3*g9', '180****7959', 'HWZ010', 'D075415252TD250019252GJL', '超级管理员', 'HWZ001009', 'hjhwn832nj9', 'hjhwn832nj9', '2025-06-23 23:25:42', 'SVIP会员', '终身会员', '2025-06-23 23:25:42', '2099-12-31 23:59:59', '4G010', '超级管理员套餐', '100GB', '终身', '2025-06-23 23:25:42', '2099-12-31 23:59:59', 1999.00, '无限制', '无限制', '无限制', '无限制'),
(11, 'jhg824&3*g10', '180****7960', 'HWZ011', 'D075415252TD250019252GJL', '普通用户', 'HWZ001010', 'hjhwn832nj10', 'hjhwn832nj10', '2025-06-23 23:25:43', '普通会员', '免费', '2025-06-23 23:25:43', '2026-06-23 23:25:43', '4G011', '基础套餐', '5GB', '免费', '2025-06-23 23:25:43', '2026-06-23 23:25:43', 0.00, '100次/月', '50次/月', '200次/月', '10次/月'),
(12, 'jhg824&3*g11', '180****7961', 'HWZ012', 'D075415252TD250019252GJL', 'VIP用户', 'HWZ001011', 'hjhwn832nj11', 'hjhwn832nj11', '2025-06-23 23:25:44', 'VIP会员', '月付', '2025-06-23 23:25:44', '2026-06-23 23:25:44', '4G012', 'VIP套餐', '10GB', '月付', '2025-06-23 23:25:44', '2026-06-23 23:25:44', 99.00, '500次/月', '200次/月', '1000次/月', '50次/月'),
(13, 'jhg824&3*g12', '180****7962', 'HWZ013', 'D075415252TD250019252GJL', 'SVIP用户', 'HWZ001012', 'hjhwn832nj12', 'hjhwn832nj12', '2025-06-23 23:25:45', 'SVIP会员', '年付', '2025-06-23 23:25:45', '2026-06-23 23:25:45', '4G013', 'SVIP套餐', '20GB', '年付', '2025-06-23 23:25:45', '2026-06-23 23:25:45', 299.00, '1000次/月', '500次/月', '2000次/月', '100次/月'),
(14, 'jhg824&3*g13', '180****7963', 'HWZ014', 'D075415252TD250019252GJL', '管理员', 'HWZ001013', 'hjhwn832nj13', 'hjhwn832nj13', '2025-06-23 23:25:46', '高级会员', '终身会员', '2025-06-23 23:25:46', '2099-12-31 23:59:59', '4G014', '管理员套餐', '50GB', '终身', '2025-06-23 23:25:46', '2099-12-31 23:59:59', 999.00, '无限制', '无限制', '无限制', '无限制'),
(15, 'jhg824&3*g14', '180****7964', 'HWZ015', 'D075415252TD250019252GJL', '超级管理员', 'HWZ001014', 'hjhwn832nj14', 'hjhwn832nj14', '2025-06-23 23:25:47', 'SVIP会员', '终身会员', '2025-06-23 23:25:47', '2099-12-31 23:59:59', '4G015', '超级管理员套餐', '100GB', '终身', '2025-06-23 23:25:47', '2099-12-31 23:59:59', 1999.00, '无限制', '无限制', '无限制', '无限制'),
(16, 'jhg824&3*g15', '180****7965', 'HWZ016', 'D075415252TD250019252GJL', '普通用户', 'HWZ001015', 'hjhwn832nj15', 'hjhwn832nj15', '2025-06-23 23:25:48', '普通会员', '免费', '2025-06-23 23:25:48', '2026-06-23 23:25:48', '4G016', '基础套餐', '5GB', '免费', '2025-06-23 23:25:48', '2026-06-23 23:25:48', 0.00, '100次/月', '50次/月', '200次/月', '10次/月'),
(17, 'jhg824&3*g16', '180****7966', 'HWZ017', 'D075415252TD250019252GJL', 'VIP用户', 'HWZ001016', 'hjhwn832nj16', 'hjhwn832nj16', '2025-06-23 23:25:49', 'VIP会员', '月付', '2025-06-23 23:25:49', '2026-06-23 23:25:49', '4G017', 'VIP套餐', '10GB', '月付', '2025-06-23 23:25:49', '2026-06-23 23:25:49', 99.00, '500次/月', '200次/月', '1000次/月', '50次/月'),
(18, 'jhg824&3*g17', '180****7967', 'HWZ018', 'D075415252TD250019252GJL', 'SVIP用户', 'HWZ001017', 'hjhwn832nj17', 'hjhwn832nj17', '2025-06-23 23:25:50', 'SVIP会员', '年付', '2025-06-23 23:25:50', '2026-06-23 23:25:50', '4G018', 'SVIP套餐', '20GB', '年付', '2025-06-23 23:25:50', '2026-06-23 23:25:50', 299.00, '1000次/月', '500次/月', '2000次/月', '100次/月'),
(19, 'jhg824&3*g18', '180****7968', 'HWZ019', 'D075415252TD250019252GJL', '管理员', 'HWZ001018', 'hjhwn832nj18', 'hjhwn832nj18', '2025-06-23 23:25:51', '高级会员', '终身会员', '2025-06-23 23:25:51', '2099-12-31 23:59:59', '4G019', '管理员套餐', '50GB', '终身', '2025-06-23 23:25:51', '2099-12-31 23:59:59', 999.00, '无限制', '无限制', '无限制', '无限制'),
(20, 'jhg824&3*g19', '180****7969', 'HWZ020', 'D075415252TD250019252GJL', '超级管理员', 'HWZ001019', 'hjhwn832nj19', 'hjhwn832nj19', '2025-06-23 23:25:52', 'SVIP会员', '终身会员', '2025-06-23 23:25:52', '2099-12-31 23:59:59', '4G020', '超级管理员套餐', '100GB', '终身', '2025-06-23 23:25:52', '2099-12-31 23:59:59', 1999.00, '无限制', '无限制', '无限制', '无限制');

-- Verify all records are present
SELECT COUNT(*) as total_records FROM account_data;

-- Check records 11-20 specifically
SELECT id, member_id, ip_role FROM account_data WHERE id BETWEEN 11 AND 20 ORDER BY id; 