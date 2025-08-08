-- Comprehensive Chinese Character Encoding Fix
-- This script will recreate the table with proper encoding and fix the data

-- 1. Create a backup of the current data
CREATE TABLE IF NOT EXISTS account_data_backup AS SELECT * FROM account_data;

-- 2. Drop the original table
DROP TABLE account_data;

-- 3. Recreate the table with proper UTF-8 encoding
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

-- 4. Set session variables for proper encoding
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET collation_connection = 'utf8mb4_unicode_ci';

-- 5. Re-insert the data with proper encoding
INSERT INTO account_data SELECT * FROM account_data_backup;

-- 6. Verify the fix
SELECT 
    id,
    member_id,
    ip_role,
    current_member_type,
    member_payment
FROM account_data 
LIMIT 5;

-- 7. Check the character encoding of the table
SHOW CREATE TABLE account_data; 