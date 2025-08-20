-- Clean up test data that was accidentally inserted during connectivity testing
DELETE FROM device_management 
WHERE device_id LIKE 'TEST_CONNECTIVITY_%' 
   OR device_id LIKE 'CONNECTIVITY_TEST_%'
   OR device_model = 'TEST_MODEL'
   OR manufacturer = 'TEST_MANUFACTURER';

-- Show what was cleaned up
SELECT 'Test data cleanup completed' as status;
