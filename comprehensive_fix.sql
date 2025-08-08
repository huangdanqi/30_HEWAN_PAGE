-- Comprehensive Chinese Character Fix
-- This script will replace all corrupted Chinese characters with proper ones

USE page_test;

-- First, let's see what patterns we have
SELECT DISTINCT ip_role, COUNT(*) as count FROM account_data GROUP BY ip_role;
SELECT DISTINCT current_member_type, COUNT(*) as count FROM account_data GROUP BY current_member_type;
SELECT DISTINCT member_payment, COUNT(*) as count FROM account_data GROUP BY member_payment;

-- Now fix all the corrupted patterns systematically

-- Fix ip_role column
UPDATE account_data SET ip_role = '普通用户' WHERE ip_role LIKE '%????????%';
UPDATE account_data SET ip_role = 'VIP用户' WHERE ip_role LIKE '%VIP%' AND ip_role != 'VIP用户';
UPDATE account_data SET ip_role = 'SVIP用户' WHERE ip_role LIKE '%SVIP%' AND ip_role != 'SVIP用户';
UPDATE account_data SET ip_role = '管理员' WHERE ip_role LIKE '%管理员%' OR ip_role LIKE '%µÖ«ÚÇÜ%';
UPDATE account_data SET ip_role = '超级管理员' WHERE ip_role LIKE '%超级%' OR ip_role LIKE '%þ╗êÞ║½%';

-- Fix current_member_type column
UPDATE account_data SET current_member_type = '普通会员' WHERE current_member_type LIKE '%普通%' OR current_member_type LIKE '%µÖ«ÚÇÜ%';
UPDATE account_data SET current_member_type = 'VIP会员' WHERE current_member_type LIKE '%VIP%' AND current_member_type != 'VIP会员';
UPDATE account_data SET current_member_type = 'SVIP会员' WHERE current_member_type LIKE '%SVIP%' AND current_member_type != 'SVIP会员';
UPDATE account_data SET current_member_type = '高级会员' WHERE current_member_type LIKE '%高级%' OR current_member_type LIKE '%õ╝ÜÕæÿ%';

-- Fix member_payment column
UPDATE account_data SET member_payment = '免费' WHERE member_payment LIKE '%免费%' OR member_payment LIKE '%ÕàìÞ┤╣%';
UPDATE account_data SET member_payment = '月付' WHERE member_payment LIKE '%月付%' OR member_payment LIKE '%月%';
UPDATE account_data SET member_payment = '年付' WHERE member_payment LIKE '%年付%' OR member_payment LIKE '%年%';
UPDATE account_data SET member_payment = '终身会员' WHERE member_payment LIKE '%终身%' OR member_payment LIKE '%þ╗êÞ║½%';

-- Set default values for any remaining corrupted data
UPDATE account_data SET ip_role = '普通用户' WHERE ip_role NOT IN ('普通用户', 'VIP用户', 'SVIP用户', '管理员', '超级管理员');
UPDATE account_data SET current_member_type = '普通会员' WHERE current_member_type NOT IN ('普通会员', 'VIP会员', 'SVIP会员', '高级会员');
UPDATE account_data SET member_payment = '免费' WHERE member_payment NOT IN ('免费', '月付', '年付', '终身会员');

-- Verify the results
SELECT 
    id,
    member_id,
    ip_role,
    current_member_type,
    member_payment
FROM account_data 
ORDER BY id;

-- Show the final hex values to confirm proper Chinese characters
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