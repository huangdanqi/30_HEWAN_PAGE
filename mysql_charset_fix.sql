-- Fix MySQL character encoding for Chinese support
-- Run this script to update the database and table character sets

-- Update the database character set
ALTER DATABASE page_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Update the table character set
ALTER TABLE page_test.account_data CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Update specific columns that have Chinese characters
ALTER TABLE page_test.account_data 
MODIFY COLUMN ip_role VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
MODIFY COLUMN current_member_type VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
MODIFY COLUMN member_payment VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
MODIFY COLUMN fourg_plan VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
MODIFY COLUMN fourg_payment VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Show the updated table structure
DESCRIBE page_test.account_data; 