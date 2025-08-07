# Database Setup and API Documentation

This document provides information about the database tables and API endpoints for the HeWan Page application.

## Database Tables

### 1. device_type (设备型号表)
Stores device model information including specifications and firmware versions.

**Columns:**
- `id` - Primary key
- `device_model_id` - Device model ID
- `device_model_name` - Device model name (unique)
- `introduction` - Device introduction/description
- `enable_4g` - Whether 4G is enabled (是/否)
- `latest_firmware_version` - Latest available firmware version
- `updater` - Person who updated the record
- `create_time` - Creation timestamp
- `update_time` - Last update timestamp

### 2. firmware (固件管理表)
Manages firmware versions for different device models.

**Columns:**
- `id` - Primary key
- `device_model` - Device model name
- `release_version` - Release version type
- `version_number` - Specific version number
- `description` - Firmware description
- `creator` - Person who created the firmware
- `release_time` - Release timestamp
- `update_time` - Last update timestamp

### 3. device_production (设备生产表)
Tracks device production batches and manufacturing information.

**Columns:**
- `id` - Primary key
- `production_device_id` - Production device ID
- `device_model` - Device model name
- `production_batch` - Production batch date
- `manufacturer` - Manufacturer name
- `firmware_version` - Firmware version used
- `burn_firmware` - Firmware burned during production
- `unit_price` - Unit price (元)
- `quantity` - Production quantity
- `total_price` - Calculated total price (unit_price * quantity)
- `create_time` - Creation timestamp
- `update_time` - Last update timestamp

### 4. device_management (设备管理表)
Manages individual device instances and their configurations.

**Columns:**
- `id` - Primary key
- `device_id` - Unique device ID
- `bound_sub_account` - Bound sub-account
- `device_model` - Device model name
- `production_batch` - Production batch date
- `manufacturer` - Manufacturer name
- `initial_firmware` - Initial firmware version
- `latest_firmware` - Latest available firmware
- `current_firmware_version` - Current firmware version
- `serial_number_code` - Serial number code
- `chip_id` - Chip ID
- `wifi_mac_address` - WiFi MAC address
- `bluetooth_mac_address` - Bluetooth MAC address
- `bluetooth_name` - Bluetooth device name
- `cellular_network_id` - Cellular network ID
- `four_g_card_number` - 4G card number
- `cpu_serial_number` - CPU serial number
- `creator` - Person who created the record
- `create_time` - Creation timestamp
- `update_time` - Last update timestamp

### 5. product_type (产品型号表)
Manages product types and their specifications.

**Columns:**
- `id` - Primary key
- `product_id` - Product ID (unique)
- `product_model` - Product model (unique)
- `product_name` - Product name
- `product_type` - Product type category
- `color` - Product color
- `product_details` - Product details/description
- `device_model` - Associated device model
- `ip_name` - IP name reference
- `creator` - Person who created the record
- `create_time` - Creation timestamp
- `update_time` - Last update timestamp

### 6. product_list (商品列表表)
Manages product inventory and customer information.

**Columns:**
- `id` - Primary key
- `product_id` - Product ID (unique)
- `product_name` - Product name
- `product_code` - Product code
- `product_name2` - Secondary product name
- `product_type` - Product type
- `color` - Product color
- `member_type` - Member type (普通会员/VIP/SVIP)
- `device_id` - Associated device ID
- `sub_account_id` - Sub-account ID
- `activation_time` - Activation timestamp
- `update_time` - Last update timestamp

## API Endpoints

### Device Type API (`/api/device-type`)
- `GET /` - Get all device types
- `GET /:id` - Get device type by ID
- `POST /` - Create new device type
- `PUT /:id` - Update device type
- `DELETE /:id` - Delete device type

### Firmware API (`/api/firmware`)
- `GET /` - Get all firmware records
- `GET /:id` - Get firmware by ID
- `GET /device/:deviceModel` - Get firmware by device model
- `POST /` - Create new firmware record
- `PUT /:id` - Update firmware record
- `DELETE /:id` - Delete firmware record

### Device Production API (`/api/device-production`)
- `GET /` - Get all device production records
- `GET /:id` - Get device production by ID
- `GET /device/:deviceModel` - Get by device model
- `GET /manufacturer/:manufacturer` - Get by manufacturer
- `POST /` - Create new device production record
- `PUT /:id` - Update device production record
- `DELETE /:id` - Delete device production record

### Device Management API (`/api/device-management`)
- `GET /` - Get all device management records
- `GET /:id` - Get device management by ID
- `GET /device/:deviceModel` - Get by device model
- `GET /manufacturer/:manufacturer` - Get by manufacturer
- `GET /device-id/:deviceId` - Get by device ID
- `POST /` - Create new device management record
- `PUT /:id` - Update device management record
- `DELETE /:id` - Delete device management record

### Product Type API (`/api/product-type`)
- `GET /` - Get all product type records
- `GET /:id` - Get product type by ID
- `GET /device/:deviceModel` - Get by device model
- `GET /type/:productType` - Get by product type
- `GET /product-id/:productId` - Get by product ID
- `POST /` - Create new product type record
- `PUT /:id` - Update product type record
- `DELETE /:id` - Delete product type record

### Product List API (`/api/product-list`)
- `GET /` - Get all product list records
- `GET /:id` - Get product list by ID
- `GET /type/:productType` - Get by product type
- `GET /name/:productName` - Get by product name (search)
- `GET /member/:memberType` - Get by member type
- `GET /device/:deviceId` - Get by device ID
- `GET /product-id/:productId` - Get by product ID
- `POST /` - Create new product list record
- `PUT /:id` - Update product list record
- `DELETE /:id` - Delete product list record

## Database Setup

### 1. Create Database
```sql
CREATE DATABASE hewan_page CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Import Tables
Run the SQL file to create all tables and sample data:
```bash
mysql -u your_username -p hewan_page < server/database/all_tables.sql
```

### 3. Environment Configuration
Update your `.env` file with database credentials:
```env
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=hewan_page
PORT=2829
```

## Sample Data

Each table includes sample data that matches the Vue.js frontend requirements:

- **device_type**: 4 sample device models (HWZ001-HWZ004)
- **firmware**: 7 sample firmware records for different device models
- **device_production**: 8 sample production records
- **device_management**: 5 sample device management records
- **product_type**: 10 sample product type records
- **product_list**: 10 sample product list records

## Frontend Integration

The Vue.js frontend pages can now connect to these database tables:

1. **DeviceType.vue** → `device_type` table
2. **Firmware.vue** → `firmware` table
3. **DeviceProduction.vue** → `device_production` table
4. **DeviceManagement.vue** → `device_management` table
5. **ProductType.vue** → `product_type` table
6. **ProductList.vue** → `product_list` table

## API Usage Examples

### Get all device types
```bash
curl http://localhost:2829/api/device-type
```

### Create a new device type
```bash
curl -X POST http://localhost:2829/api/device-type \
  -H "Content-Type: application/json" \
  -d '{
    "device_model_id": "new_model_001",
    "device_model_name": "HWZ005",
    "introduction": "New device model",
    "enable_4g": "是",
    "latest_firmware_version": "Z005 V 1.0.0",
    "updater": "admin"
  }'
```

### Get firmware by device model
```bash
curl http://localhost:2829/api/firmware/device/HWSZ001
```

## Error Handling

All API endpoints include proper error handling:
- **400 Bad Request**: Invalid input data
- **404 Not Found**: Record not found
- **500 Internal Server Error**: Database or server errors

## Database Indexes

All tables include appropriate indexes for optimal query performance:
- Primary keys on `id` columns
- Unique indexes on business keys
- Indexes on frequently queried columns
- Composite indexes where needed

## Security Considerations

- All user inputs are properly sanitized using parameterized queries
- Database credentials should be stored in environment variables
- CORS is enabled for frontend integration
- File upload limits are enforced for media files 