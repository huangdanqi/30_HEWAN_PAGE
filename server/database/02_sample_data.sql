-- =====================================================
-- Sample Data for HeWan Page Server Database
-- =====================================================

USE hewan_page_server;

-- =====================================================
-- 1. SAMPLE ACCOUNT DATA (账户数据示例)
-- =====================================================
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
 500.00, 100.50, 200.75, 150.25, 50.00),

('M002', '13800138002', 'HW-002', 'DEVICE_002', '米老鼠', 'PROD_002', 'COMM_002', 'VOICE_002',
 '2024-02-20 14:20:00', '标准', 199.00, '2024-02-20 14:20:00', '2025-02-20 14:20:00',
 '4G_002', '标准流量套餐', 512.00, 79.00, '2024-02-20 14:20:00', '2025-02-20 14:20:00',
 300.00, 80.25, 150.50, 100.75, 30.00),

('M003', '13800138003', 'HW-003', 'DEVICE_003', '唐老鸭', 'PROD_003', 'COMM_003', 'VOICE_003',
 '2024-03-10 09:15:00', 'VIP', 399.00, '2024-03-10 09:15:00', '2025-03-10 09:15:00',
 '4G_003', '无限流量套餐', 2048.00, 99.00, '2024-03-10 09:15:00', '2025-03-10 09:15:00',
 800.00, 200.00, 300.00, 250.00, 75.00);

-- =====================================================
-- 2. SAMPLE PRODUCT LIST DATA (产品列表示例)
-- =====================================================
INSERT INTO product_list (
    serial_number, product_id, ip_role, product_model, product_name, product_type, color,
    production_batch, manufacturer, qr_code_file_directory, qr_code_exported,
    barcode_file_directory, barcode_exported, device_id, sub_account_id,
    file_export_time, first_binding_time, creator_id, creator_name
) VALUES
('SN001', 'PROD_001', '小熊维尼', 'HW-001', '小熊维尼智能玩具', '智能玩具', '黄色',
 'BATCH_2024_001', 'HeWan制造', '/qr/SN001.png', '是', '/barcode/SN001.png', '是',
 'DEVICE_001', 'SUB_001', '2024-01-15 10:30:00', '2024-01-15 10:30:00', 'ADMIN_001', '管理员'),

('SN002', 'PROD_002', '米老鼠', 'HW-002', '米老鼠智能玩具', '智能玩具', '黑色',
 'BATCH_2024_002', 'HeWan制造', '/qr/SN002.png', '是', '/barcode/SN002.png', '是',
 'DEVICE_002', 'SUB_002', '2024-02-20 14:20:00', '2024-02-20 14:20:00', 'ADMIN_001', '管理员'),

('SN003', 'PROD_003', '唐老鸭', 'HW-003', '唐老鸭智能玩具', '智能玩具', '蓝色',
 'BATCH_2024_003', 'HeWan制造', '/qr/SN003.png', '是', '/barcode/SN003.png', '是',
 'DEVICE_003', 'SUB_003', '2024-03-10 09:15:00', '2024-03-10 09:15:00', 'ADMIN_001', '管理员');

-- =====================================================
-- 3. SAMPLE DEVICE MANAGEMENT DATA (设备管理示例)
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
-- 4. SAMPLE DEVICE TYPE DATA (设备型号示例)
-- =====================================================
INSERT INTO device_type (
    device_model_id, device_model_name, introduction, enable_4g, latest_firmware_version, updater
) VALUES
('DM_001', 'HW-001', '小熊维尼系列智能玩具，支持语音交互和情感表达', '是', 'v1.2.0', 'ADMIN_001'),
('DM_002', 'HW-002', '米老鼠系列智能玩具，具备丰富的互动功能', '是', 'v1.2.0', 'ADMIN_001'),
('DM_003', 'HW-003', '唐老鸭系列智能玩具，专为儿童设计的安全智能玩具', '是', 'v1.2.0', 'ADMIN_001');

-- =====================================================
-- 5. SAMPLE FIRMWARE DATA (固件管理示例)
-- =====================================================
INSERT INTO firmware (
    device_model, release_version, version_number, description, file_path, file_size, creator
) VALUES
('HW-001', '正式版', 'v1.2.0', '小熊维尼固件v1.2.0，修复已知问题，提升性能', '/firmware/HW-001-v1.2.0.bin', 2048576, 'ADMIN_001'),
('HW-001', '测试版', 'v1.2.1-beta', '小熊维尼固件v1.2.1测试版，新增功能测试', '/firmware/HW-001-v1.2.1-beta.bin', 2097152, 'ADMIN_001'),
('HW-002', '正式版', 'v1.2.0', '米老鼠固件v1.2.0，优化语音识别算法', '/firmware/HW-002-v1.2.0.bin', 2048576, 'ADMIN_001'),
('HW-003', '正式版', 'v1.2.0', '唐老鸭固件v1.2.0，增强安全性功能', '/firmware/HW-003-v1.2.0.bin', 2048576, 'ADMIN_001');

-- =====================================================
-- 6. SAMPLE DEVICE PRODUCTION DATA (设备生产示例)
-- =====================================================
INSERT INTO device_production (
    production_device_id, device_model, production_batch, manufacturer, firmware_version,
    burn_firmware, unit_price, quantity, total_price
) VALUES
('PD_001', 'HW-001', 'BATCH_2024_001', 'HeWan制造', 'v1.2.0', 'v1.2.0', 299.00, 100, 29900.00),
('PD_002', 'HW-002', 'BATCH_2024_002', 'HeWan制造', 'v1.2.0', 'v1.2.0', 299.00, 150, 44850.00),
('PD_003', 'HW-003', 'BATCH_2024_003', 'HeWan制造', 'v1.2.0', 'v1.2.0', 299.00, 80, 23920.00);

-- =====================================================
-- 7. SAMPLE PRODUCT TYPE DATA (产品型号示例)
-- =====================================================
INSERT INTO product_type (
    product_id, product_model, product_name, product_type, color, product_details,
    device_model, ip_name, creator
) VALUES
('PROD_001', 'HW-001', '小熊维尼智能玩具', '智能玩具', '黄色', '小熊维尼系列智能玩具，支持语音交互和情感表达，适合3-8岁儿童', 'HW-001', '小熊维尼', 'ADMIN_001'),
('PROD_002', 'HW-002', '米老鼠智能玩具', '智能玩具', '黑色', '米老鼠系列智能玩具，具备丰富的互动功能，支持多种游戏模式', 'HW-002', '米老鼠', 'ADMIN_001'),
('PROD_003', 'HW-003', '唐老鸭智能玩具', '智能玩具', '蓝色', '唐老鸭系列智能玩具，专为儿童设计的安全智能玩具，具备防水功能', 'HW-003', '唐老鸭', 'ADMIN_001');

-- =====================================================
-- 8. SAMPLE TOY PRODUCTION DATA (玩具生产示例)
-- =====================================================
INSERT INTO toy_production_new (
    product_id, device_model, product_name, production_batch, manufacturer,
    unit_price, quantity, total_price, creator, updater
) VALUES
('PROD_001', 'HW-001', '小熊维尼智能玩具', 'BATCH_2024_001', 'HeWan制造', 299.00, 100, 29900.00, 'ADMIN_001', 'ADMIN_001'),
('PROD_002', 'HW-002', '米老鼠智能玩具', 'BATCH_2024_002', 'HeWan制造', 299.00, 150, 44850.00, 'ADMIN_001', 'ADMIN_001'),
('PROD_003', 'HW-003', '唐老鸭智能玩具', 'BATCH_2024_003', 'HeWan制造', 299.00, 80, 23920.00, 'ADMIN_001', 'ADMIN_001');

-- =====================================================
-- 9. SAMPLE ALARM DATA (闹钟示例)
-- =====================================================
INSERT INTO alarm (
    alarmId, alarmName, alarmFileAddress, updater
) VALUES
('ALARM_001', '早晨闹钟', '/audio/alarm_001.wav', 'ADMIN_001'),
('ALARM_002', '午睡闹钟', '/audio/alarm_002.wav', 'ADMIN_001'),
('ALARM_003', '晚安闹钟', '/audio/alarm_003.wav', 'ADMIN_001');

-- =====================================================
-- 10. SAMPLE IP MANAGEMENT DATA (IP管理示例)
-- =====================================================
INSERT INTO ip_management (
    ip_address, device_id, device_model, status, last_seen, creator
) VALUES
('192.168.1.101', 'DEVICE_001', 'HW-001', '在线', '2024-01-15 10:30:00', 'ADMIN_001'),
('192.168.1.102', 'DEVICE_002', 'HW-002', '在线', '2024-02-20 14:20:00', 'ADMIN_001'),
('192.168.1.103', 'DEVICE_003', 'HW-003', '离线', '2024-03-10 09:15:00', 'ADMIN_001');

-- =====================================================
-- 11. SAMPLE IP AUDIO DATA (IP音频示例)
-- =====================================================
INSERT INTO ip_audio (
    audio_id, audio_name, audio_file_address, audio_type, duration, file_size, creator
) VALUES
('AUDIO_001', '小熊维尼主题曲', '/audio/winnie_theme.wav', '主题曲', 180, 2048576, 'ADMIN_001'),
('AUDIO_002', '米老鼠主题曲', '/audio/mickey_theme.wav', '主题曲', 180, 2048576, 'ADMIN_001'),
('AUDIO_003', '唐老鸭主题曲', '/audio/donald_theme.wav', '主题曲', 180, 2048576, 'ADMIN_001');

-- =====================================================
-- 12. SAMPLE IP VIDEO DATA (IP视频示例)
-- =====================================================
INSERT INTO ip_video (
    video_id, video_name, video_file_address, video_type, duration, file_size, resolution, creator
) VALUES
('VIDEO_001', '小熊维尼故事', '/video/winnie_story.mp4', '故事', 300, 10485760, '1920x1080', 'ADMIN_001'),
('VIDEO_002', '米老鼠故事', '/video/mickey_story.mp4', '故事', 300, 10485760, '1920x1080', 'ADMIN_001'),
('VIDEO_003', '唐老鸭故事', '/video/donald_story.mp4', '故事', 300, 10485760, '1920x1080', 'ADMIN_001');

-- =====================================================
-- 13. SAMPLE IP IMAGE DATA (IP图片示例)
-- =====================================================
INSERT INTO ip_image (
    image_id, image_name, image_file_address, image_type, file_size, resolution, creator
) VALUES
('IMAGE_001', '小熊维尼头像', '/images/winnie_avatar.png', '头像', 102400, '512x512', 'ADMIN_001'),
('IMAGE_002', '米老鼠头像', '/images/mickey_avatar.png', '头像', 102400, '512x512', 'ADMIN_001'),
('IMAGE_003', '唐老鸭头像', '/images/donald_avatar.png', '头像', 102400, '512x512', 'ADMIN_001');

-- =====================================================
-- 14. SAMPLE IP MUSIC DATA (IP音乐示例)
-- =====================================================
INSERT INTO ip_music (
    music_id, music_name, music_file_address, music_type, duration, file_size, artist, album, creator
) VALUES
('MUSIC_001', '小熊维尼摇篮曲', '/music/winnie_lullaby.mp3', '摇篮曲', 180, 2048576, 'HeWan音乐', '儿童音乐集', 'ADMIN_001'),
('MUSIC_002', '米老鼠欢乐歌', '/music/mickey_happy.mp3', '欢乐歌', 180, 2048576, 'HeWan音乐', '儿童音乐集', 'ADMIN_001'),
('MUSIC_003', '唐老鸭冒险曲', '/music/donald_adventure.mp3', '冒险曲', 180, 2048576, 'HeWan音乐', '儿童音乐集', 'ADMIN_001');

-- =====================================================
-- 15. SAMPLE BOM DATA (物料清单示例)
-- =====================================================
INSERT INTO bom (
    bom_id, product_model, component_name, component_type, quantity, unit_price, total_price,
    supplier, part_number, description, creator
) VALUES
('BOM_001', 'HW-001', '主控芯片', '电子元件', 1, 50.00, 50.00, '芯片供应商', 'MCU_001', '32位ARM主控芯片', 'ADMIN_001'),
('BOM_002', 'HW-001', '扬声器', '音频元件', 1, 15.00, 15.00, '音频供应商', 'SPK_001', '8欧姆2瓦扬声器', 'ADMIN_001'),
('BOM_003', 'HW-001', '电池', '电源元件', 1, 25.00, 25.00, '电池供应商', 'BAT_001', '3.7V 2000mAh锂电池', 'ADMIN_001');

-- =====================================================
-- 16. SAMPLE MODEL CONFIGURATION DATA (型号配置示例)
-- =====================================================
INSERT INTO model_configuration (
    model_id, model_name, configuration_type, configuration_data, version, status, creator
) VALUES
('MC_001', 'HW-001配置', '语音配置', '{"voice_speed": 1.0, "voice_pitch": 1.0, "voice_volume": 0.8}', 'v1.0', '启用', 'ADMIN_001'),
('MC_002', 'HW-002配置', '游戏配置', '{"game_difficulty": "normal", "max_play_time": 30, "sound_enabled": true}', 'v1.0', '启用', 'ADMIN_001'),
('MC_003', 'HW-003配置', '安全配置', '{"parental_control": true, "max_volume": 0.7, "time_limit": 60}', 'v1.0', '启用', 'ADMIN_001');

-- =====================================================
-- 17. SAMPLE AGENT CONFIGURATION DATA (代理配置示例)
-- =====================================================
INSERT INTO agent_configuration (
    agent_id, agent_name, agent_type, configuration_data, status, version, creator
) VALUES
('AGENT_001', '小熊维尼代理', '语音代理', '{"personality": "friendly", "response_speed": "normal", "language": "chinese"}', '启用', 'v1.0', 'ADMIN_001'),
('AGENT_002', '米老鼠代理', '游戏代理', '{"game_mode": "interactive", "difficulty": "adaptive", "rewards": true}', '启用', 'v1.0', 'ADMIN_001'),
('AGENT_003', '唐老鸭代理', '教育代理', '{"learning_level": "beginner", "subjects": ["math", "language"], "progress_tracking": true}', '启用', 'v1.0', 'ADMIN_001');

-- =====================================================
-- 18. SAMPLE TOOL CONFIGURATION DATA (工具配置示例)
-- =====================================================
INSERT INTO tool_configuration (
    tool_id, tool_name, tool_type, configuration_data, status, version, creator
) VALUES
('TOOL_001', '语音识别工具', '语音工具', '{"accuracy": 0.95, "language": "chinese", "noise_reduction": true}', '启用', 'v1.0', 'ADMIN_001'),
('TOOL_002', '情感分析工具', '分析工具', '{"sentiment_levels": 5, "confidence_threshold": 0.8, "real_time": true}', '启用', 'v1.0', 'ADMIN_001'),
('TOOL_003', '内容过滤工具', '安全工具', '{"filter_level": "strict", "keywords": ["暴力", "色情"], "auto_block": true}', '启用', 'v1.0', 'ADMIN_001');

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
SELECT 'IP Audio' as table_name, COUNT(*) as record_count FROM ip_audio
UNION ALL
SELECT 'IP Video' as table_name, COUNT(*) as record_count FROM ip_video
UNION ALL
SELECT 'IP Image' as table_name, COUNT(*) as record_count FROM ip_image
UNION ALL
SELECT 'IP Music' as table_name, COUNT(*) as record_count FROM ip_music
UNION ALL
SELECT 'BOM' as table_name, COUNT(*) as record_count FROM bom
UNION ALL
SELECT 'Model Configuration' as table_name, COUNT(*) as record_count FROM model_configuration
UNION ALL
SELECT 'Agent Configuration' as table_name, COUNT(*) as record_count FROM agent_configuration
UNION ALL
SELECT 'Tool Configuration' as table_name, COUNT(*) as record_count FROM tool_configuration;
