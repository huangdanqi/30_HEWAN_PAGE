-- Add file_address column to firmware table
USE page_test;

-- Add file_address column to firmware table
ALTER TABLE firmware ADD COLUMN file_address VARCHAR(500) DEFAULT 'https://example.com/firmware.bin' COMMENT '文件地址';

-- Update existing records with sample file addresses
UPDATE firmware SET file_address = 'https://example.com/firmware.bin' WHERE file_address IS NULL OR file_address = '';

-- Add some sample data with different file addresses
UPDATE firmware SET file_address = 'https://firmware.example.com/hwz001_v1.0.0.bin' WHERE version_number = 'Z001 V 1.0.0';
UPDATE firmware SET file_address = 'https://firmware.example.com/hwz001_v2.0.0.bin' WHERE version_number = 'Z001 V 2.0.0';
UPDATE firmware SET file_address = 'https://firmware.example.com/hwz002_v1.0.0.bin' WHERE version_number = 'Z002 V 1.0.0';
UPDATE firmware SET file_address = 'https://firmware.example.com/hwz002_v2.0.0.bin' WHERE version_number = 'Z002 V 2.0.0';
UPDATE firmware SET file_address = 'https://firmware.example.com/hwz003_v1.0.0.bin' WHERE version_number = 'Z003 V 1.0.0';
UPDATE firmware SET file_address = 'https://firmware.example.com/hwz003_v2.0.0.bin' WHERE version_number = 'Z003 V 2.0.0';
UPDATE firmware SET file_address = 'https://firmware.example.com/hwz003_v3.0.0.bin' WHERE version_number = 'Z003 V 3.0.0'; 