-- Firmware Table
-- Based on Firmware.vue file content

CREATE TABLE IF NOT EXISTS firmware (
  id INT AUTO_INCREMENT PRIMARY KEY,
  device_model VARCHAR(50) NOT NULL COMMENT '设备型号',
  release_version VARCHAR(50) NOT NULL COMMENT '发布版本',
  version_number VARCHAR(100) NOT NULL COMMENT '版本号',
  description TEXT COMMENT '内容描述',
  creator VARCHAR(50) DEFAULT '管理员' COMMENT '创建人',
  release_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '发布时间',
  update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  UNIQUE KEY unique_version (device_model, version_number),
  INDEX idx_device_model (device_model),
  INDEX idx_release_version (release_version),
  INDEX idx_version_number (version_number),
  INDEX idx_release_time (release_time),
  INDEX idx_update_time (update_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='固件管理表';

-- Insert sample data
INSERT INTO firmware (device_model, release_version, version_number, description, creator, release_time) VALUES
('HWSZ001', '主版本', 'Z001 V 1.0.0', 'desc', '张三', '2025-07-13 19:25:11'),
('HWSZ001', '主版本', 'Z001 V 2.0.0', 'desc', '张三', '2025-08-13 19:25:11'),
('HWSZ002', '主版本', 'Z002 V 1.0.0', 'desc', '李四', '2025-07-14 19:25:11'),
('HWSZ002', '主版本', 'Z002 V 2.0.0', 'desc', '李四', '2025-08-14 19:25:11'),
('HWSZ003', '主版本', 'Z003 V 1.0.0', 'desc', '王五', '2025-07-15 19:25:11'),
('HWSZ003', '主版本', 'Z003 V 2.0.0', 'desc', '王五', '2025-08-15 19:25:11'),
('HWSZ003', '主版本', 'Z003 V 3.0.0', 'desc', '王五', '2025-09-15 19:25:11'); 