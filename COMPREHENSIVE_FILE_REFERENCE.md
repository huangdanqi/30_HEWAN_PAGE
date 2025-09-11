# Hewan Page Server - Comprehensive File Reference Guide

## Table of Contents
1. [Root Directory Files](#root-directory-files)
2. [Frontend Source Files](#frontend-source-files)
3. [Backend Server Files](#backend-server-files)
4. [Database and Scripts](#database-and-scripts)
5. [Configuration Files](#configuration-files)
6. [Utility Scripts](#utility-scripts)
7. [Documentation Files](#documentation-files)

---

## Root Directory Files

### Package Management
- **`package.json`** - Main Node.js project configuration
  - Defines project dependencies (Vue.js, Express, MySQL, etc.)
  - Contains build scripts (`dev`, `build`, `preview`)
  - Project metadata and version information
  
- **`package-lock.json`** - Locked dependency versions
  - Ensures consistent installations across environments
  - Generated automatically by npm

### Build Configuration
- **`vite.config.ts`** - Vite build tool configuration
  - Development server settings
  - Build optimization options
  - Plugin configurations
  
- **`vite.config.js`** - Alternative Vite configuration (JavaScript version)
- **`vite.config.d.ts`** - TypeScript definitions for Vite config

### TypeScript Configuration
- **`tsconfig.json`** - Base TypeScript configuration
  - Compiler options and settings
  - Target JavaScript version
  
- **`tsconfig.app.json`** - Application-specific TypeScript settings
  - Vue.js specific configurations
  - Source file inclusion/exclusion
  
- **`tsconfig.node.json`** - Node.js specific TypeScript settings
  - Server-side TypeScript configurations
  
- **`tsconfig.node.tsbuildinfo`** - TypeScript build cache file

### Entry Points
- **`index.html`** - Main HTML entry point
  - Root DOM element for Vue.js application
  - Meta tags and title configuration

---

## Frontend Source Files

### Application Core (`src/`)

#### Main Entry Point
- **`main.ts`** - Vue.js application bootstrap
  - Creates Vue app instance
  - Registers global plugins (Pinia, Router)
  - Mounts application to DOM

#### Root Components
- **`App.vue`** - Root Vue component
  - Global layout structure
  - Router view container
  - Global styles and components

#### Type Definitions
- **`shims-vue.d.ts`** - Vue.js TypeScript declarations
  - Enables TypeScript support for .vue files
  - Component type definitions
  
- **`vite-env.d.ts`** - Vite environment types
  - Import.meta types for Vite
  - Environment variable types

#### Styling
- **`style.css`** - Global CSS styles
  - Reset and base styles
  - Global utility classes
  - Theme variables

### Components (`src/components/`)

#### Layout Components
- **`AppSidebar.vue`** - Main navigation sidebar
  - Menu structure and navigation links
  - Collapsible sidebar functionality
  - Active route highlighting

- **`AppTopbar.vue`** - Top navigation bar
  - User authentication status
  - Global actions and notifications
  - Responsive mobile menu

#### Modal Components
- **`AddBatchModal.vue`** - Batch product creation
  - Excel file upload for bulk imports
  - Data validation and preview
  - Batch processing status

- **`BomUploadModal.vue`** - Bill of materials upload
  - BOM file processing
  - Component mapping interface
  - Validation and error handling

- **`DeviceImportModal.vue`** - Device data import
  - CSV/Excel import functionality
  - Device type mapping
  - Import validation

- **`FirmwareEditModal.vue`** - Firmware editing interface
  - Version information editing
  - File upload and management
  - Release notes editing

- **`FirmwareReleaseModal.vue`** - Firmware release management
  - Release scheduling
  - Target device selection
  - Rollback options

- **`ProductCreateModal.vue`** - Single product creation
  - Product form with validation
  - Type and category selection
  - Creator assignment

#### Log Components
- **`LogQueryHeader.vue`** - Log query interface header
  - Search filters and date ranges
  - Export functionality
  - Query history

- **`LogQueryTable.vue`** - Log query results display
  - Paginated data table
  - Sorting and filtering
  - Detail view expansion

- **`LogQueryTitle.vue`** - Log query page title
  - Page header and description
  - Breadcrumb navigation

### Views (`src/views/`)

#### Authentication
- **`Login.vue`** - User authentication page
  - Login form with validation
  - Error message display
  - Remember me functionality

- **`Account.vue`** - User account management
  - Profile information editing
  - Password change
  - Account settings

#### Product Management
- **`ProductList.vue`** - Main product management interface
  - Product table with CRUD operations
  - Search and filtering
  - Batch operations
  - Export functionality

- **`ProductType.vue`** - Product type management
  - Type creation and editing
  - Category hierarchy
  - Type relationships

#### Device Management
- **`DeviceManagement.vue`** - Device tracking interface
  - Device status monitoring
  - Location tracking
  - Status updates
  - Device history

- **`DeviceProduction.vue`** - Device production tracking
  - Production line monitoring
  - Quality metrics
  - Production schedules

- **`DeviceType.vue`** - Device type management
  - Type definitions
  - Configuration templates
  - Maintenance schedules

#### Firmware Management
- **`Firmware.vue`** - Firmware version control
  - Version listing and comparison
  - Update distribution
  - Rollback management
  - Device compatibility

#### Production Tracking
- **`ToyProduction.vue`** - Toy manufacturing tracking
  - Production line status
  - Quality control metrics
  - Inventory levels
  - Production reports

#### Configuration
- **`ModelConfiguration.vue`** - Model settings interface
  - Model parameters
  - Configuration templates
  - Version control

- **`ToolConfiguration.vue`** - Tool settings management
  - Tool parameters
  - Calibration data
  - Maintenance schedules

#### IP Management
- **`IPManagement.vue`** - IP address management
  - Address allocation
  - Network configuration
  - Device mapping

- **`IPAudio.vue`** - Audio file management
  - Audio file upload
  - Playlist management
  - Audio scheduling

- **`IPImage.vue`** - Image file management
  - Image upload and organization
  - Gallery management
  - Image processing

- **`IPVideo.vue`** - Video file management
  - Video upload and encoding
  - Playlist management
  - Video scheduling

#### System Management
- **`BuiltInAlarm.vue`** - Alarm system management
  - Alarm configuration
  - Notification settings
  - Alarm history

- **`LogQuery.vue`** - System log query interface
  - Log search and filtering
  - Export functionality
  - Log analysis

- **`MusicResources.vue`** - Music resource management
  - Music file organization
  - Playlist creation
  - Resource allocation

- **`OTA.vue`** - Over-the-air update management
  - Update scheduling
  - Device targeting
  - Update monitoring

### State Management (`src/stores/`)
- **`auth.ts`** - Authentication state management
  - User login status
  - User information
  - Authentication tokens
  - Permission levels

### Routing (`src/router/`)
- **`index.ts`** - Vue Router configuration
  - Route definitions
  - Navigation guards
  - Route metadata
  - Lazy loading configuration

### Utilities (`src/utils/`)
- **`api.ts`** - API utility functions
  - HTTP client configuration
  - Request/response interceptors
  - Error handling
  - Authentication headers

- **`tableConfig.ts`** - Table configuration
  - Column definitions
  - Sorting rules
  - Filter configurations
  - Pagination settings

### Layouts (`src/layouts/`)
- **`MainLayout.vue`** - Main application layout
  - Sidebar and topbar integration
  - Content area management
  - Responsive design handling

---

## Backend Server Files

### Core Server (`server/`)

#### Main Server
- **`server.js`** - Express.js server entry point
  - Server initialization
  - Middleware registration
  - Route mounting
  - Error handling
  - Database connection

#### Configuration
- **`server/config/database.js`** - Database connection configuration
  - MySQL connection parameters
  - Connection pooling
  - Environment-specific settings

#### Database Setup
- **`setup_database.js`** - Main database initialization
  - Table creation
  - Initial data insertion
  - Schema validation

### Routes (`server/routes/`)

#### User Management
- **`accounts.js`** - User account API endpoints
  - User registration
  - Authentication
  - Profile management
  - Password operations

#### Product Management
- **`productList.js`** - Product CRUD operations
  - Create, read, update, delete products
  - Batch operations
  - Search and filtering
  - Export functionality

- **`productType.js`** - Product type management
  - Type CRUD operations
  - Category management
  - Type relationships

#### Device Management
- **`deviceManagement.js`** - Device tracking API
  - Device status updates
  - Location tracking
  - Device information
  - Status history

- **`deviceProduction.js`** - Production data API
  - Production metrics
  - Quality data
  - Schedule management
  - Performance tracking

- **`deviceType.js`** - Device type API
  - Type definitions
  - Configuration templates
  - Maintenance schedules

#### Firmware Management
- **`firmware.js`** - Firmware version API
  - Version management
  - File upload/download
  - Update distribution
  - Compatibility checking

#### Production Tracking
- **`toyProduction.js`** - Toy production API
  - Production line data
  - Quality metrics
  - Inventory tracking
  - Performance reports

#### Configuration Management
- **`modelConfiguration.js`** - Model settings API
  - Configuration parameters
  - Template management
  - Version control

- **`toolConfiguration.js`** - Tool settings API
  - Tool parameters
  - Calibration data
  - Maintenance schedules

#### IP Management
- **`ipManagement.js`** - IP address API
  - Address allocation
  - Network configuration
  - Device mapping

- **`ipAudio.js`** - Audio management API
  - File upload
  - Playlist management
  - Audio scheduling

- **`ipImage.js`** - Image management API
  - Image upload
  - Gallery management
  - Image processing

- **`ipVideo.js`** - Video management API
  - Video upload
  - Playlist management
  - Video scheduling

#### System Management
- **`alarm.js`** - Alarm system API
  - Alarm configuration
  - Notification management
  - Alarm history

- **`bom.js`** - Bill of materials API
  - BOM management
  - Component tracking
  - Version control

- **`agentConfiguration.js`** - Agent configuration API
  - Agent settings
  - Communication protocols
  - Status monitoring

### Middleware (`server/middleware/`)
- **`upload.js`** - File upload handling
  - Multipart form processing
  - File validation
  - Storage management
  - Security checks

### Database Scripts (`server/database/`)

#### Schema Files
- **`all_tables.sql`** - Complete database schema
  - All table definitions
  - Indexes and constraints
  - Foreign key relationships

- **`create_missing_tables.sql`** - Missing table creation
  - Dynamic table creation
  - Schema validation
  - Error handling

- **`simple_create_tables.sql`** - Simplified table creation
  - Basic table structure
  - Essential columns only
  - Quick setup

#### Domain-Specific Tables
- **`product_list.sql`** - Product table structure
- **`product_type.sql`** - Product type table
- **`device_management.sql`** - Device management table
- **`device_production.sql`** - Device production table
- **`device_type.sql`** - Device type table
- **`firmware.sql`** - Firmware table
- **`toy_production.sql`** - Toy production table
- **`toy_production_new.sql`** - New toy production table
- **`toy_production_hyphen.sql`** - Hyphenated toy production table
- **`model_configuration.sql`** - Model configuration table

#### Setup Scripts
- **`setup_product_list_database.js`** - Product list database setup
- **`setup_product_type_database.js`** - Product type database setup
- **`setup_device_management_database.js`** - Device management database setup
- **`setup_device_production_database.js`** - Device production database setup
- **`setup_device_type_database.js`** - Device type database setup
- **`setup_firmware_database.js`** - Firmware database setup
- **`setup_toy_production_database.js`** - Toy production database setup
- **`setup_toy_production_new_database.js`** - New toy production database setup
- **`setup_toy_production_hyphen_database.js`** - Hyphenated toy production database setup
- **`setup_model_configuration_database.js`** - Model configuration database setup

#### Utility Scripts
- **`add_file_address_column.js`** - Add file address columns
- **`add_product_type_data.js`** - Add sample product type data
- **`update_product_list_data.js`** - Update product list data
- **`update_firmware_database.js`** - Update firmware database
- **`verify_product_type_count.js`** - Verify product type counts
- **`debug_table_structure.js`** - Debug table structures
- **`test_connection.js`** - Test database connections
- **`test_cloud_db.js`** - Test cloud database connections

---

## Database and Scripts

### SQL Scripts
- **`add_creator_name_column.sql`** - Add creator name column
- **`create_product_table.sql`** - Create product table
- **`insert_sample_data.sql`** - Insert sample data
- **`fix_encoding_final.sql`** - Fix encoding issues
- **`final_fix.sql`** - Comprehensive fixes
- **`cleanup_test_data.sql`** - Clean test data
- **`update_existing_records.sql`** - Update existing records
- **`insert_final.sql`** - Final data insertion
- **`insert_missing.sql`** - Insert missing data
- **`fix_corrupted_data.sql`** - Fix corrupted data
- **`fix_missing_data.sql`** - Fix missing data
- **`debug_data.sql`** - Debug data issues
- **`check_data.sql`** - Check data integrity
- **`recreate_table_20_rows.sql`** - Recreate table with sample data
- **`recreate_with_fresh_data.sql`** - Recreate with fresh data

### Migration Scripts
- **`run_migration.bat`** - Windows migration script
- **`run_migration.ps1`** - PowerShell migration script
- **`run_migration_simple.bat`** - Simple Windows migration
- **`run_migration_simple.ps1`** - Simple PowerShell migration

---

## Configuration Files

### Server Configuration
- **`CLOUD_DEV_SETUP.md`** - Cloud development setup guide
- **`GIT_TLS_FIX.md`** - Git TLS configuration fixes
- **`MULTI_API_ARCHITECTURE.md`** - Multi-API architecture documentation

### Database Configuration
- **`mysql_charset_fix.sql`** - MySQL character set fixes
- **`fix_encoding.ps1`** - PowerShell encoding fix script

---

## Utility Scripts

### Server Management
- **`start_server.bat`** - Start server (Windows)
- **`start_cloud_dev.bat`** - Start cloud development (Windows)
- **`start_cloud_dev.sh`** - Start cloud development (Linux/Mac)
- **`deploy.bat`** - Deploy application (Windows)
- **`deploy.ps1`** - Deploy application (PowerShell)

### System Monitoring
- **`check_server_status.sh`** - Check server status
- **`check_mysql_auth.sh`** - Check MySQL authentication
- **`check_public_ip.sh`** - Check public IP address
- **`access_app.sh`** - Access application script

### Problem Resolution
- **`fix_mysql_auth.sh`** - Fix MySQL authentication
- **`reset_mysql_password.sh`** - Reset MySQL password
- **`fix_server_issues.sh`** - Fix server issues
- **`fix_git_tls.sh`** - Fix Git TLS issues
- **`force_update_server.sh`** - Force server update

### Testing and Debugging
- **`test_api.js`** - Test API endpoints
- **`test_api_simple.js`** - Simple API testing
- **`test_db_connection.js`** - Test database connection
- **`test_db_encoding.js`** - Test database encoding
- **`test_db.js`** - Comprehensive database testing
- **`test_route_error.js`** - Test route error handling
- **`test_vite_proxy.js`** - Test Vite proxy configuration
- **`test_audio_access.js`** - Test audio file access

### File Management
- **`copy_files.bat`** - Copy files (Windows)
- **`copy_to_server.bat`** - Copy to server (Windows)
- **`copy_to_server.ps1`** - Copy to server (PowerShell)
- **`copy_to_server_simple.ps1`** - Simple copy to server (PowerShell)

---

## Documentation Files

### Project Documentation
- **`README.md`** - Main project readme
- **`README_EN.md`** - English project readme
- **`README_CN.md`** - Chinese project readme
- **`README_SETUP.md`** - Setup instructions

### Feature Documentation
- **`DYNAMIC_USERNAME_IMPLEMENTATION.md`** - Dynamic username feature
- **`EXCEL_IMPORT_GUIDE.md`** - Excel import functionality
- **`PRODUCT_LIST_SETUP.md`** - Product list setup guide
- **`TOY_PRODUCTION_SETUP.md`** - Toy production setup
- **`TOY_PRODUCTION_NEW_SETUP.md`** - New toy production setup
- **`TOY_PRODUCTION_HYPHEN_SETUP.md`** - Hyphenated toy production setup

### Architecture Documentation
- **`PROJECT_ARCHITECTURE_EN.md`** - English architecture guide
- **`PROJECT_ARCHITECTURE_CN.md`** - Chinese architecture guide
- **`FILE_REFERENCE_GUIDE.md`** - File reference guide
- **`FILE_RELATIONSHIP_DIAGRAM.md`** - File relationship diagrams

---

## File Relationships Summary

### Core Dependencies
1. **`main.ts`** → **`App.vue`** → **`MainLayout.vue`** → **Components/Views**
2. **`server.js`** → **Routes** → **Middleware** → **Database**
3. **`package.json`** → **Dependencies** → **Build Tools** → **Output**

### Data Flow
1. **User Input** → **Vue Component** → **Pinia Store** → **API Call** → **Express Route** → **MySQL**
2. **Database** → **API Response** → **Pinia Store** → **Vue Component** → **User Display**

### Build Process
1. **Source Files** → **Vite Build** → **Bundle** → **Production Files**
2. **TypeScript** → **Compilation** → **JavaScript** → **Browser**

This comprehensive file reference guide provides detailed information about every file in the Hewan Page Server project, explaining their purpose, functionality, and relationships within the system architecture.
