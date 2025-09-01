-- =====================================================
-- Firmware Route Database Operations
-- =====================================================

USE hewan_page_server;

-- =====================================================
-- Create firmware table if not exists
-- =====================================================
CREATE TABLE IF NOT EXISTS firmware (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_model VARCHAR(100) NOT NULL COMMENT '设备型号',
    release_version VARCHAR(50) NOT NULL COMMENT '发布版本类型',
    version_number VARCHAR(100) NOT NULL COMMENT '版本号',
    description TEXT COMMENT '固件描述',
    file_path VARCHAR(500) COMMENT '文件路径',
    file_size BIGINT COMMENT '文件大小(字节)',
    creator VARCHAR(100) COMMENT '创建者',
    release_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '发布时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_device_model (device_model),
    INDEX idx_version_number (version_number),
    INDEX idx_release_time (release_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='固件管理表';

-- =====================================================
-- Sample data for firmware
-- =====================================================
INSERT INTO firmware (
    device_model, release_version, version_number, description, file_path, file_size, creator
) VALUES
('HW-001', '正式版', 'v1.2.0', '小熊维尼固件v1.2.0，修复已知问题，提升性能', '/firmware/HW-001-v1.2.0.bin', 2048576, 'ADMIN_001'),
('HW-001', '测试版', 'v1.2.1-beta', '小熊维尼固件v1.2.1测试版，新增功能测试', '/firmware/HW-001-v1.2.1-beta.bin', 2097152, 'ADMIN_001'),
('HW-002', '正式版', 'v1.2.0', '米老鼠固件v1.2.0，优化语音识别算法', '/firmware/HW-002-v1.2.0.bin', 2048576, 'ADMIN_001'),
('HW-003', '正式版', 'v1.2.0', '唐老鸭固件v1.2.0，增强安全性功能', '/firmware/HW-003-v1.2.0.bin', 2048576, 'ADMIN_001');

-- =====================================================
-- Common queries for firmware route
-- =====================================================

-- Get all firmware with pagination
-- SELECT * FROM firmware ORDER BY release_time DESC LIMIT 10 OFFSET 0;

-- Get firmware by ID
-- SELECT * FROM firmware WHERE id = ?;

-- Get firmware by device_model
-- SELECT * FROM firmware WHERE device_model = ?;

-- Get firmware by version_number
-- SELECT * FROM firmware WHERE version_number = ?;

-- Search firmware by device_model, version_number, or release_version
-- SELECT * FROM firmware WHERE device_model LIKE '%search%' OR version_number LIKE '%search%' OR release_version LIKE '%search%';

-- Create new firmware
-- INSERT INTO firmware (device_model, release_version, version_number, description, file_path, file_size, creator) VALUES (?, ?, ?, ?, ?, ?, ?);

-- Update firmware
-- UPDATE firmware SET description = ?, file_path = ?, file_size = ?, update_time = CURRENT_TIMESTAMP WHERE id = ?;

-- Delete firmware
-- DELETE FROM firmware WHERE id = ?;

-- Get latest firmware for device model
-- SELECT * FROM firmware WHERE device_model = ? ORDER BY release_time DESC LIMIT 1;

-- Get firmware by release version type
-- SELECT * FROM firmware WHERE device_model = ? AND release_version = ? ORDER BY release_time DESC;
