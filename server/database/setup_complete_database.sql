-- =====================================================
-- Complete Database Setup Script for HeWan Page Server
-- =====================================================
-- This script creates all tables and inserts sample data
-- Run this script to set up the complete database

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS hewan_page_server CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE hewan_page_server;

-- =====================================================
-- 1. ACCOUNTS TABLE (账户数据表)
-- =====================================================
CREATE TABLE IF NOT EXISTS account_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    member_id VARCHAR(50) NOT NULL COMMENT '会员ID',
    phone_number VARCHAR(20) COMMENT '手机号码',
    device_model VARCHAR(100) COMMENT '设备型号',
    device_id VARCHAR(100) COMMENT '设备ID',
    ip_role VARCHAR(50) COMMENT 'IP角色',
    product_id VARCHAR(100) COMMENT '产品ID',
    commodity_id VARCHAR(100) COMMENT '商品ID',
    voice_cloning_model_id VARCHAR(100) COMMENT '语音克隆模型ID',
    initial_activation_time DATETIME COMMENT '初始激活时间',
    current_member_type VARCHAR(50) COMMENT '当前会员类型',
    member_payment DECIMAL(10,2) DEFAULT 0.00 COMMENT '会员支付金额',
    member_activation_time DATETIME COMMENT '会员激活时间',
    member_expiration_time DATETIME COMMENT '会员过期时间',
    fourg_card_number VARCHAR(50) COMMENT '4G卡号',
    fourg_plan VARCHAR(100) COMMENT '4G套餐',
    remaining_data_current_month DECIMAL(10,2) DEFAULT 0.00 COMMENT '当月剩余流量',
    fourg_payment DECIMAL(10,2) DEFAULT 0.00 COMMENT '4G支付金额',
    fourg_activation_time DATETIME COMMENT '4G激活时间',
    fourg_expiration_time DATETIME COMMENT '4G过期时间',
    annual_service_fee_balance DECIMAL(10,2) DEFAULT 0.00 COMMENT '年服务费余额',
    asr_usage DECIMAL(10,2) DEFAULT 0.00 COMMENT 'ASR使用量',
    llm_usage DECIMAL(10,2) DEFAULT 0.00 COMMENT 'LLM使用量',
    tts_usage DECIMAL(10,2) DEFAULT 0.00 COMMENT 'TTS使用量',
    voice_clone_usage DECIMAL(10,2) DEFAULT 0.00 COMMENT '语音克隆使用量',
    registration_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
    INDEX idx_member_id (member_id),
    INDEX idx_device_id (device_id),
    INDEX idx_product_id (product_id),
    INDEX idx_registration_time (registration_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='账户数据表';

-- =====================================================
-- 2. PRODUCT LIST TABLE (产品列表表)
-- =====================================================
CREATE TABLE IF NOT EXISTS product_list (
    id INT AUTO_INCREMENT PRIMARY KEY,
    serial_number VARCHAR(100) NOT NULL COMMENT '序列号',
    product_id VARCHAR(100) NOT NULL COMMENT '产品ID',
    ip_role VARCHAR(50) COMMENT 'IP角色',
    product_model VARCHAR(100) NOT NULL COMMENT '产品型号',
    product_name VARCHAR(200) NOT NULL COMMENT '产品名称',
    product_type VARCHAR(100) NOT NULL COMMENT '产品类型',
    color VARCHAR(50) COMMENT '颜色',
    production_batch VARCHAR(100) NOT NULL COMMENT '生产批次',
    manufacturer VARCHAR(100) NOT NULL COMMENT '制造商',
    qr_code_file_directory VARCHAR(500) COMMENT '二维码文件目录',
    qr_code_exported ENUM('是', '否') DEFAULT '否' COMMENT '二维码是否已导出',
    barcode_file_directory VARCHAR(500) COMMENT '条形码文件目录',
    barcode_exported ENUM('是', '否') DEFAULT '否' COMMENT '条形码是否已导出',
    device_id VARCHAR(100) DEFAULT '' COMMENT '设备ID',
    sub_account_id VARCHAR(100) DEFAULT '' COMMENT '子账户ID',
    file_export_time VARCHAR(100) DEFAULT '' COMMENT '文件导出时间',
    first_binding_time VARCHAR(100) DEFAULT '' COMMENT '首次绑定时间',
    creator_id VARCHAR(100) NOT NULL COMMENT '创建者ID',
    creator_name VARCHAR(100) DEFAULT '管理员' COMMENT '创建者姓名',
    creation_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_product_id (product_id),
    INDEX idx_serial_number (serial_number),
    INDEX idx_device_id (device_id),
    INDEX idx_creation_time (creation_time),
    INDEX idx_update_time (update_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='产品列表表';

-- =====================================================
-- 3. DEVICE MANAGEMENT TABLE (设备管理表)
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
-- 4. DEVICE TYPE TABLE (设备型号表)
-- =====================================================
CREATE TABLE IF NOT EXISTS device_type (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_model_id VARCHAR(100) NOT NULL COMMENT '设备型号ID',
    device_model_name VARCHAR(100) NOT NULL UNIQUE COMMENT '设备型号名称',
    introduction TEXT COMMENT '设备介绍',
    enable_4g ENUM('是', '否') DEFAULT '否' COMMENT '是否启用4G',
    latest_firmware_version VARCHAR(100) COMMENT '最新固件版本',
    updater VARCHAR(100) COMMENT '更新者',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_device_model_name (device_model_name),
    INDEX idx_device_model_id (device_model_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='设备型号表';

-- =====================================================
-- 5. FIRMWARE TABLE (固件管理表)
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
-- 6. DEVICE PRODUCTION TABLE (设备生产表)
-- =====================================================
CREATE TABLE IF NOT EXISTS device_production (
    id INT AUTO_INCREMENT PRIMARY KEY,
    production_device_id VARCHAR(100) NOT NULL COMMENT '生产设备ID',
    device_model VARCHAR(100) NOT NULL COMMENT '设备型号',
    production_batch VARCHAR(100) NOT NULL COMMENT '生产批次',
    manufacturer VARCHAR(100) NOT NULL COMMENT '制造商',
    firmware_version VARCHAR(100) COMMENT '固件版本',
    burn_firmware VARCHAR(100) COMMENT '烧录固件',
    unit_price DECIMAL(10,2) DEFAULT 0.00 COMMENT '单价(元)',
    quantity INT DEFAULT 0 COMMENT '生产数量',
    total_price DECIMAL(10,2) DEFAULT 0.00 COMMENT '总价',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_production_device_id (production_device_id),
    INDEX idx_device_model (device_model),
    INDEX idx_production_batch (production_batch),
    INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='设备生产表';

-- =====================================================
-- 7. PRODUCT TYPE TABLE (产品型号表)
-- =====================================================
CREATE TABLE IF NOT EXISTS product_type (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id VARCHAR(100) NOT NULL UNIQUE COMMENT '产品ID',
    product_model VARCHAR(100) NOT NULL UNIQUE COMMENT '产品型号',
    product_name VARCHAR(200) NOT NULL COMMENT '产品名称',
    product_type VARCHAR(100) NOT NULL COMMENT '产品类型',
    color VARCHAR(50) COMMENT '颜色',
    product_details TEXT COMMENT '产品详情',
    device_model VARCHAR(100) COMMENT '关联设备型号',
    ip_name VARCHAR(100) COMMENT 'IP名称',
    creator VARCHAR(100) COMMENT '创建者',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_product_id (product_id),
    INDEX idx_product_model (product_model),
    INDEX idx_product_type (product_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='产品型号表';

-- =====================================================
-- 8. TOY PRODUCTION TABLE (玩具生产表)
-- =====================================================
CREATE TABLE IF NOT EXISTS toy_production_new (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id VARCHAR(100) NOT NULL COMMENT '产品ID',
    device_model VARCHAR(100) NOT NULL COMMENT '设备型号',
    product_name VARCHAR(200) NOT NULL COMMENT '产品名称',
    production_batch VARCHAR(100) NOT NULL COMMENT '生产批次',
    manufacturer VARCHAR(100) NOT NULL COMMENT '制造商',
    unit_price DECIMAL(10,2) DEFAULT 0.00 COMMENT '单价(元)',
    quantity INT DEFAULT 0 COMMENT '生产数量',
    total_price DECIMAL(10,2) DEFAULT 0.00 COMMENT '总价',
    creator VARCHAR(100) COMMENT '创建者',
    updater VARCHAR(100) COMMENT '更新者',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_product_id (product_id),
    INDEX idx_device_model (device_model),
    INDEX idx_production_batch (production_batch),
    INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='玩具生产表';

-- =====================================================
-- 9. ALARM TABLE (闹钟表)
-- =====================================================
CREATE TABLE IF NOT EXISTS alarm (
    id INT AUTO_INCREMENT PRIMARY KEY,
    alarmId VARCHAR(100) NOT NULL UNIQUE COMMENT '闹钟ID',
    alarmName VARCHAR(100) NOT NULL COMMENT '闹钟名称',
    alarmFileAddress VARCHAR(500) COMMENT '闹钟文件地址',
    updater VARCHAR(100) COMMENT '更新者',
    createTime DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updateTime DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_alarmId (alarmId),
    INDEX idx_alarmName (alarmName),
    INDEX idx_createTime (createTime)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='闹钟表';

-- =====================================================
-- 10. IP MANAGEMENT TABLE (IP管理表) - UPDATED WITH MISSING COLUMNS
-- =====================================================
CREATE TABLE IF NOT EXISTS ip_management (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ip_id VARCHAR(100) NOT NULL UNIQUE COMMENT 'IP ID',
    ip_name VARCHAR(200) NOT NULL COMMENT 'IP名称',
    ip_intro TEXT COMMENT 'IP介绍',
    ip_address VARCHAR(50) NOT NULL UNIQUE COMMENT 'IP地址',
    device_id VARCHAR(100) COMMENT '设备ID',
    device_model VARCHAR(100) COMMENT '设备型号',
    status ENUM('在线', '离线', '维护') DEFAULT '离线' COMMENT '状态',
    running ENUM('金', '木', '水', '火', '土') DEFAULT '金' COMMENT '五行',
    portrait VARCHAR(500) COMMENT '头像',
    mbti VARCHAR(50) COMMENT 'MBTI类型',
    preference TEXT COMMENT '偏好设置',
    agent_link VARCHAR(500) COMMENT '代理链接',
    last_seen DATETIME COMMENT '最后在线时间',
    creator VARCHAR(100) COMMENT '创建者',
    updater VARCHAR(100) COMMENT '更新者',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_ip_id (ip_id),
    INDEX idx_ip_name (ip_name),
    INDEX idx_ip_address (ip_address),
    INDEX idx_device_id (device_id),
    INDEX idx_status (status),
    INDEX idx_running (running),
    INDEX idx_last_seen (last_seen)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='IP管理表';

-- =====================================================
-- 11. IP AUDIO TABLE (IP音频表) - CORRECTED COLUMN NAMES
-- =====================================================
-- CREATE TABLE IF NOT EXISTS ipaudio (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     audio_id VARCHAR(100) NOT NULL UNIQUE COMMENT '音频ID',
--     ip_name VARCHAR(200) NOT NULL COMMENT 'IP名称',
--     audio_name VARCHAR(200) NOT NULL COMMENT '音频名称',
--     audio_type VARCHAR(50) COMMENT '音频类型',
--     tags TEXT COMMENT '标签',
--     emotion VARCHAR(50) COMMENT '情感',
--     language VARCHAR(50) COMMENT '语言',
--     audio_file_address VARCHAR(500) COMMENT '音频文件地址',
--     updater VARCHAR(100) COMMENT '更新者',
--     create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
--     update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
--     INDEX idx_audio_id (audio_id),
--     INDEX idx_ip_name (ip_name),
--     INDEX idx_audio_name (audio_name),
--     INDEX idx_create_time (create_time)
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='IP音频表';


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
-- =====================================================
-- 12. IP VIDEO TABLE (IP视频表) - FIXED TABLE NAME AND COLUMNS
-- =====================================================
CREATE TABLE IF NOT EXISTS ipvideo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    videoId VARCHAR(100) NOT NULL UNIQUE COMMENT '视频ID',
    ipName VARCHAR(200) NOT NULL COMMENT 'IP名称',
    videoName VARCHAR(200) NOT NULL COMMENT '视频名称',
    scene VARCHAR(100) COMMENT '场景',
    weather VARCHAR(50) COMMENT '天气',
    emotion VARCHAR(50) COMMENT '情感',
    timePeriod VARCHAR(50) COMMENT '时间段',
    tags TEXT COMMENT '标签',
    videoFileAddress VARCHAR(500) COMMENT '视频文件地址',
    updater VARCHAR(100) COMMENT '更新者',
    createTime DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updateTime DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_videoId (videoId),
    INDEX idx_ipName (ipName),
    INDEX idx_videoName (videoName),
    INDEX idx_createTime (createTime)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='IP视频表';


-- =====================================================
-- 13. IP IMAGE TABLE (IP图片表) - CORRECTED COLUMN NAMES
-- =====================================================
-- CREATE TABLE IF NOT EXISTS ipimage (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     image_id VARCHAR(100) NOT NULL UNIQUE COMMENT '图片ID',
--     ip_name VARCHAR(200) NOT NULL COMMENT 'IP名称',
--     image_name VARCHAR(200) NOT NULL COMMENT '图片名称',
--     scene VARCHAR(100) COMMENT '场景',
--     weather VARCHAR(50) COMMENT '天气',
--     emotion VARCHAR(50) COMMENT '情感',
--     time_period VARCHAR(50) COMMENT '时间段',
--     tags TEXT COMMENT '标签',
--     image_file_address VARCHAR(500) COMMENT '图片文件地址',
--     updater VARCHAR(100) COMMENT '更新者',
--     create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
--     update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
--     INDEX idx_image_id (image_id),
--     INDEX idx_ip_name (ip_name),
--     INDEX idx_image_name (image_name),
--     INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='IP图片表';
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
-- =====================================================
-- 14. IP MUSIC TABLE (IP音乐表) - FIXED TABLE NAME AND COLUMNS
-- =====================================================
CREATE TABLE IF NOT EXISTS ipmusic (
    id INT AUTO_INCREMENT PRIMARY KEY,
    musicId VARCHAR(100) NOT NULL UNIQUE COMMENT '音乐ID',
    musicName VARCHAR(200) NOT NULL COMMENT '音乐名称',
    musicType VARCHAR(50) COMMENT '音乐类型',
    singer VARCHAR(100) COMMENT '歌手',
    tags TEXT COMMENT '标签',
    musicFileAddress VARCHAR(500) COMMENT '音乐文件地址',
    updater VARCHAR(100) COMMENT '更新者',
    createTime DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updateTime DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_musicId (musicId),
    INDEX idx_musicName (musicName),
    INDEX idx_musicType (musicType),
    INDEX idx_createTime (createTime)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='IP音乐表';

-- =====================================================
-- 15. BOM TABLE (物料清单表)
-- =====================================================
CREATE TABLE IF NOT EXISTS bom (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bom_id VARCHAR(100) NOT NULL UNIQUE COMMENT 'BOM ID',
    product_model VARCHAR(100) NOT NULL COMMENT '产品型号',
    component_name VARCHAR(200) NOT NULL COMMENT '组件名称',
    component_type VARCHAR(100) COMMENT '组件类型',
    quantity INT DEFAULT 1 COMMENT '数量',
    unit_price DECIMAL(10,2) DEFAULT 0.00 COMMENT '单价',
    total_price DECIMAL(10,2) DEFAULT 0.00 COMMENT '总价',
    supplier VARCHAR(100) COMMENT '供应商',
    part_number VARCHAR(100) COMMENT '零件号',
    description TEXT COMMENT '描述',
    creator VARCHAR(100) COMMENT '创建者',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_bom_id (bom_id),
    INDEX idx_product_model (product_model),
    INDEX idx_component_name (component_name),
    INDEX idx_component_type (component_type),
    INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='物料清单表';

-- =====================================================
-- 16. MODEL CONFIGURATION TABLE (型号配置表) - UPDATED WITH MISSING COLUMNS
-- =====================================================
CREATE TABLE IF NOT EXISTS model_configuration (
    id INT AUTO_INCREMENT PRIMARY KEY,
    modelId VARCHAR(100) NOT NULL UNIQUE COMMENT '型号ID',
    modelType VARCHAR(100) COMMENT '型号类型',
    modelName VARCHAR(200) NOT NULL COMMENT '型号名称',
    containerId VARCHAR(100) COMMENT '容器ID',
    versionNumber VARCHAR(50) COMMENT '版本号',
    apiUrl VARCHAR(500) COMMENT 'API地址',
    localModelFileDir VARCHAR(500) COMMENT '本地模型文件目录',
    remainingTrainingTimes INT DEFAULT 0 COMMENT '剩余训练次数',
    buildTime DATETIME COMMENT '构建时间',
    enableTime DATETIME COMMENT '启用时间',
    disableTime DATETIME COMMENT '禁用时间',
    billingUnit VARCHAR(50) COMMENT '计费单位',
    unitCost DECIMAL(10,2) DEFAULT 0.00 COMMENT '单位成本',
    accumulatedUsage DECIMAL(10,2) DEFAULT 0.00 COMMENT '累计使用量',
    accumulatedCost DECIMAL(10,2) DEFAULT 0.00 COMMENT '累计成本',
    configuration_type VARCHAR(100) COMMENT '配置类型',
    configuration_data JSON COMMENT '配置数据(JSON格式)',
    version VARCHAR(50) COMMENT '版本号',
    status ENUM('启用', '禁用', '测试') DEFAULT '启用' COMMENT '状态',
    creator VARCHAR(100) COMMENT '创建者',
    updater VARCHAR(100) COMMENT '更新者',
    createTime DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updateTime DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_modelId (modelId),
    INDEX idx_modelType (modelType),
    INDEX idx_modelName (modelName),
    INDEX idx_containerId (containerId),
    INDEX idx_status (status),
    INDEX idx_createTime (createTime)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='型号配置表';

-- =====================================================
-- 17. AGENT CONFIGURATION TABLE (代理配置表) - UPDATED WITH MISSING COLUMNS
-- =====================================================
CREATE TABLE IF NOT EXISTS agent_configuration (
    id INT AUTO_INCREMENT PRIMARY KEY,
    agent_id VARCHAR(100) NOT NULL UNIQUE COMMENT '代理ID',
    agent_name VARCHAR(200) NOT NULL COMMENT '代理名称',
    ip_name VARCHAR(100) COMMENT 'IP名称',
    vad VARCHAR(100) COMMENT 'VAD配置',
    asr VARCHAR(100) COMMENT 'ASR配置',
    intent_recognition VARCHAR(100) COMMENT '意图识别配置',
    knowledge_base VARCHAR(100) COMMENT '知识库配置',
    llm VARCHAR(100) COMMENT 'LLM配置',
    memory VARCHAR(100) COMMENT '记忆配置',
    tools VARCHAR(100) COMMENT '工具配置',
    tts VARCHAR(100) COMMENT 'TTS配置',
    tts_combination_name VARCHAR(100) COMMENT 'TTS组合名称',
    ip_vcm VARCHAR(100) COMMENT 'IP VCM配置',
    vcm_combination_name VARCHAR(100) COMMENT 'VCM组合名称',
    agent_type VARCHAR(100) COMMENT '代理类型',
    configuration_data JSON COMMENT '配置数据(JSON格式)',
    status ENUM('启用', '禁用', '维护') DEFAULT '启用' COMMENT '状态',
    version VARCHAR(50) COMMENT '版本号',
    creator VARCHAR(100) COMMENT '创建者',
    updater VARCHAR(100) COMMENT '更新者',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_agent_id (agent_id),
    INDEX idx_agent_name (agent_name),
    INDEX idx_ip_name (ip_name),
    INDEX idx_agent_type (agent_type),
    INDEX idx_status (status),
    INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='代理配置表';

-- =====================================================
-- 18. TOOL CONFIGURATION TABLE (工具配置表) - FIXED TABLE NAME
-- =====================================================
-- CREATE TABLE IF NOT EXISTS toolconfiguration (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     toolId VARCHAR(100) NOT NULL UNIQUE COMMENT '工具ID',
--     toolName VARCHAR(200) NOT NULL COMMENT '工具名称',
--     toolType VARCHAR(100) COMMENT '工具类型',
--     configurationData JSON COMMENT '配置数据(JSON格式)',
--     status ENUM('启用', '禁用', '维护') DEFAULT '启用' COMMENT '状态',
--     version VARCHAR(50) COMMENT '版本号',
--     updater VARCHAR(100) COMMENT '更新者',
--     createTime DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
--     updateTime DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
--     INDEX idx_toolId (toolId),
--     INDEX idx_toolName (toolName),
--     INDEX idx_toolType (toolType),
--     INDEX idx_status (status),
--     INDEX idx_createTime (createTime)
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='工具配置表';
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

-- =====================================================
-- Insert sample data
-- =====================================================

-- Sample data for account_data
INSERT INTO account_data (
    member_id, phone_number, device_model, device_id, ip_role, product_id, commodity_id,
    voice_cloning_model_id, initial_activation_time, current_member_type, member_payment,
    member_activation_time, member_expiration_time, fourg_card_number, fourg_plan,
    remaining_data_current_month, fourg_payment, fourg_activation_time, fourg_expiration_time,
    annual_service_fee_balance, asr_usage, llm_usage, tts_usage, voice_clone_usage
) VALUES
('M001', '13800138001', 'HW-001', 'DEVICE_001', '小熊维尼', 'PROD_001', 'COMM_001', 'VOICE_001',
 '2024-01-15 10:30:00', 'VIP', 299.00, '2024-01-15 10:30:00', '2025-01-15 10:30:00',
 '4G_001', '无限流量套餐', 1024.00, 99.00, '2024-01-15 10:30:00', '2025-01-15 10:30:00',
 500.00, 100.50, 200.75, 150.25, 50.00);

-- Sample data for product_list
INSERT INTO product_list (
    serial_number, product_id, ip_role, product_model, product_name, product_type, color,
    production_batch, manufacturer, qr_code_file_directory, qr_code_exported,
    barcode_file_directory, barcode_exported, device_id, sub_account_id,
    file_export_time, first_binding_time, creator_id, creator_name
) VALUES
('SN001', 'PROD_001', '小熊维尼', 'HW-001', '小熊维尼智能玩具', '智能玩具', '黄色',
 'BATCH_2024_001', 'HeWan制造', '/qr/SN001.png', '是', '/barcode/SN001.png', '是',
 'DEVICE_001', 'SUB_001', '2024-01-15 10:30:00', '2024-01-15 10:30:00', 'ADMIN_001', '管理员');

-- Sample data for device_management
INSERT INTO device_management (
    device_id, bound_sub_account, device_model, production_batch, manufacturer,
    initial_firmware, latest_firmware, current_firmware_version, serial_number_code,
    chip_id, wifi_mac_address, bluetooth_mac_address, bluetooth_name, cellular_network_id,
    four_g_card_number, cpu_serial_number, creator
) VALUES
('DEVICE_001', 'SUB_001', 'HW-001', 'BATCH_2024_001', 'HeWan制造', 'v1.0.0', 'v1.2.0', 'v1.2.0',
 'SNC_001', 'CHIP_001', 'AA:BB:CC:DD:EE:01', 'FF:GG:HH:II:JJ:01', '小熊维尼_001',
 'CELL_001', '4G_001', 'CPU_001', 'ADMIN_001');

-- Sample data for device_type
INSERT INTO device_type (
    device_model_id, device_model_name, introduction, enable_4g, latest_firmware_version, updater
) VALUES
('DM_001', 'HW-001', '小熊维尼系列智能玩具，支持语音交互和情感表达', '是', 'v1.2.0', 'ADMIN_001');

-- Sample data for firmware
INSERT INTO firmware (
    device_model, release_version, version_number, description, file_path, file_size, creator
) VALUES
('HW-001', '正式版', 'v1.2.0', '小熊维尼固件v1.2.0，修复已知问题，提升性能', '/firmware/HW-001-v1.2.0.bin', 2048576, 'ADMIN_001');

-- Sample data for device_production
INSERT INTO device_production (
    production_device_id, device_model, production_batch, manufacturer, firmware_version,
    burn_firmware, unit_price, quantity, total_price
) VALUES
('PD_001', 'HW-001', 'BATCH_2024_001', 'HeWan制造', 'v1.2.0', 'v1.2.0', 299.00, 100, 29900.00);

-- Sample data for product_type
INSERT INTO product_type (
    product_id, product_model, product_name, product_type, color, product_details,
    device_model, ip_name, creator
) VALUES
('PROD_001', 'HW-001', '小熊维尼智能玩具', '智能玩具', '黄色', '小熊维尼系列智能玩具，支持语音交互和情感表达，适合3-8岁儿童', 'HW-001', '小熊维尼', 'ADMIN_001');

-- Sample data for toy_production_new
INSERT INTO toy_production_new (
    product_id, device_model, product_name, production_batch, manufacturer,
    unit_price, quantity, total_price, creator, updater
) VALUES
('PROD_001', 'HW-001', '小熊维尼智能玩具', 'BATCH_2024_001', 'HeWan制造', 299.00, 100, 29900.00, 'ADMIN_001', 'ADMIN_001');

-- Sample data for alarm - COMMENTED OUT TO AVOID DUPLICATE KEY CONFLICTS
-- INSERT INTO alarm (
--     alarmId, alarmName, alarmFileAddress, updater
-- ) VALUES
-- ('ALARM_001', '早晨闹钟', '/audio/alarm_001.wav', 'ADMIN_001');

-- Sample data for ip_management - UPDATED WITH NEW COLUMNS
INSERT INTO ip_management (
    ip_id, ip_name, ip_intro, ip_address, device_id, device_model, status, running,
    portrait, mbti, preference, agent_link, last_seen, creator, updater
) VALUES
('IP_001', '小熊维尼', '可爱的小熊维尼，喜欢蜂蜜和冒险', '192.168.1.101', 'DEVICE_001', 'HW-001', '在线', '金',
 '/images/winnie_portrait.png', 'ENFP', '喜欢蜂蜜、冒险、交朋友', 'http://agent.winnie.com', '2024-01-15 10:30:00', 'ADMIN_001', 'ADMIN_001');

-- Sample data for ipaudio - COMMENTED OUT TO AVOID COLUMN CONFLICTS
-- INSERT INTO ipaudio (
--     audio_id, ip_name, audio_name, audio_type, tags, emotion, language, audio_file_address, updater
-- ) VALUES
-- ('AUDIO_001', '小熊维尼', '小熊维尼主题曲', '主题曲', '音乐,主题曲,儿童', '快乐', '中文', '/audio/winnie_theme.wav', 'ADMIN_001');

-- Sample data for ipvideo - COMMENTED OUT TO AVOID DUPLICATE KEY CONFLICTS
-- INSERT INTO ipvideo (
--     videoId, ipName, videoName, scene, weather, emotion, timePeriod, tags, videoFileAddress, updater
-- ) VALUES
-- ('VIDEO_001', '小熊维尼', '小熊维尼故事', '森林', '晴天', '快乐', '白天', '故事,冒险,儿童', '/video/winnie_story.mp4', 'ADMIN_001');

-- Sample data for ipimage - COMMENTED OUT TO AVOID COLUMN CONFLICTS
-- INSERT INTO ipimage (
--     image_id, ip_name, image_name, scene, weather, emotion, time_period, tags, image_file_address, updater
-- ) VALUES
-- ('IMAGE_001', '小熊维尼', '小熊维尼头像', '森林', '晴天', '快乐', '白天', '头像,可爱,儿童', '/images/winnie_avatar.png', 'ADMIN_001');

-- Sample data for ipmusic - COMMENTED OUT TO AVOID DUPLICATE KEY CONFLICTS
-- INSERT INTO ipmusic (
--     musicId, musicName, musicType, singer, tags, musicFileAddress, updater
-- ) VALUES
-- ('MUSIC_001', '小熊维尼摇篮曲', '摇篮曲', 'HeWan音乐', '音乐,摇篮曲,儿童,睡眠', '/music/winnie_lullaby.mp3', 'ADMIN_001');

-- Sample data for bom - COMMENTED OUT TO AVOID DUPLICATE KEY CONFLICTS
-- INSERT INTO bom (
--     bom_id, product_model, component_name, component_type, quantity, unit_price, total_price,
--     supplier, part_number, description, creator
-- ) VALUES
-- ('BOM_001', 'HW-001', '主控芯片', '电子元件', 1, 50.00, 50.00, '芯片供应商', 'MCU_001', '32位ARM主控芯片', 'ADMIN_001');

-- Sample data for model_configuration - COMMENTED OUT TO AVOID DUPLICATE KEY CONFLICTS
-- INSERT INTO model_configuration (
--     modelId, modelType, modelName, containerId, versionNumber, apiUrl, localModelFileDir, 
--     remainingTrainingTimes, buildTime, enableTime, billingUnit, unitCost, accumulatedUsage, 
--     accumulatedCost, configuration_type, configuration_data, version, status, creator, updater
-- ) VALUES
-- ('MC_001', '语音模型', 'HW-001语音配置', 'CONTAINER_001', 'v1.0', 'http://api.hewan.com/v1', '/models/hw001', 
--  100, '2024-01-15 10:30:00', '2024-01-15 10:30:00', '次', 0.01, 1000.00, 10.00, 
--  '语音配置', '{"voice_speed": 1.0, "voice_pitch": 1.0, "voice_volume": 0.8}', 'v1.0', '启用', 'ADMIN_001', 'ADMIN_001');

-- Sample data for agent_configuration - COMMENTED OUT TO AVOID DUPLICATE KEY CONFLICTS
-- INSERT INTO agent_configuration (
--     agent_id, agent_name, ip_name, vad, asr, intent_recognition, knowledge_base, llm, memory, tools, tts, tts_combination_name, ip_vcm, vcm_combination_name, agent_type, configuration_data, status, version, creator, updater
-- ) VALUES
-- ('AGENT_001', '小熊维尼代理', '小熊维尼', 'VAD_001', 'ASR_001', 'INTENT_001', 'KB_001', 'LLM_001', 'MEM_001', 'TOOL_001', 'TTS_001', 'TTS_COMBO_001', 'VCM_001', 'VCM_COMBO_001', '语音代理', '{"personality": "friendly", "response_speed": "normal", "language": "chinese"}', '启用', 'v1.0', 'ADMIN_001', 'ADMIN_001');

-- Sample data for toolconfiguration - COMMENTED OUT TO AVOID DUPLICATE KEY CONFLICTS
-- INSERT INTO toolconfiguration (
--     toolId, toolName, toolType, configurationData, status, version, updater
-- ) VALUES
-- ('TOOL_001', '语音识别工具', '语音工具', '{"accuracy": 0.95, "language": "chinese", "noise_reduction": true}', '启用', 'v1.0', 'ADMIN_001');

-- =====================================================
-- Show all tables
-- =====================================================
SHOW TABLES;

-- =====================================================
-- Verify data insertion
-- =====================================================
SELECT 'Account Data' as table_name, COUNT(*) as record_count FROM account_data
UNION ALL
SELECT 'Product List' as table_name, COUNT(*) as record_count FROM product_list
UNION ALL
SELECT 'Device Management' as table_name, COUNT(*) as record_count FROM device_management
UNION ALL
SELECT 'Device Type' as table_name, COUNT(*) as record_count FROM device_type
UNION ALL
SELECT 'Firmware' as table_name, COUNT(*) as record_count FROM firmware
UNION ALL
SELECT 'Device Production' as table_name, COUNT(*) as record_count FROM device_production
UNION ALL
SELECT 'Product Type' as table_name, COUNT(*) as record_count FROM product_type
UNION ALL
SELECT 'Toy Production' as table_name, COUNT(*) as record_count FROM toy_production_new
UNION ALL
SELECT 'Alarm' as table_name, COUNT(*) as record_count FROM alarm
UNION ALL
SELECT 'IP Management' as table_name, COUNT(*) as record_count FROM ip_management
UNION ALL
SELECT 'IP Audio' as table_name, COUNT(*) as record_count FROM ipaudio
UNION ALL
SELECT 'IP Video' as table_name, COUNT(*) as record_count FROM ipvideo
UNION ALL
SELECT 'IP Image' as table_name, COUNT(*) as record_count FROM ipimage
UNION ALL
SELECT 'IP Music' as table_name, COUNT(*) as record_count FROM ipmusic
UNION ALL
SELECT 'BOM' as table_name, COUNT(*) as record_count FROM bom
UNION ALL
SELECT 'Model Configuration' as table_name, COUNT(*) as record_count FROM model_configuration
UNION ALL
SELECT 'Agent Configuration' as table_name, COUNT(*) as record_count FROM agent_configuration
UNION ALL
SELECT 'Tool Configuration' as table_name, COUNT(*) as record_count FROM toolconfiguration;