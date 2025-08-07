-- Device Management Table
-- Based on DeviceManagement.vue file content

CREATE TABLE IF NOT EXISTS device_management (
  id INT AUTO_INCREMENT PRIMARY KEY,
  device_id VARCHAR(100) NOT NULL COMMENT '设备ID',
  bound_sub_account VARCHAR(50) COMMENT '绑定子账户',
  device_model VARCHAR(50) NOT NULL COMMENT '设备型号',
  production_batch DATE NOT NULL COMMENT '生产批次',
  manufacturer VARCHAR(200) NOT NULL COMMENT '生产厂家',
  initial_firmware VARCHAR(100) COMMENT '初始烧录固件',
  latest_firmware VARCHAR(100) COMMENT '最新可更新固件',
  current_firmware_version VARCHAR(100) COMMENT '当前固件版本',
  serial_number_code VARCHAR(100) COMMENT 'SN码',
  chip_id VARCHAR(100) COMMENT '芯片ID',
  wifi_mac_address VARCHAR(50) COMMENT 'Wi-Fi MAC 地址',
  bluetooth_mac_address VARCHAR(50) COMMENT '蓝牙MAC地址',
  bluetooth_name VARCHAR(100) COMMENT '蓝牙名称',
  cellular_network_id VARCHAR(50) COMMENT '蜂窝网络识别码',
  four_g_card_number VARCHAR(50) COMMENT '4G卡号',
  cpu_serial_number VARCHAR(100) COMMENT 'CPU序列号',
  creator VARCHAR(50) DEFAULT '管理员' COMMENT '创建人',
  create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  UNIQUE KEY unique_device_id (device_id),
  INDEX idx_bound_sub_account (bound_sub_account),
  INDEX idx_device_model (device_model),
  INDEX idx_production_batch (production_batch),
  INDEX idx_manufacturer (manufacturer),
  INDEX idx_serial_number_code (serial_number_code),
  INDEX idx_chip_id (chip_id),
  INDEX idx_wifi_mac_address (wifi_mac_address),
  INDEX idx_bluetooth_mac_address (bluetooth_mac_address),
  INDEX idx_cellular_network_id (cellular_network_id),
  INDEX idx_four_g_card_number (four_g_card_number),
  INDEX idx_cpu_serial_number (cpu_serial_number),
  INDEX idx_create_time (create_time),
  INDEX idx_update_time (update_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='设备管理表';

-- Insert sample data
INSERT INTO device_management (device_id, bound_sub_account, device_model, production_batch, manufacturer, initial_firmware, latest_firmware, current_firmware_version, serial_number_code, chip_id, wifi_mac_address, bluetooth_mac_address, bluetooth_name, cellular_network_id, four_g_card_number, cpu_serial_number, creator) VALUES
('0075A1B2SZTDS25061982X01', '183****7953', 'HW2001', '2025-06-30', '深圳天德胜科技有限公司', 'HW2001 V 1.0.1', 'HW2001 V 2.0.1', 'HW2001 V 1.3.0', 'SZTDS25061982X01', 'ESP32-0075A1B01', 'DC:54:75:62:01:70', 'DC:54:75:62:01:70', 'ZBMU 001 250619X01', '353801003000174', '14776294300136', '0xFFFFFF6B', '33'),
('0075A1B2SZTDS25061982X02', '-', 'HW2001', '2025-06-30', '深圳天德胜科技有限公司', 'HW2001 V 1.0.1', 'HW2001 V 2.0.1', 'HW2001 V 1.3.0', 'SZTDS25061982X02', 'ESP32-0075A1B02', 'DC:54:75:62:02:70', 'DC:54:75:62:02:70', 'ZBMU 001 250619X02', '353801003000274', '14776294300236', '0xFFFFFF6A', '33'),
('0075A1B2SZTDS25061982X03', '183****7953', 'HW2001', '2025-06-30', '深圳天德胜科技有限公司', 'HW2001 V 1.0.1', 'HW2001 V 2.0.1', 'HW2001 V 1.3.0', 'SZTDS25061982X03', 'ESP32-0075A1B03', 'DC:54:75:62:03:70', 'DC:54:75:62:03:70', 'ZBMU 001 250619X03', '353801003000374', '14776294300336', '0xFFFFFF69', '33'),
('0075A1B2SZTDS25061982X04', '-', 'HW2001', '2025-06-30', '深圳天德胜科技有限公司', 'HW2001 V 1.0.1', 'HW2001 V 2.0.1', 'HW2001 V 1.3.0', 'SZTDS25061982X04', 'ESP32-0075A1B04', 'DC:54:75:62:04:70', 'DC:54:75:62:04:70', 'ZBMU 001 250619X04', '353801003000474', '14776294300436', '0xFFFFFF68', '33'),
('0075A1B2SZTDS25061982X05', '183****7953', 'HW2001', '2025-06-30', '深圳天德胜科技有限公司', 'HW2001 V 1.0.1', 'HW2001 V 2.0.1', 'HW2001 V 1.3.0', 'SZTDS25061982X05', 'ESP32-0075A1B05', 'DC:54:75:62:05:70', 'DC:54:75:62:05:70', 'ZBMU 001 250619X05', '353801003000574', '14776294300536', '0xFFFFFF67', '33'); 