-- Fix Chinese Character Encoding for MySQL Database
-- Run this script to ensure proper UTF-8 support for Chinese characters

-- 1. Set database character set and collation
ALTER DATABASE page_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2. Convert the account_data table to UTF-8
ALTER TABLE page_test.account_data CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 3. Specifically update columns that contain Chinese text
ALTER TABLE page_test.account_data 
MODIFY COLUMN ip_role VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
MODIFY COLUMN current_member_type VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
MODIFY COLUMN member_payment VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 4. Set MySQL server variables for the current session
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET collation_connection = 'utf8mb4_unicode_ci';

-- 5. Verify the changes
SELECT 
    TABLE_NAME,
    TABLE_COLLATION,
    TABLE_SCHEMA
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'page_test';

-- 6. Check column character sets
SELECT 
    COLUMN_NAME,
    CHARACTER_SET_NAME,
    COLLATION_NAME
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'page_test' 
AND TABLE_NAME = 'account_data'
AND DATA_TYPE IN ('varchar', 'text', 'char'); 