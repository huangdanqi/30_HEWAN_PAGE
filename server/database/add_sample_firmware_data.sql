-- Add sample firmware data with file_address column
USE page_test;

-- First, add the file_address column if it doesn't exist
ALTER TABLE firmware ADD COLUMN IF NOT EXISTS file_address VARCHAR(500) DEFAULT 'https://example.com/firmware.bin' COMMENT '文件地址';

-- Clear existing data and insert fresh sample data
DELETE FROM firmware;

-- Insert sample firmware data
INSERT INTO firmware (device_model, release_version, version_number, description, file_address, creator, release_time, update_time) VALUES
('HWSZ001', '主版本', 'Z001 V 1.0.0', 'desc', 'https://firmware.example.com/hwz001_v1.0.0.bin', '张三', '2025-07-13 19:25:11', '2025-07-13 19:25:11'),
('HWSZ001', '主版本', 'Z001 V 2.0.0', 'desc', 'https://firmware.example.com/hwz001_v2.0.0.bin', '张三', '2025-08-13 19:25:11', '2025-08-13 19:25:11'),
('HWSZ002', '主版本', 'Z002 V 1.0.0', 'desc', 'https://firmware.example.com/hwz002_v1.0.0.bin', '李四', '2025-07-14 19:25:11', '2025-07-14 19:25:11'),
('HWSZ002', '主版本', 'Z002 V 2.0.0', 'desc', 'https://firmware.example.com/hwz002_v2.0.0.bin', '李四', '2025-08-14 19:25:11', '2025-08-14 19:25:11'),
('HWSZ003', '主版本', 'Z003 V 1.0.0', 'desc', 'https://firmware.example.com/hwz003_v1.0.0.bin', '王五', '2025-07-15 19:25:11', '2025-07-15 19:25:11'),
('HWSZ003', '主版本', 'Z003 V 2.0.0', 'desc', 'https://firmware.example.com/hwz003_v2.0.0.bin', '王五', '2025-08-15 19:25:11', '2025-08-15 19:25:11'),
('HWSZ003', '主版本', 'Z003 V 3.0.0', 'desc', 'https://firmware.example.com/hwz003_v3.0.0.bin', '王五', '2025-09-15 19:25:11', '2025-09-15 19:25:11'); 