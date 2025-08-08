-- Check database data and pagination
USE page_test;

-- Check total count
SELECT COUNT(*) as total_records FROM account_data;

-- Check all records
SELECT id, member_id, ip_role FROM account_data ORDER BY id;

-- Test pagination manually
SELECT id, member_id, ip_role FROM account_data ORDER BY id LIMIT 10 OFFSET 10; 