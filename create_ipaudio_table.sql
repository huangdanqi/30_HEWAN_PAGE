-- Create ipaudio table if it doesn't exist
CREATE TABLE IF NOT EXISTS ipaudio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    audio_id VARCHAR(100) NOT NULL UNIQUE COMMENT '音频ID',
    ip_name VARCHAR(200) NOT NULL COMMENT 'IP名称',
    audio_name VARCHAR(200) NOT NULL COMMENT '音频名称',
    audio_type VARCHAR(50) COMMENT '音频类型',
    tags TEXT COMMENT '标签',
    emotion VARCHAR(50) COMMENT '情感',
    language VARCHAR(50) COMMENT '语言',
    audio_file_address VARCHAR(500) COMMENT '音频文件地址',
    updater VARCHAR(100) COMMENT '更新者',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_audio_id (audio_id),
    INDEX idx_ip_name (ip_name),
    INDEX idx_audio_name (audio_name),
    INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='IP音频表';

-- Insert some sample data for testing
INSERT IGNORE INTO ipaudio (audio_id, ip_name, audio_name, audio_type, tags, emotion, language, audio_file_address, updater) VALUES
('AUD001', '小熊维尼', '测试音频1', '语音', '测试,语音', '开心', '中文', '/audio/test1.wav', '管理员'),
('AUD002', '123', '测试音频2', '音乐', '测试,音乐', '平静', '中文', '/audio/test2.wav', '管理员');
