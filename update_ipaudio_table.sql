-- Alter ipaudio table to match Vue frontend expectations (camelCase column names)
-- This will make it consistent with the ipvideo table structure

-- First, drop the existing table and recreate it with camelCase column names
DROP TABLE IF EXISTS ipaudio;

CREATE TABLE IF NOT EXISTS ipaudio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    audioId VARCHAR(100) NOT NULL UNIQUE COMMENT '音频ID',
    ipName VARCHAR(200) NOT NULL COMMENT 'IP名称',
    audioName VARCHAR(200) NOT NULL COMMENT '音频名称',
    audioType VARCHAR(50) COMMENT '音频类型',
    tags TEXT COMMENT '标签',
    emotion VARCHAR(50) COMMENT '情感',
    language VARCHAR(50) COMMENT '语言',
    audioFileAddress VARCHAR(500) COMMENT '音频文件地址',
    updater VARCHAR(100) COMMENT '更新者',
    createTime DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updateTime DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_audioId (audioId),
    INDEX idx_ipName (ipName),
    INDEX idx_audioName (audioName),
    INDEX idx_createTime (createTime)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='IP音频表';

-- Insert some sample data for testing
INSERT IGNORE INTO ipaudio (audioId, ipName, audioName, audioType, tags, emotion, language, audioFileAddress, updater) VALUES
('AUD001', '小熊维尼', '测试音频1', '语音', '测试,语音', '开心', '中文', '/audio/test1.wav', '管理员'),
('AUD002', '123', '测试音频2', '音乐', '测试,音乐', '平静', '中文', '/audio/test2.wav', '管理员');
