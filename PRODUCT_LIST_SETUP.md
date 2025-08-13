# Product List Table Setup Guide

This guide explains how to set up the new MySQL table for the product list and integrate it with the Vue.js frontend.

## 1. MySQL Table Setup

### Create the Table
Run the following SQL script on your cloud server's MySQL database:

```sql
-- Execute create_product_table.sql
source create_product_table.sql;
```

### Insert Sample Data
After creating the table, insert 20 sample rows:

```sql
-- Execute insert_sample_data.sql
source insert_sample_data.sql;
```

## 2. Table Structure

The new table `product_list` contains 21 columns matching the image requirements:

| Column | Type | Description | Chinese Name |
|--------|------|-------------|--------------|
| id | INT | Primary key | 主键 |
| serial_number | INT | Serial number | 序号 |
| product_id | VARCHAR(50) | Product ID | 商品ID |
| ip_role | VARCHAR(50) | IP role | IP角色 |
| product_model | VARCHAR(100) | Product model | 产品型号 |
| product_name | VARCHAR(200) | Product name | 产品名称 |
| product_type | VARCHAR(200) | Product type | 产品类型 |
| color | VARCHAR(100) | Color | 颜色 |
| production_batch | DATE | Production batch | 生产批次 |
| manufacturer | VARCHAR(200) | Manufacturer | 生产厂家 |
| qr_code_file_directory | TEXT | QR code file directory | 二维码文件目录 |
| qr_code_exported | ENUM | QR code exported status | 二维码是否导出 |
| barcode_file_directory | TEXT | Barcode file directory | 条形码目录 |
| barcode_exported | ENUM | Barcode exported status | 条形码是否导出 |
| device_id | VARCHAR(100) | Device ID | 设备ID |
| sub_account_id | VARCHAR(100) | Sub-account ID | 子账户ID |
| file_export_time | DATETIME | File export time | 文件导出时间 |
| first_binding_time | DATETIME | First binding time | 首次绑定时间 |
| creator_id | INT | Creator ID | 创建人 |
| creation_time | DATETIME | Creation time | 创建时间 |
| update_time | DATETIME | Update time | 更新时间 |

## 3. Frontend Updates

The Vue.js component `ProductList.vue` has been updated with:

- New data interface matching the table structure
- Updated column configurations for all 21 columns
- New filter options: IP角色, 模块
- Export functionality for QR codes and transaction codes
- Updated API integration to fetch data from cloud server

## 4. API Endpoints

The component expects the following API endpoints:

- `GET /api/product-list` - Fetch all products
- `POST /api/product-list` - Create new product
- `PUT /api/product-list/:id` - Update product
- `DELETE /api/product-list/:id` - Delete product

## 5. Server Configuration

Ensure your cloud server has:

1. MySQL database running
2. Proper API endpoints configured
3. CORS settings for frontend access
4. Database connection with proper credentials

## 6. Testing

After setup:

1. Verify the table was created with correct structure
2. Confirm 20 sample rows were inserted
3. Test the frontend by refreshing the page
4. Verify all columns display correctly
5. Test filtering and sorting functionality
6. Test export and delete operations

## 7. Troubleshooting

### Common Issues:

1. **Table not found**: Ensure SQL scripts executed successfully
2. **Data not loading**: Check API endpoint configuration
3. **Column mismatch**: Verify table structure matches interface
4. **Encoding issues**: Ensure UTF-8 charset for Chinese text

### Debug Commands:

```sql
-- Check table structure
DESCRIBE product_list;

-- Verify data exists
SELECT COUNT(*) FROM product_list;

-- Check sample data
SELECT * FROM product_list LIMIT 5;
```

## 8. Performance Considerations

- Indexes have been created on frequently queried columns
- Consider pagination for large datasets
- Monitor query performance with EXPLAIN statements
- Consider caching for frequently accessed data

## 9. Security Notes

- Validate all input data
- Use parameterized queries
- Implement proper authentication
- Restrict database access to necessary users only 