# Hewan Page Server - Project Architecture Documentation

## Project Overview

The Hewan Page Server is a full-stack web application built with Node.js backend and Vue.js frontend, designed for managing product lists, device management, firmware updates, and production tracking systems.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  Vue.js Frontend (src/)                                        │
│  ├── Components (reusable UI components)                       │
│  ├── Views (page components)                                   │
│  ├── Stores (Pinia state management)                          │
│  ├── Router (Vue Router navigation)                           │
│  └── Utils (helper functions)                                  │
├─────────────────────────────────────────────────────────────────┤
│                        SERVER LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  Node.js Backend (server/)                                     │
│  ├── Routes (API endpoints)                                    │
│  ├── Middleware (request processing)                           │
│  ├── Database (MySQL integration)                              │
│  └── Config (server configuration)                             │
├─────────────────────────────────────────────────────────────────┤
│                      DATABASE LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  MySQL Database                                                 │
│  ├── product_list (product management)                         │
│  ├── device_management (device tracking)                       │
│  ├── firmware (firmware versions)                              │
│  ├── toy_production (production data)                          │
│  └── user_accounts (user management)                           │
└─────────────────────────────────────────────────────────────────┘
```

## File Structure and Functions

### Root Directory Files

#### Configuration Files
- **`package.json`** - Node.js dependencies and scripts
- **`vite.config.ts`** - Vite build configuration for Vue.js
- **`tsconfig.json`** - TypeScript configuration
- **`tsconfig.app.json`** - TypeScript app-specific config
- **`tsconfig.node.json`** - TypeScript Node.js config

#### Database Scripts
- **`add_creator_name_column.sql`** - Adds creator name column to product_list table
- **`create_product_table.sql`** - Creates the main product table structure
- **`insert_sample_data.sql`** - Inserts sample data for testing
- **`fix_encoding_final.sql`** - Fixes Chinese character encoding issues
- **`final_fix.sql`** - Comprehensive database fixes

#### Migration Scripts
- **`run_migration.bat`** - Windows batch file for database migrations
- **`run_migration.ps1`** - PowerShell script for database migrations
- **`run_migration_simple.bat`** - Simplified Windows migration script
- **`run_migration_simple.ps1`** - Simplified PowerShell migration script

#### Server Management Scripts
- **`start_server.bat`** - Windows script to start the server
- **`start_cloud_dev.bat`** - Windows script for cloud development
- **`start_cloud_dev.sh`** - Linux/Mac script for cloud development
- **`deploy.bat`** - Windows deployment script
- **`deploy.ps1`** - PowerShell deployment script

#### Utility Scripts
- **`check_server_status.sh`** - Checks if server is running
- **`check_mysql_auth.sh`** - Verifies MySQL authentication
- **`fix_mysql_auth.sh`** - Fixes MySQL authentication issues
- **`reset_mysql_password.sh`** - Resets MySQL password
- **`access_app.sh`** - Script to access the application

### Frontend Source (`src/`)

#### Core Application Files
- **`main.ts`** - Vue.js application entry point
- **`App.vue`** - Root Vue component
- **`style.css`** - Global CSS styles
- **`shims-vue.d.ts`** - Vue.js TypeScript declarations
- **`vite-env.d.ts`** - Vite environment types

#### Components (`src/components/`)
- **`AppSidebar.vue`** - Main navigation sidebar
- **`AppTopbar.vue`** - Top navigation bar
- **`AddBatchModal.vue`** - Modal for batch adding products
- **`BomUploadModal.vue`** - Modal for BOM file uploads
- **`DeviceImportModal.vue`** - Modal for device imports
- **`FirmwareEditModal.vue`** - Modal for firmware editing
- **`FirmwareReleaseModal.vue`** - Modal for firmware releases
- **`ProductCreateModal.vue`** - Modal for product creation
- **`LogQueryHeader.vue`** - Log query interface header
- **`LogQueryTable.vue`** - Log query results table
- **`LogQueryTitle.vue`** - Log query page title

#### Views (`src/views/`)
- **`Login.vue`** - User authentication page
- **`Account.vue`** - User account management
- **`ProductList.vue`** - Product list management
- **`ProductType.vue`** - Product type management
- **`DeviceManagement.vue`** - Device management interface
- **`DeviceProduction.vue`** - Device production tracking
- **`DeviceType.vue`** - Device type management
- **`Firmware.vue`** - Firmware management interface
- **`ToyProduction.vue`** - Toy production tracking
- **`ModelConfiguration.vue`** - Model configuration interface
- **`ToolConfiguration.vue`** - Tool configuration interface
- **`IPManagement.vue`** - IP address management
- **`IPAudio.vue`** - IP audio management
- **`IPImage.vue`** - IP image management
- **`IPVideo.vue`** - IP video management
- **`BuiltInAlarm.vue`** - Built-in alarm management
- **`LogQuery.vue`** - Log query interface
- **`MusicResources.vue`** - Music resource management
- **`OTA.vue`** - Over-the-air update management

#### Stores (`src/stores/`)
- **`auth.ts`** - Authentication state management (Pinia store)

#### Router (`src/router/`)
- **`index.ts`** - Vue Router configuration and route definitions

#### Utils (`src/utils/`)
- **`api.ts`** - API utility functions and HTTP client
- **`tableConfig.ts`** - Table configuration and settings

#### Layouts (`src/layouts/`)
- **`MainLayout.vue`** - Main application layout wrapper

### Backend Server (`server/`)

#### Core Server Files
- **`server.js`** - Main Express.js server entry point
- **`setup_database.js`** - Database initialization script
- **`README.md`** - Server documentation

#### Configuration (`server/config/`)
- **`database.js`** - Database connection configuration

#### Routes (`server/routes/`)
- **`accounts.js`** - User account management API endpoints
- **`productList.js`** - Product list CRUD operations
- **`productType.js`** - Product type management
- **`deviceManagement.js`** - Device management API
- **`deviceProduction.js`** - Device production API
- **`deviceType.js`** - Device type management
- **`firmware.js`** - Firmware management API
- **`toyProduction.js`** - Toy production API
- **`modelConfiguration.js`** - Model configuration API
- **`toolConfiguration.js`** - Tool configuration API
- **`ipManagement.js`** - IP management API
- **`ipAudio.js`** - IP audio management
- **`ipImage.js`** - IP image management
- **`ipVideo.js`** - IP video management
- **`alarm.js`** - Alarm management API
- **`bom.js`** - Bill of materials management
- **`agentConfiguration.js`** - Agent configuration API

#### Middleware (`server/middleware/`)
- **`upload.js`** - File upload handling middleware

#### Database Scripts (`server/database/`)
- **`all_tables.sql`** - Complete database schema
- **`create_missing_tables.sql`** - Creates missing database tables
- **`simple_create_tables.sql`** - Simplified table creation
- **`product_list.sql`** - Product list table structure
- **`product_type.sql`** - Product type table structure
- **`device_management.sql`** - Device management table structure
- **`device_production.sql`** - Device production table structure
- **`device_type.sql`** - Device type table structure
- **`firmware.sql`** - Firmware table structure
- **`toy_production.sql`** - Toy production table structure
- **`toy_production_new.sql`** - New toy production table structure
- **`toy_production_hyphen.sql`** - Hyphenated toy production table
- **`model_configuration.sql`** - Model configuration table structure

#### Database Setup Scripts
- **`setup_product_list_database.js`** - Sets up product list database
- **`setup_product_type_database.js`** - Sets up product type database
- **`setup_device_management_database.js`** - Sets up device management database
- **`setup_device_production_database.js`** - Sets up device production database
- **`setup_device_type_database.js`** - Sets up device type database
- **`setup_firmware_database.js`** - Sets up firmware database
- **`setup_toy_production_database.js`** - Sets up toy production database
- **`setup_toy_production_new_database.js`** - Sets up new toy production database
- **`setup_toy_production_hyphen_database.js`** - Sets up hyphenated toy production database
- **`setup_model_configuration_database.js`** - Sets up model configuration database

#### Utility Scripts
- **`add_file_address_column.js`** - Adds file address column to tables
- **`add_product_type_data.js`** - Adds sample product type data
- **`update_product_list_data.js`** - Updates product list data
- **`update_firmware_database.js`** - Updates firmware database
- **`verify_product_type_count.js`** - Verifies product type counts
- **`debug_table_structure.js`** - Debug database table structures
- **`test_connection.js`** - Tests database connections
- **`test_cloud_db.js`** - Tests cloud database connections

### Public Assets (`public/`)

#### Media Files
- **`images/`** - Application images and icons
- **`audio/`** - Audio files for alarms and notifications
- **`videos/`** - Video files for demonstrations
- **`firmware/`** - Firmware files for device updates
- **`barcode/`** - Barcode images
- **`QRcode/`** - QR code images
- **`bom-files/`** - Bill of materials files

## File Relationships and Dependencies

### Frontend Dependencies
```
main.ts → App.vue → MainLayout.vue → Components + Views
                ↓
            Router → Views → Components
                ↓
            Stores → Components/Views
                ↓
            Utils → API calls → Backend
```

### Backend Dependencies
```
server.js → Routes → Middleware → Database
     ↓
Config → Database Connection
     ↓
Database Scripts → MySQL Tables
```

### Data Flow
```
User Input → Vue Component → Pinia Store → API Call → Express Route → MySQL Database
    ↑                                                                        ↓
Display Data ← Vue Component ← Pinia Store ← API Response ← Express Route ← Query Result
```

## Key Features and Functionality

### 1. Product Management
- **CRUD Operations**: Create, Read, Update, Delete products
- **Batch Operations**: Bulk import and management
- **Creator Tracking**: Dynamic username implementation
- **Type Classification**: Product categorization system

### 2. Device Management
- **Device Tracking**: Monitor device status and location
- **Production Data**: Track manufacturing progress
- **Type Management**: Organize devices by categories
- **Configuration**: Device-specific settings

### 3. Firmware Management
- **Version Control**: Track firmware versions
- **Update Distribution**: Over-the-air updates
- **File Management**: Store and organize firmware files
- **Release Management**: Control firmware releases

### 4. Production Tracking
- **Toy Production**: Monitor toy manufacturing
- **Device Production**: Track device assembly
- **Quality Control**: Production quality metrics
- **Inventory Management**: Stock level tracking

### 5. IP Management
- **Address Assignment**: IP address allocation
- **Media Management**: Audio, image, and video files
- **Network Configuration**: Network settings management
- **Resource Organization**: Media resource categorization

## Development Workflow

### 1. Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start backend server
cd server && node server.js
```

### 2. Database Setup
```bash
# Run migration scripts
./run_migration.sh

# Or use Windows batch files
run_migration.bat
```

### 3. Production Deployment
```bash
# Build frontend
npm run build

# Deploy to server
./deploy.sh
```

## Security Features

- **Authentication**: User login and session management
- **Authorization**: Role-based access control
- **Input Validation**: Server-side data validation
- **SQL Injection Protection**: Parameterized queries
- **File Upload Security**: Secure file handling

## Performance Optimizations

- **Database Indexing**: Optimized query performance
- **Caching**: Frontend and backend caching strategies
- **Lazy Loading**: Component and route lazy loading
- **Image Optimization**: Compressed and optimized media files
- **Code Splitting**: Bundle optimization for faster loading

## Monitoring and Logging

- **Server Status**: Health check endpoints
- **Error Logging**: Comprehensive error tracking
- **Performance Metrics**: Response time monitoring
- **User Activity**: User action logging
- **Database Monitoring**: Query performance tracking

## Troubleshooting Guide

### Common Issues
1. **Database Connection**: Check MySQL service and credentials
2. **Port Conflicts**: Verify port 3000 is available
3. **Encoding Issues**: Ensure proper UTF-8 configuration
4. **File Permissions**: Check file access rights
5. **Dependencies**: Verify npm packages are installed

### Debug Commands
```bash
# Check server status
./check_server_status.sh

# Test database connection
node server/test_connection.js

# Verify MySQL authentication
./check_mysql_auth.sh
```

This documentation provides a comprehensive overview of the Hewan Page Server project architecture, helping developers understand the system structure, file relationships, and implementation details.
