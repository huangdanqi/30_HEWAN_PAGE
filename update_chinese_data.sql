-- Update sample data with proper Chinese characters
USE page_test;

-- Update IP roles with Chinese characters
UPDATE account_data SET ip_role = '管理员' WHERE id = 1;
UPDATE account_data SET ip_role = '普通用户' WHERE id = 2;
UPDATE account_data SET ip_role = 'VIP用户' WHERE id = 3;
UPDATE account_data SET ip_role = 'SVIP用户' WHERE id = 4;
UPDATE account_data SET ip_role = '企业用户' WHERE id = 5;
UPDATE account_data SET ip_role = '测试用户' WHERE id = 6;
UPDATE account_data SET ip_role = '开发者' WHERE id = 7;
UPDATE account_data SET ip_role = '合作伙伴' WHERE id = 8;
UPDATE account_data SET ip_role = '代理商' WHERE id = 9;
UPDATE account_data SET ip_role = '经销商' WHERE id = 10;

-- Update member types with Chinese characters
UPDATE account_data SET current_member_type = '免费用户' WHERE id = 1;
UPDATE account_data SET current_member_type = 'VIP会员' WHERE id = 2;
UPDATE account_data SET current_member_type = 'SVIP会员' WHERE id = 3;
UPDATE account_data SET current_member_type = '企业会员' WHERE id = 4;
UPDATE account_data SET current_member_type = '高级会员' WHERE id = 5;
UPDATE account_data SET current_member_type = '专业会员' WHERE id = 6;
UPDATE account_data SET current_member_type = '开发者会员' WHERE id = 7;
UPDATE account_data SET current_member_type = '合作伙伴会员' WHERE id = 8;
UPDATE account_data SET current_member_type = '代理商会员' WHERE id = 9;
UPDATE account_data SET current_member_type = '经销商会员' WHERE id = 10;

-- Update member payment with Chinese characters
UPDATE account_data SET member_payment = '免费' WHERE id = 1;
UPDATE account_data SET member_payment = '月付' WHERE id = 2;
UPDATE account_data SET member_payment = '年付' WHERE id = 3;
UPDATE account_data SET member_payment = '季付' WHERE id = 4;
UPDATE account_data SET member_payment = '终身' WHERE id = 5;
UPDATE account_data SET member_payment = '企业版' WHERE id = 6;
UPDATE account_data SET member_payment = '专业版' WHERE id = 7;
UPDATE account_data SET member_payment = '合作伙伴版' WHERE id = 8;
UPDATE account_data SET member_payment = '代理商版' WHERE id = 9;
UPDATE account_data SET member_payment = '经销商版' WHERE id = 10;

-- Update 4G plans with Chinese characters
UPDATE account_data SET fourg_plan = '500M/月' WHERE id = 1;
UPDATE account_data SET fourg_plan = '1GB/月' WHERE id = 2;
UPDATE account_data SET fourg_plan = '2GB/月' WHERE id = 3;
UPDATE account_data SET fourg_plan = '5GB/月' WHERE id = 4;
UPDATE account_data SET fourg_plan = '10GB/月' WHERE id = 5;
UPDATE account_data SET fourg_plan = '20GB/月' WHERE id = 6;
UPDATE account_data SET fourg_plan = '50GB/月' WHERE id = 7;
UPDATE account_data SET fourg_plan = '100GB/月' WHERE id = 8;
UPDATE account_data SET fourg_plan = '无限流量' WHERE id = 9;
UPDATE account_data SET fourg_plan = '企业专线' WHERE id = 10;

-- Update 4G payment with Chinese characters
UPDATE account_data SET fourg_payment = '免费' WHERE id = 1;
UPDATE account_data SET fourg_payment = '月付' WHERE id = 2;
UPDATE account_data SET fourg_payment = '年付' WHERE id = 3;
UPDATE account_data SET fourg_payment = '季付' WHERE id = 4;
UPDATE account_data SET fourg_payment = '终身' WHERE id = 5;
UPDATE account_data SET fourg_payment = '企业版' WHERE id = 6;
UPDATE account_data SET fourg_payment = '专业版' WHERE id = 7;
UPDATE account_data SET fourg_payment = '合作伙伴版' WHERE id = 8;
UPDATE account_data SET fourg_payment = '代理商版' WHERE id = 9;
UPDATE account_data SET fourg_payment = '经销商版' WHERE id = 10;

-- Verify the updates
SELECT id, ip_role, current_member_type, member_payment, fourg_plan, fourg_payment 
FROM account_data 
ORDER BY id; 