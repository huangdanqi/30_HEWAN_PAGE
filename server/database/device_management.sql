-- =====================================================
-- Device Management Route Database Operations
-- =====================================================

USE hewan_page_server;

-- =====================================================
-- Create device_management table if not exists
-- =====================================================
CREATE TABLE IF NOT EXISTS device_management (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_id VARCHAR(100) NOT NULL UNIQUE COMMENT '设备ID',
    bound_sub_account VARCHAR(100) COMMENT '绑定的子账户',
    device_model VARCHAR(100) NOT NULL COMMENT '设备型号',
    production_batch VARCHAR(100) COMMENT '生产批次',
    manufacturer VARCHAR(100) COMMENT '制造商',
    initial_firmware VARCHAR(100) COMMENT '初始固件版本',
    latest_firmware VARCHAR(100) COMMENT '最新固件版本',
    current_firmware_version VARCHAR(100) COMMENT '当前固件版本',
    serial_number_code VARCHAR(100) COMMENT '序列号代码',
    chip_id VARCHAR(100) COMMENT '芯片ID',
    wifi_mac_address VARCHAR(50) COMMENT 'WiFi MAC地址',
    bluetooth_mac_address VARCHAR(50) COMMENT '蓝牙MAC地址',
    bluetooth_name VARCHAR(100) COMMENT '蓝牙设备名称',
    cellular_network_id VARCHAR(100) COMMENT '蜂窝网络ID',
    four_g_card_number VARCHAR(50) COMMENT '4G卡号',
    cpu_serial_number VARCHAR(100) COMMENT 'CPU序列号',
    creator VARCHAR(100) COMMENT '创建者',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_device_id (device_id),
    INDEX idx_device_model (device_model),
    INDEX idx_bound_sub_account (bound_sub_account),
    INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='设备管理表';

-- =====================================================
-- Sample data for device_management
-- =====================================================
INSERT INTO device_management (
    device_id, bound_sub_account, device_model, production_batch, manufacturer,
    initial_firmware, latest_firmware, current_firmware_version, serial_number_code,
    chip_id, wifi_mac_address, bluetooth_mac_address, bluetooth_name, cellular_network_id,
    four_g_card_number, cpu_serial_number, creator
) VALUES
('DEVICE_001', 'SUB_001', 'HW-001', 'BATCH_2024_001', 'HeWan制造', 'v1.0.0', 'v1.2.0', 'v1.2.0',
 'SNC_001', 'CHIP_001', 'AA:BB:CC:DD:EE:01', 'FF:GG:HH:II:JJ:01', '小熊维尼_001',
 'CELL_001', '4G_001', 'CPU_001', 'ADMIN_001'),

('DEVICE_002', 'SUB_002', 'HW-002', 'BATCH_2024_002', 'HeWan制造', 'v1.0.0', 'v1.2.0', 'v1.1.5',
 'SNC_002', 'CHIP_002', 'AA:BB:CC:DD:EE:02', 'FF:GG:HH:II:JJ:02', '米老鼠_002',
 'CELL_002', '4G_002', 'CPU_002', 'ADMIN_001'),

('DEVICE_003', 'SUB_003', 'HW-003', 'BATCH_2024_003', 'HeWan制造', 'v1.0.0', 'v1.2.0', 'v1.2.0',
 'SNC_003', 'CHIP_003', 'AA:BB:CC:DD:EE:03', 'FF:GG:HH:II:JJ:03', '唐老鸭_003',
 'CELL_003', '4G_003', 'CPU_003', 'ADMIN_001');

-- =====================================================
-- Common queries for device_management route
-- =====================================================

-- Get all devices with pagination
-- SELECT * FROM device_management ORDER BY create_time DESC LIMIT 10 OFFSET 0;

-- Get device by ID
-- SELECT * FROM device_management WHERE id = ?;

-- Get device by device_id
-- SELECT * FROM device_management WHERE device_id = ?;

-- Search devices by device_id, device_model, or bound_sub_account
-- SELECT * FROM device_management WHERE device_id LIKE '%search%' OR device_model LIKE '%search%' OR bound_sub_account LIKE '%search%';

-- Create new device
-- INSERT INTO device_management (device_id, bound_sub_account, device_model, production_batch, manufacturer, initial_firmware, creator) VALUES (?, ?, ?, ?, ?, ?, ?);

-- Update device
-- UPDATE device_management SET bound_sub_account = ?, current_firmware_version = ?, update_time = CURRENT_TIMESTAMP WHERE id = ?;

-- Delete device
-- DELETE FROM device_management WHERE id = ?;

-- Update firmware version
-- UPDATE device_management SET current_firmware_version = ?, update_time = CURRENT_TIMESTAMP WHERE device_id = ?;

-- Bind device to sub account
-- UPDATE device_management SET bound_sub_account = ?, update_time = CURRENT_TIMESTAMP WHERE device_id = ?;
