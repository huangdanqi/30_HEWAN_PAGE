# Toy Production Setup

This document explains how to set up the toy production functionality for the HeWan Page application.

## Overview

The toy production feature allows users to manage toy production records including product information, production batches, manufacturers, pricing, and quantities.

## Database Setup

### 1. Create the Toy Production Table

The toy production table is defined in `server/database/toy_production.sql`. To create the table, run:

```bash
# Option 1: Run the setup script
node server/setup_toy_production_database.js

# Option 2: Run the SQL directly in MySQL
mysql -u your_username -p page_test < server/database/toy_production.sql
```

### 2. Table Structure

The `toy_production` table contains the following fields:

- `id` - Primary key (auto-increment)
- `product_id` - Product ID (VARCHAR(50), NOT NULL)
- `product_name` - Product name (VARCHAR(200), NOT NULL)
- `production_batch` - Production batch date (DATE, NOT NULL)
- `manufacturer` - Manufacturer name (VARCHAR(200), NOT NULL)
- `unit_price` - Unit price in yuan (DECIMAL(10,2), NOT NULL)
- `quantity` - Production quantity (INT, NOT NULL)
- `total_price` - Calculated total price (DECIMAL(12,2), GENERATED)
- `creator` - Creator name (VARCHAR(50), DEFAULT '管理员')
- `create_time` - Creation timestamp (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- `update_time` - Last update timestamp (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)
- `device_model` - Device model (VARCHAR(50))
- `product_type` - Product type (VARCHAR(50))
- `ip_name` - IP name (VARCHAR(100))

## API Endpoints

The toy production API is available at `/api/toy-production` with the following endpoints:

### GET /api/toy-production
- **Purpose**: Get all toy production records with pagination
- **Query Parameters**:
  - `page` - Page number (default: 1)
  - `pageSize` - Records per page (default: 10)
- **Response**: JSON object with `data` array and `pagination` object

### GET /api/toy-production/:id
- **Purpose**: Get a specific toy production record by ID
- **Response**: JSON object with the record data

### POST /api/toy-production
- **Purpose**: Create a new toy production record
- **Body**: JSON object with required fields (product_id, product_name, production_batch, manufacturer, unit_price, quantity)
- **Response**: JSON object with the new record ID

### PUT /api/toy-production/:id
- **Purpose**: Update an existing toy production record
- **Body**: JSON object with the fields to update
- **Response**: JSON object with success message

### DELETE /api/toy-production/:id
- **Purpose**: Delete a toy production record
- **Response**: JSON object with success message

### GET /api/toy-production/product/:productName
- **Purpose**: Get toy production records by product name (search)
- **Response**: JSON array of matching records

### GET /api/toy-production/manufacturer/:manufacturer
- **Purpose**: Get toy production records by manufacturer (search)
- **Response**: JSON array of matching records

## Frontend Integration

The `ToyProduction.vue` component has been updated to:

1. **Fetch data from MySQL**: Uses the `/api/toy-production` endpoint to get data
2. **Handle pagination**: Supports server-side pagination
3. **Error handling**: Displays appropriate error messages for different scenarios
4. **Loading states**: Shows loading indicators during data fetching
5. **Search and filtering**: Supports searching and filtering by product name and manufacturer

## Sample Data

The setup script includes sample data with 12 toy production records covering various product types:

- 益智 (Educational) toys
- 毛绒 (Plush) toys
- 模型 (Model) toys
- 电子 (Electronic) toys
- 美术 (Art) supplies
- 音乐 (Music) toys
- 角色扮演 (Role-play) toys

## Usage

1. **Start the server**: `npm run dev` or `node server/server.js`
2. **Access the page**: Navigate to `/toy-production` in your browser
3. **View data**: The page will display toy production records from the database
4. **Search and filter**: Use the search box and dropdown filters
5. **Pagination**: Navigate through pages using the pagination controls

## Troubleshooting

### Common Issues

1. **Table not found**: Run the setup script to create the table
2. **Connection error**: Check database credentials in `.env` file
3. **Data not loading**: Check browser console for API errors
4. **Pagination issues**: Ensure the API is returning the correct pagination format

### Error Messages

- "玩具生产表不存在，请检查数据库" - Toy production table doesn't exist
- "数据库连接失败或表结构错误" - Database connection or table structure error
- "无法连接到服务器，请检查网络连接" - Network connection error

## Development

To modify the toy production functionality:

1. **Database changes**: Update `server/database/toy_production.sql`
2. **API changes**: Modify `server/routes/toyProduction.js`
3. **Frontend changes**: Update `src/views/ToyProduction.vue`
4. **Test changes**: Restart the server and refresh the page 