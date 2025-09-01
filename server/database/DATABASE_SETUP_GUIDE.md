# HeWan Page Server Database Setup Guide

This directory contains all the MySQL SQL files needed to set up the database for the HeWan Page Server application.

## Files Overview

### 1. `01_create_database.sql`
- **Purpose**: Creates all database tables with proper structure
- **Contains**: Complete table creation scripts for all 18 tables
- **Usage**: Run this first to create the database schema

### 2. `02_sample_data.sql`
- **Purpose**: Inserts sample data into all tables
- **Contains**: Realistic sample data for testing and development
- **Usage**: Run after creating tables to populate with sample data

### 3. `setup_complete_database.sql`
- **Purpose**: Complete setup script that does everything
- **Contains**: Table creation + sample data insertion
- **Usage**: Run this single file to set up the entire database

### 4. Individual Route Files
- `accounts.sql` - Account management table and queries
- `product_list.sql` - Product list management
- `device_management.sql` - Device management operations
- `firmware.sql` - Firmware management
- And more...

## Quick Setup Instructions

### Option 1: Complete Setup (Recommended)
```bash
# Run the complete setup script
mysql -u your_username -p < setup_complete_database.sql
```

### Option 2: Step-by-Step Setup
```bash
# 1. Create database and tables
mysql -u your_username -p < 01_create_database.sql

# 2. Insert sample data
mysql -u your_username -p < 02_sample_data.sql
```

### Option 3: Individual Route Setup
```bash
# Set up specific route tables
mysql -u your_username -p < accounts.sql
mysql -u your_username -p < product_list.sql
mysql -u your_username -p < device_management.sql
# ... etc
```

## Database Structure

The database contains 18 tables corresponding to different routes:

1. **account_data** - User account management
2. **product_list** - Product inventory management
3. **device_management** - Device tracking and configuration
4. **device_type** - Device model specifications
5. **firmware** - Firmware version management
6. **device_production** - Production tracking
7. **product_type** - Product specifications
8. **toy_production_new** - Toy production records
9. **alarm** - Alarm system management
10. **ip_management** - IP address tracking
11. **ip_audio** - Audio file management
12. **ip_video** - Video file management
13. **ip_image** - Image file management
14. **ip_music** - Music file management
15. **bom** - Bill of materials
16. **model_configuration** - Model configuration settings
17. **agent_configuration** - Agent configuration settings
18. **tool_configuration** - Tool configuration settings

## Table Relationships

- **product_list** ↔ **device_management** (via device_id)
- **product_list** ↔ **product_type** (via product_id)
- **device_management** ↔ **device_type** (via device_model)
- **device_management** ↔ **firmware** (via device_model)
- **ip_management** ↔ **device_management** (via device_id)

## Sample Data

The sample data includes:
- 3 sample accounts with different membership types
- 3 sample products (小熊维尼, 米老鼠, 唐老鸭)
- 3 sample devices with different configurations
- Sample firmware versions for each device model
- Sample IP resources (audio, video, images, music)
- Sample configurations for models, agents, and tools

## Common Queries

Each individual route file contains common SQL queries used by that route:

- **SELECT** queries for data retrieval
- **INSERT** queries for creating new records
- **UPDATE** queries for modifying existing records
- **DELETE** queries for removing records
- **Search** queries with LIKE operators

## Database Configuration

- **Character Set**: utf8mb4
- **Collation**: utf8mb4_unicode_ci
- **Engine**: InnoDB
- **Indexes**: Optimized for common query patterns

## Troubleshooting

### Common Issues:

1. **Character Encoding**: Ensure your MySQL server supports utf8mb4
2. **Permissions**: Make sure your MySQL user has CREATE and INSERT privileges
3. **Existing Data**: The scripts use `CREATE TABLE IF NOT EXISTS` to avoid conflicts

### Verification:

After running the setup, verify the installation:
```sql
USE hewan_page_server;
SHOW TABLES;
SELECT COUNT(*) FROM account_data;
SELECT COUNT(*) FROM product_list;
-- etc...
```

## Development Notes

- All tables include proper indexes for performance
- Timestamps are automatically managed (create_time, update_time)
- Foreign key relationships are maintained through application logic
- Sample data uses realistic values for testing

## API Integration

These database structures correspond directly to the API routes in:
- `server/routes/accounts.js`
- `server/routes/productList.js`
- `server/routes/deviceManagement.js`
- And all other route files

Each route file contains the exact SQL queries used by the corresponding API endpoints.
