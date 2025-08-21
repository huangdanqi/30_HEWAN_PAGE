-- Add creator_name column to product_list table
ALTER TABLE product_list ADD COLUMN creator_name VARCHAR(100) AFTER creator_id;

-- Update existing records to set creator_name based on creator_id
-- This will set a default value for existing records
UPDATE product_list SET creator_name = '管理员' WHERE creator_name IS NULL OR creator_name = '';

-- Make the column NOT NULL after setting default values
ALTER TABLE product_list MODIFY COLUMN creator_name VARCHAR(100) NOT NULL DEFAULT '管理员';

-- Add index for better performance
CREATE INDEX idx_creator_name ON product_list(creator_name);
