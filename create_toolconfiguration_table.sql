-- Drop the existing toolconfiguration table if it exists
DROP TABLE IF EXISTS toolconfiguration;

-- Create the toolconfiguration table with all required columns for the route
CREATE TABLE IF NOT EXISTS toolconfiguration (
    id INT AUTO_INCREMENT PRIMARY KEY,
    toolId VARCHAR(100) NOT NULL UNIQUE COMMENT '工具ID',
    toolType VARCHAR(100) COMMENT '工具类型',
    toolName VARCHAR(200) NOT NULL COMMENT '工具名称',
    apiAddress VARCHAR(500) COMMENT 'API地址',
    localToolFilePath VARCHAR(500) COMMENT '本地工具文件路径',
    purchaseTime DATETIME COMMENT '购买时间',
    activationTime DATETIME COMMENT '激活时间',
    expirationTime DATETIME COMMENT '过期时间',
    accumulatedUsage DECIMAL(15,2) DEFAULT 0.00 COMMENT '累计使用量',
    accumulatedCost DECIMAL(15,2) DEFAULT 0.00 COMMENT '累计成本',
    updater VARCHAR(100) COMMENT '更新者',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_toolId (toolId),
    INDEX idx_toolName (toolName),
    INDEX idx_toolType (toolType),
    INDEX idx_createdAt (createdAt),
    INDEX idx_updatedAt (updatedAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='工具配置表';

-- Insert sample data for testing
INSERT IGNORE INTO toolconfiguration (toolId, toolType, toolName, apiAddress, localToolFilePath, purchaseTime, activationTime, expirationTime, accumulatedUsage, accumulatedCost, updater) VALUES
('TOOL001', 'API', 'OpenAI GPT API', 'https://api.openai.com/v1/chat/completions', '/tools/openai-gpt', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2025-01-01 00:00:00', 1000.00, 50.00, '管理员'),
('TOOL002', 'Local', 'Image Processing Tool', NULL, '/tools/image-processor', '2024-01-15 00:00:00', '2024-01-15 00:00:00', NULL, 500.00, 0.00, '管理员'),
('TOOL003', 'API', 'Translation Service', 'https://api.translate.com/v1/translate', '/tools/translator', '2024-02-01 00:00:00', '2024-02-01 00:00:00', '2025-02-01 00:00:00', 2000.00, 100.00, '管理员');

-- Verify the data was inserted
SELECT COUNT(*) as total_tools FROM toolconfiguration;
SELECT * FROM toolconfiguration ORDER BY createdAt DESC;
