-- Fix the running column in ip_management table to match frontend data
-- The frontend sends Five Elements (五行) values: 金, 木, 水, 火, 土
-- But the database expects Yes/No values: 是, 否

-- Update the running column to accept Five Elements values
ALTER TABLE ip_management 
MODIFY COLUMN running ENUM('金', '木', '水', '火', '土') DEFAULT '金' COMMENT '五行';

-- If you want to keep the original Yes/No functionality, you could:
-- 1. Rename the current column to something else like 'is_running'
-- 2. Add a new column for Five Elements

-- Alternative approach - rename and add new column:
-- ALTER TABLE ip_management CHANGE running is_running ENUM('是', '否') DEFAULT '否' COMMENT '是否运行';
-- ALTER TABLE ip_management ADD COLUMN five_elements ENUM('金', '木', '水', '火', '土') DEFAULT '金' COMMENT '五行' AFTER is_running;
