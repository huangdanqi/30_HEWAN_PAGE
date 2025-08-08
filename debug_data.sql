-- Debug data issue
USE page_test;

-- Check all records with IDs
SELECT id, member_id FROM account_data ORDER BY id;

-- Check for missing IDs
SELECT 
    t1.id as expected_id,
    t2.id as actual_id
FROM (
    SELECT 1 as id UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION
    SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION
    SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15 UNION
    SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19 UNION SELECT 20
) t1
LEFT JOIN account_data t2 ON t1.id = t2.id
WHERE t2.id IS NULL;

-- Check what records we actually have
SELECT id, member_id, ip_role FROM account_data ORDER BY id; 