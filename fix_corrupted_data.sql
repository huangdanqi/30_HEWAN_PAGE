-- Fix corrupted Chinese character data
-- Replace the ?????????? with proper Chinese characters

USE page_test;

-- Update ip_role with proper Chinese values
UPDATE account_data SET ip_role = '普通用户' WHERE ip_role = '??????????';
UPDATE account_data SET ip_role = 'VIP用户' WHERE ip_role = '???????????';
UPDATE account_data SET ip_role = 'SVIP用户' WHERE ip_role = '???????????';
UPDATE account_data SET ip_role = '管理员' WHERE ip_role = '??????????';
UPDATE account_data SET ip_role = '超级管理员' WHERE ip_role = '???????????';

-- Update current_member_type with proper Chinese values
UPDATE account_data SET current_member_type = '普通会员' WHERE current_member_type = '????????????';
UPDATE account_data SET current_member_type = 'VIP会员' WHERE current_member_type = 'VIP??????';
UPDATE account_data SET current_member_type = 'SVIP会员' WHERE current_member_type = '????????????';
UPDATE account_data SET current_member_type = '高级会员' WHERE current_member_type = '????????????';

-- Update member_payment with proper Chinese values
UPDATE account_data SET member_payment = '免费' WHERE member_payment = '??????';
UPDATE account_data SET member_payment = '月付' WHERE member_payment = '??????';
UPDATE account_data SET member_payment = '年付' WHERE member_payment = '??????';
UPDATE account_data SET member_payment = '终身会员' WHERE member_payment = '????????????';

-- Verify the changes
SELECT 
    id,
    member_id,
    ip_role,
    current_member_type,
    member_payment
FROM account_data 
LIMIT 10;

-- Show the hex values to confirm they're now proper Chinese characters
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