-- Update existing device_production records to set creator field
-- This script will set creator to '管理员' for existing records that don't have it

UPDATE device_production 
SET creator = '管理员' 
WHERE creator IS NULL OR creator = '';

-- Verify the update
SELECT id, device_model, production_batch, manufacturer, creator, updater 
FROM device_production 
LIMIT 10;
