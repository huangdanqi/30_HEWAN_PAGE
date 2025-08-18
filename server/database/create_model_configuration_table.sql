-- Create model_configuration table for Model Configuration management
USE page_test;

-- Drop the existing table if it exists
DROP TABLE IF EXISTS model_configuration;

-- Create the model_configuration table with all required columns
CREATE TABLE model_configuration (
  id INT AUTO_INCREMENT PRIMARY KEY,
  modelId VARCHAR(100) NOT NULL COMMENT '模型ID',
  modelType VARCHAR(50) NOT NULL COMMENT '模型类型',
  modelName VARCHAR(100) NOT NULL COMMENT '模型名称',
  containerId VARCHAR(100) COMMENT '音色ID/容器ID',
  versionNumber VARCHAR(100) COMMENT '音色名称/版本号',
  apiUrl TEXT COMMENT 'API地址',
  localModelFileDir TEXT COMMENT '本地模型文件目录',
  remainingTrainingTimes INT DEFAULT 0 COMMENT '剩余训练次数',
  buildTime DATETIME COMMENT '购买时间',
  enableTime DATETIME COMMENT '启用时间',
  disableTime DATETIME COMMENT '到期时间',
  billingUnit VARCHAR(20) DEFAULT 'h' COMMENT '计费单位',
  unitCost DECIMAL(10,2) DEFAULT 0.00 COMMENT '单位费用',
  accumulatedUsage VARCHAR(50) DEFAULT '0h' COMMENT '累计使用量',
  accumulatedCost VARCHAR(50) DEFAULT '0元' COMMENT '累计费用',
  updater VARCHAR(50) DEFAULT '管理员' COMMENT '更新人',
  createTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updateTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  UNIQUE KEY unique_model_id (modelId),
  INDEX idx_model_type (modelType),
  INDEX idx_model_name (modelName),
  INDEX idx_container_id (containerId),
  INDEX idx_create_time (createTime),
  INDEX idx_update_time (updateTime)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='模型配置表';

-- Insert some sample data for testing
INSERT INTO model_configuration (
  modelId, modelType, modelName, containerId, versionNumber,
  apiUrl, localModelFileDir, remainingTrainingTimes,
  buildTime, enableTime, disableTime,
  billingUnit, unitCost, accumulatedUsage, accumulatedCost,
  updater
) VALUES
('MDL001', 'TTS', '测试TTS模型', 'VOICE001', '测试音色1', 'https://api.example.com/tts', NULL, 100, '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2025-01-01 00:00:00', 'h', 0.50, '10h', '5元', '管理员'),
('MDL002', 'ASR', '测试ASR模型', 'ASR001', 'v1.0', 'https://api.example.com/asr', NULL, 200, '2024-01-02 00:00:00', '2024-01-02 00:00:00', '2025-01-02 00:00:00', 'h', 0.30, '20h', '6元', '管理员'),
('MDL003', 'LLM', '测试LLM模型', 'LLM001', 'v2.0', 'https://api.example.com/llm', NULL, 150, '2024-01-03 00:00:00', '2024-01-03 00:00:00', '2025-01-03 00:00:00', 'h', 1.00, '5h', '5元', '管理员'),
('MDL004', 'IP VCM', '测试IP音色模型', 'VOICE002', 'IP音色1', 'https://api.example.com/vcm', NULL, 80, '2024-01-04 00:00:00', '2024-01-04 00:00:00', '2025-01-04 00:00:00', 'h', 0.80, '15h', '12元', '管理员'),
('MDL005', '本地模型', '本地测试模型', 'LOCAL001', 'v1.0', NULL, '/path/to/local/model', 0, '2024-01-05 00:00:00', '2024-01-05 00:00:00', '2025-01-05 00:00:00', 'h', 0.00, '0h', '0元', '管理员');

-- Verify the table was created successfully
SELECT COUNT(*) as total_records FROM model_configuration;
