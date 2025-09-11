-- Step 1: Check what data currently exists in the running column
SELECT DISTINCT running FROM ip_management WHERE running IS NOT NULL;

-- Step 2: Update existing data to match new ENUM values
-- If there are existing '是' or '否' values, we need to convert them
-- For now, let's set them to a default Five Elements value

-- First, let's see what's in the table
SELECT id, ip_id, ip_name, running FROM ip_management LIMIT 10;

-- Step 3: Update existing records to use valid Five Elements values
-- This will convert any existing '是'/'否' values to '金' (default)
UPDATE ip_management 
SET running = '金' 
WHERE running NOT IN ('金', '木', '水', '火', '土');

-- Step 4: Now we can safely modify the column
ALTER TABLE ip_management 
MODIFY COLUMN running ENUM('金', '木', '水', '火', '土') DEFAULT '金' COMMENT '五行';

-- Step 5: Verify the change worked
DESCRIBE ip_management;
SELECT DISTINCT running FROM ip_management;
