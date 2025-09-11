-- Alter ipimage table to match Vue frontend expectations (camelCase column names)
-- This will make it consistent with the ipvideo table structure

-- First, drop the existing table and recreate it with camelCase column names
DROP TABLE IF EXISTS ipimage;

CREATE TABLE IF NOT EXISTS ipimage (
    id INT AUTO_INCREMENT PRIMARY KEY,
    imageId VARCHAR(100) NOT NULL UNIQUE COMMENT '图片ID',
    ipName VARCHAR(200) NOT NULL COMMENT 'IP名称',
    imageName VARCHAR(200) NOT NULL COMMENT '图片名称',
    scene VARCHAR(100) COMMENT '场景',
    weather VARCHAR(50) COMMENT '天气',
    emotion VARCHAR(50) COMMENT '情感',
    timePeriod VARCHAR(50) COMMENT '时间段',
    tags TEXT COMMENT '标签',
    imageFileAddress VARCHAR(500) COMMENT '图片文件地址',
    updater VARCHAR(100) COMMENT '更新者',
    createTime DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updateTime DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_imageId (imageId),
    INDEX idx_ipName (ipName),
    INDEX idx_imageName (imageName),
    INDEX idx_createTime (createTime)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='IP图片表';

-- Insert some sample data for testing
INSERT IGNORE INTO ipimage (imageId, ipName, imageName, scene, weather, emotion, timePeriod, tags, imageFileAddress, updater) VALUES
('IMG001', '小熊维尼', '测试图片1', '室内', '晴天', '开心', '白天', '测试,图片', '/images/test1.jpg', '管理员'),
('IMG002', '123', '测试图片2', '室外', '阴天', '平静', '夜晚', '测试,图片', '/images/test2.jpg', '管理员');
