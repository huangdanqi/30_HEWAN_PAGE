-- Insert sample alarm data for testing
-- This will add some test alarm records to the alarm table

INSERT IGNORE INTO alarm (alarmId, alarmName, alarmFileAddress, updater, createTime, updateTime) VALUES
('ALM001', 'Morning Alarm', '/audio/Alarm01.wav', '管理员', NOW(), NOW()),
('ALM002', 'Wake Up Call', '/audio/Alarm02.wav', '管理员', NOW(), NOW()),
('ALM003', 'Emergency Alert', '/audio/Alarm03.wav', '管理员', NOW(), NOW());

-- Verify the data was inserted
SELECT COUNT(*) as total_alarms FROM alarm;
SELECT * FROM alarm ORDER BY createTime DESC;
