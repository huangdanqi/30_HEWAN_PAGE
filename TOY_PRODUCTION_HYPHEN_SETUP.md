# Toy Production (Hyphen) Setup

This document explains how to set up the new `toy-production` table (with hyphen) for the HeWan Page application.

## Overview

The `toy-production` table is a new table that stores toy production records with 20 sample rows of diverse toy products.

## Database Setup

### 1. Create the Toy Production Table

The toy production table is defined in `server/database/toy-production.sql`. To create the table, run:

```bash
# Option 1: Run the setup script
node server/setup_toy_production_hyphen_database.js

# Option 2: Run the SQL directly in MySQL
mysql -u your_username -p page_test < server/database/toy-production.sql
```

### 2. Table Structure

The `toy-production` table contains the following fields:

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

## Sample Data

The table includes 20 diverse toy production records:

1. **智能机器人玩具** - Smart Robot Toy (¥299.99)
2. **毛绒小熊玩偶** - Plush Bear Doll (¥89.50)
3. **积木拼装套装** - Building Block Set (¥199.00)
4. **遥控飞机模型** - Remote Control Plane (¥599.99)
5. **音乐盒玩具** - Music Box Toy (¥159.80)
6. **拼图游戏套装** - Puzzle Game Set (¥79.90)
7. **电子宠物玩具** - Electronic Pet Toy (¥129.99)
8. **角色扮演服装** - Role-play Costume (¥199.50)
9. **科学实验套装** - Science Experiment Set (¥299.00)
10. **绘画艺术套装** - Art Drawing Set (¥149.80)
11. **运动健身玩具** - Sports Fitness Toy (¥179.99)
12. **建筑模型套装** - Architecture Model Set (¥399.00)
13. **汽车模型玩具** - Car Model Toy (¥259.50)
14. **恐龙化石模型** - Dinosaur Fossil Model (¥189.99)
15. **太空探索套装** - Space Exploration Set (¥349.00)
16. **海洋生物模型** - Marine Life Model (¥229.80)
17. **农场动物套装** - Farm Animal Set (¥159.50)
18. **城市交通模型** - City Traffic Model (¥279.99)
19. **魔法城堡玩具** - Magic Castle Toy (¥189.00)
20. **未来科技套装** - Future Technology Set (¥459.99)

## API Endpoints

The toy-production API is available at `/api/toy-production-hyphen` with the following endpoints:

### GET /api/toy-production-hyphen
- **Purpose**: Get all toy-production records with pagination
- **Query Parameters**:
  - `page` - Page number (default: 1)
  - `pageSize` - Records per page (default: 10)
- **Response**: JSON object with `data` array and `pagination` object

### GET /api/toy-production-hyphen/:id
- **Purpose**: Get a specific toy-production record by ID
- **Response**: JSON object with the record data

### POST /api/toy-production-hyphen
- **Purpose**: Create a new toy-production record
- **Body**: JSON object with required fields (product_id, product_name, production_batch, manufacturer, unit_price, quantity)
- **Response**: JSON object with the new record ID

### PUT /api/toy-production-hyphen/:id
- **Purpose**: Update an existing toy-production record
- **Body**: JSON object with the fields to update
- **Response**: JSON object with success message

### DELETE /api/toy-production-hyphen/:id
- **Purpose**: Delete a toy-production record
- **Response**: JSON object with success message

### GET /api/toy-production-hyphen/product/:productName
- **Purpose**: Get toy-production records by product name (search)
- **Response**: JSON array of matching records

### GET /api/toy-production-hyphen/manufacturer/:manufacturer
- **Purpose**: Get toy-production records by manufacturer (search)
- **Response**: JSON array of matching records

## Product Types Included

The sample data covers various toy categories:

- **智能玩具** (Smart Toys) - Robot toys, electronic pets
- **毛绒玩具** (Plush Toys) - Stuffed animals, soft toys
- **益智玩具** (Educational Toys) - Building blocks, puzzles
- **遥控玩具** (Remote Control Toys) - RC planes, cars
- **音乐玩具** (Music Toys) - Music boxes, instruments
- **电子玩具** (Electronic Toys) - Digital pets, gadgets
- **角色扮演** (Role-play) - Costumes, dress-up
- **科学玩具** (Science Toys) - Experiment kits
- **艺术玩具** (Art Toys) - Drawing sets, crafts
- **运动玩具** (Sports Toys) - Fitness equipment
- **建筑模型** (Architecture Models) - Building models
- **汽车模型** (Car Models) - Vehicle replicas
- **古生物模型** (Paleontology Models) - Dinosaur fossils
- **太空玩具** (Space Toys) - Space exploration sets
- **海洋模型** (Ocean Models) - Marine life replicas
- **农场玩具** (Farm Toys) - Farm animal sets
- **交通模型** (Traffic Models) - City transportation
- **魔法玩具** (Magic Toys) - Fantasy and magic items
- **科技玩具** (Technology Toys) - Future tech sets

## Usage

1. **Start the server**: `npm run dev` or `node server/server.js`
2. **Access the API**: Use the endpoints at `/api/toy-production-hyphen`
3. **Test the data**: The table contains 20 sample records ready for testing

## Troubleshooting

### Common Issues

1. **Table not found**: Run the setup script to create the table
2. **Connection error**: Check database credentials in `.env` file
3. **Data not loading**: Check browser console for API errors

### Error Messages

- "Toy-production record not found" - Record doesn't exist
- "Database connection or table structure error" - Database connection issue
- "Network connection error" - Server connection problem

## Development

To modify the toy-production functionality:

1. **Database changes**: Update `server/database/toy-production.sql`
2. **API changes**: Modify `server/routes/toy-production.js`
3. **Test changes**: Restart the server and test the endpoints 