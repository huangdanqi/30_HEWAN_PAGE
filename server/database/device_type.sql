-- Device Type Table
-- Based on DeviceType.vue file content

CREATE TABLE IF NOT EXISTS device_type (
  id INT AUTO_INCREMENT PRIMARY KEY,
  device_model_id VARCHAR(50) NOT NULL COMMENT '设备型号ID',
  device_model_name VARCHAR(100) NOT NULL COMMENT '设备型号名称',
  introduction TEXT COMMENT '介绍',
  enable_4g ENUM('是', '否') DEFAULT '是' COMMENT '是否开通4G',
  latest_firmware_version VARCHAR(100) COMMENT '最新可更新固件版本',
  updater VARCHAR(50) DEFAULT '管理员' COMMENT '更新人',
  create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  UNIQUE KEY unique_device_model_name (device_model_name),
  INDEX idx_device_model_id (device_model_id),
  INDEX idx_enable_4g (enable_4g),
  INDEX idx_create_time (create_time),
  INDEX idx_update_time (update_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='设备型号表';

-- Insert sample data
INSERT INTO device_type (device_model_id, device_model_name, introduction, enable_4g, latest_firmware_version, updater) VALUES
('hjhwn832nj2f', 'HWZ001', 'ESP32-S3芯片,自带Wi-Fi和蓝牙功能,加入4G模块,支持语音识别和语音合成', '是', 'Z001 V 1.0.0', '33'),
('hjhwn832nj2f', 'HWZ002', 'ESP32-S3芯片,自带Wi-Fi和蓝牙功能,加入4G模块,支持语音识别和语音合成,支持AI对话', '是', 'Z001 V 1.1.0', '33'),
('hjhwn832nj2f', 'HWZ003', 'ESP32-S3芯片,自带Wi-Fi和蓝牙功能,加入4G模块,支持语音识别和语音合成,支持AI对话,支持情感识别', '是', 'Z001 V 1.2.0', '33'),
('hjhwn832nj2f', 'HWZ004', 'ESP32-S3芯片,自带Wi-Fi和蓝牙功能,加入4G模块,支持语音识别和语音合成,支持AI对话,支持情感识别,支持多模态交互', '是', 'Z001 V 2.0.0', '33'); 