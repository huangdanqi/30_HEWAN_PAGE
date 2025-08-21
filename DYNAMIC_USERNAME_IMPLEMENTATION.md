# Dynamic Username Implementation for ProductList

This document explains how the dynamic username functionality has been implemented in the ProductList system.

## Overview

The system now dynamically uses the current user's username from the authentication store when creating products, instead of hardcoded values. This affects both the "创建人" (Creator) column display and the data sent to MySQL.

## Changes Made

### 1. Frontend Changes (ProductList.vue)

#### Authentication Store Integration
- Added `useAuthStore()` import and usage
- Created computed properties for current user:
  - `currentUserId`: Gets the current user's ID
  - `currentUserName`: Gets the current user's name/username

#### Data Structure Updates
- Added `creatorName` field to the `DataItem` interface
- Updated data mapping to include `creatorName` from backend response

#### Table Display Updates
- Modified the "创建人" column to show the actual username instead of just the ID
- Priority order for display:
  1. `creatorName` from database (if available)
  2. Current user's name (if `creatorId` matches current user)
  3. Numeric ID as fallback

#### Batch Creation Updates
- When creating products via "批量新增", the system now:
  - Sets `creatorId` to the current user's ID
  - Sets `creatorName` to the current user's name
  - Sends both fields to the backend

### 2. Backend Changes (productList.js)

#### Database Schema Updates
- Added `creator_name` column to the `product_list` table
- Updated all INSERT, UPDATE, and SELECT operations to include `creator_name`

#### Route Updates
- **POST /**: Now accepts and stores `creator_name`
- **POST /batch-add**: Includes `creator_name` in batch creation
- **PUT /:id**: Updates can now modify `creator_name`
- **GET /**: Returns `creator_name` in product data
- **POST /test-create**: Test route includes `creator_name`

### 3. Database Migration

#### SQL Script (add_creator_name_column.sql)
```sql
-- Add creator_name column to product_list table
ALTER TABLE product_list ADD COLUMN creator_name VARCHAR(100) AFTER creator_id;

-- Update existing records to set creator_name based on creator_id
UPDATE product_list SET creator_name = '管理员' WHERE creator_name IS NULL OR creator_name = '';

-- Make the column NOT NULL after setting default values
ALTER TABLE product_list MODIFY COLUMN creator_name VARCHAR(100) NOT NULL DEFAULT '管理员';

-- Add index for better performance
CREATE INDEX idx_creator_name ON product_list(creator_name);
```

#### Migration Scripts
- `run_migration.bat` - Windows batch file
- `run_migration.ps1` - PowerShell script

## How It Works

### 1. User Authentication
- When a user logs in, their information is stored in the auth store
- This includes `id`, `username`, and `name` fields

### 2. Product Creation
- When creating products (single or batch), the system:
  - Gets the current user's ID and name from the auth store
  - Sets `creatorId` to the user's ID
  - Sets `creatorName` to the user's name
  - Sends both fields to the backend

### 3. Data Display
- The "创建人" column now shows:
  - The actual username if `creatorName` is available in the database
  - Falls back to the current user's name if the `creatorId` matches
  - Shows the numeric ID as a final fallback

### 4. Database Storage
- Both `creator_id` (numeric) and `creator_name` (string) are stored
- This provides flexibility and better user experience

## Implementation Steps

### 1. Run Database Migration
```bash
# Option 1: Using the batch file
run_migration.bat

# Option 2: Using PowerShell
.\run_migration.ps1

# Option 3: Manual MySQL command
mysql -u root -p your_database_name < add_creator_name_column.sql
```

### 2. Restart Backend Server
- The backend routes have been updated to handle the new field
- Restart the server to ensure changes take effect

### 3. Test the Functionality
- Create a new product using "批量新增"
- Verify that the "创建人" column shows your username
- Check the database to confirm both `creator_id` and `creator_name` are stored

## Benefits

1. **User Experience**: Users can see actual usernames instead of numeric IDs
2. **Audit Trail**: Clear tracking of who created each product
3. **Flexibility**: Maintains both ID and name for different use cases
4. **Consistency**: All new products will have proper creator information

## Notes

- Existing products will have `creator_name` set to '管理员' (Administrator)
- The system gracefully falls back to ID display if username is not available
- Both `creator_id` and `creator_name` are sent to the backend for new products
- The frontend automatically refreshes to show updated creator information

## Troubleshooting

### Common Issues

1. **Migration Fails**: Ensure MySQL is running and accessible
2. **Column Already Exists**: The migration script handles this gracefully
3. **Frontend Shows IDs**: Check that the auth store has user information
4. **Backend Errors**: Verify the server has been restarted after changes

### Verification

To verify the implementation is working:

1. Check the database: `DESCRIBE product_list;` should show `creator_name` column
2. Create a test product and verify both fields are populated
3. Check the frontend table shows the username in the "创建人" column
4. Verify the data is being sent correctly in network requests
