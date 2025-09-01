# HeWan Page Server - Complete Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Installation & Setup](#installation--setup)
4. [Database Structure](#database-structure)
5. [API Documentation](#api-documentation)
6. [Frontend Components](#frontend-components)
7. [File Structure](#file-structure)
8. [Configuration](#configuration)
9. [Development Guide](#development-guide)
10. [Deployment](#deployment)
11. [Troubleshooting](#troubleshooting)

## Project Overview

HeWan Page Server is a comprehensive management platform for smart toy manufacturing and device management. The system provides a complete solution for managing products, devices, firmware, IP resources, and production processes.

### Key Features
- **Account Management**: User registration, authentication, and membership management
- **Product Management**: Complete product lifecycle from creation to production
- **Device Management**: Device registration, firmware updates, and status monitoring
- **IP Resource Management**: Audio, video, image, and music file management
- **Production Management**: Device and toy production tracking
- **Configuration Management**: Model, agent, and tool configuration systems
- **File Upload System**: Support for various file types with size validation
- **Real-time Monitoring**: Device status and IP management

### Technology Stack
- **Frontend**: Vue 3 + TypeScript + Ant Design Vue + Vite
- **Backend**: Node.js + Express + MySQL
- **Database**: MySQL 8.0+
- **File Storage**: Local file system with organized directories
- **Authentication**: Session-based authentication

## System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (Vue 3)       │◄──►│   (Express)     │◄──►│   (MySQL)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Static Files  │    │   File Upload   │    │   File Storage │
│   (Public)      │    │   (Multer)      │    │   (Local FS)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn
- Git

### Step 1: Clone Repository
```bash
git clone https://github.com/huangdanqi/30_HEWAN_PAGE.git
cd hewan_page_server
```

### Step 2: Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies (if separate package.json)
cd server
npm install
cd ..
```

### Step 3: Database Setup
```bash
# Create MySQL database
mysql -u your_username -p
CREATE DATABASE hewan_page_server CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Import complete database structure
mysql -u your_username -p hewan_page_server < server/database/setup_complete_database.sql
```

### Step 4: Environment Configuration
Create `.env` file in the root directory:
```env
# Database Configuration
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=hewan_page_server
DB_PORT=3306

# Server Configuration
PORT=2829
NODE_ENV=development

# Frontend Configuration
VITE_PORT=2830
VITE_API_BASE_URL=http://127.0.0.1:2829
```

### Step 5: Start Development Servers
```bash
# Start backend server
cd server
npm start

# Start frontend development server (in new terminal)
npm run dev
```

## Database Structure

The system uses 18 main tables to manage all aspects of the platform:

### Core Tables

#### 1. account_data (账户数据表)
- **Purpose**: Stores user account information and membership details
- **Key Fields**: member_id, device_id, product_id, member_payment, member_expiration_time
- **Relationships**: Links to product_list and device_management

#### 2. product_list (产品列表表)
- **Purpose**: Manages product inventory and tracking
- **Key Fields**: serial_number, product_id, product_model, production_batch, device_id
- **Relationships**: Links to account_data, device_management, product_type

#### 3. device_management (设备管理表)
- **Purpose**: Tracks device lifecycle and firmware versions
- **Key Fields**: device_id, device_model, current_firmware_version, bound_sub_account
- **Relationships**: Links to product_list, device_type, firmware

#### 4. device_type (设备型号表)
- **Purpose**: Defines available device models and specifications
- **Key Fields**: device_model_id, device_model_name, enable_4g, latest_firmware_version
- **Relationships**: Links to device_management, firmware

#### 5. firmware (固件管理表)
- **Purpose**: Manages firmware versions and releases
- **Key Fields**: device_model, version_number, file_path, release_time
- **Relationships**: Links to device_type, device_management

### Production Tables

#### 6. device_production (设备生产表)
- **Purpose**: Tracks device manufacturing process
- **Key Fields**: production_device_id, device_model, production_batch, quantity, total_price

#### 7. toy_production_new (玩具生产表)
- **Purpose**: Manages toy manufacturing and inventory
- **Key Fields**: product_id, device_model, production_batch, quantity, total_price

#### 8. product_type (产品型号表)
- **Purpose**: Defines product categories and specifications
- **Key Fields**: product_id, product_model, product_name, product_type, device_model

### IP Resource Tables

#### 9. ip_management (IP管理表)
- **Purpose**: Tracks device IP addresses and online status
- **Key Fields**: ip_address, device_id, status, last_seen

#### 10. ip_audio (IP音频表)
- **Purpose**: Manages audio files for devices
- **Key Fields**: audio_id, audio_name, audio_file_address, duration, file_size

#### 11. ip_video (IP视频表)
- **Purpose**: Manages video files for devices
- **Key Fields**: video_id, video_name, video_file_address, duration, resolution

#### 12. ip_image (IP图片表)
- **Purpose**: Manages image files for devices
- **Key Fields**: image_id, image_name, image_file_address, resolution

#### 13. ip_music (IP音乐表)
- **Purpose**: Manages music files for devices
- **Key Fields**: music_id, music_name, music_file_address, artist, album

### Configuration Tables

#### 14. model_configuration (型号配置表)
- **Purpose**: Stores device model configurations
- **Key Fields**: model_id, model_name, configuration_data (JSON), status

#### 15. agent_configuration (代理配置表)
- **Purpose**: Manages AI agent configurations
- **Key Fields**: agent_id, agent_name, agent_type, configuration_data (JSON)

#### 16. tool_configuration (工具配置表)
- **Purpose**: Manages tool configurations
- **Key Fields**: tool_id, tool_name, tool_type, configuration_data (JSON)

### Utility Tables

#### 17. alarm (闹钟表)
- **Purpose**: Manages alarm settings and files
- **Key Fields**: alarmId, alarmName, alarmFileAddress

#### 18. bom (物料清单表)
- **Purpose**: Manages Bill of Materials for products
- **Key Fields**: bom_id, product_model, component_name, quantity, unit_price

## API Documentation

### Authentication Endpoints
- `POST /api/accounts/login` - User login
- `POST /api/accounts/register` - User registration
- `GET /api/accounts/profile` - Get user profile

### Product Management
- `GET /api/product-list` - Get all products
- `POST /api/product-list` - Create new product
- `PUT /api/product-list/:id` - Update product
- `DELETE /api/product-list/:id` - Delete product

### Device Management
- `GET /api/device-management` - Get all devices
- `POST /api/device-management` - Register new device
- `PUT /api/device-management/:id` - Update device
- `DELETE /api/device-management/:id` - Delete device

### Firmware Management
- `GET /api/firmware` - Get all firmware versions
- `POST /api/firmware` - Upload new firmware
- `PUT /api/firmware/:id` - Update firmware
- `DELETE /api/firmware/:id` - Delete firmware

### IP Resource Management
- `GET /api/ipaudio` - Get audio files
- `POST /api/ipaudio` - Upload audio file
- `GET /api/ipvideo` - Get video files
- `POST /api/ipvideo` - Upload video file
- `GET /api/ipimage` - Get image files
- `POST /api/ipimage` - Upload image file
- `GET /api/ipmusic` - Get music files
- `POST /api/ipmusic` - Upload music file

### Production Management
- `GET /api/device-production` - Get device production records
- `POST /api/device-production` - Create production record
- `GET /api/toy-production` - Get toy production records
- `POST /api/toy-production` - Create toy production record

### Configuration Management
- `GET /api/model-configuration` - Get model configurations
- `POST /api/model-configuration` - Create configuration
- `GET /api/agent-configuration` - Get agent configurations
- `POST /api/agent-configuration` - Create agent configuration
- `GET /api/tool-configuration` - Get tool configurations
- `POST /api/tool-configuration` - Create tool configuration

## Frontend Components

### Main Views

#### 1. Login.vue
- **Purpose**: User authentication interface
- **Features**: Login form, validation, error handling
- **Location**: `src/views/Login.vue`

#### 2. ProductList.vue
- **Purpose**: Product inventory management
- **Features**: CRUD operations, search, filtering, pagination
- **Key Components**: ProductCreateModal, AddBatchModal
- **Location**: `src/views/ProductList.vue`

#### 3. DeviceManagement.vue
- **Purpose**: Device lifecycle management
- **Features**: Device registration, firmware updates, status monitoring
- **Key Components**: DeviceImportModal
- **Location**: `src/views/DeviceManagement.vue`

#### 4. Firmware.vue
- **Purpose**: Firmware version management
- **Features**: Upload, version control, release management
- **Key Components**: FirmwareEditModal, FirmwareReleaseModal
- **Location**: `src/views/Firmware.vue`

#### 5. IPAudio.vue, IPVideo.vue, IPImage.vue, MusicResources.vue
- **Purpose**: IP resource management
- **Features**: File upload, preview, categorization
- **Location**: `src/views/IPAudio.vue`, etc.

### Reusable Components

#### 1. AppSidebar.vue
- **Purpose**: Main navigation sidebar
- **Features**: Menu items, active state, collapsible
- **Location**: `src/components/AppSidebar.vue`

#### 2. AppTopbar.vue
- **Purpose**: Top navigation bar
- **Features**: User info, logout, notifications
- **Location**: `src/components/AppTopbar.vue`

#### 3. Modal Components
- **ProductCreateModal.vue**: Product creation form
- **DeviceImportModal.vue**: Device import functionality
- **FirmwareEditModal.vue**: Firmware editing interface
- **BomUploadModal.vue**: BOM file upload

## File Structure

```
hewan_page_server/
├── src/                          # Frontend Vue.js application
│   ├── assets/                   # Static assets (images, icons)
│   ├── components/               # Reusable Vue components
│   │   ├── AppSidebar.vue       # Main navigation sidebar
│   │   ├── AppTopbar.vue        # Top navigation bar
│   │   ├── ProductCreateModal.vue # Product creation modal
│   │   ├── DeviceImportModal.vue # Device import modal
│   │   ├── FirmwareEditModal.vue # Firmware editing modal
│   │   └── BomUploadModal.vue   # BOM upload modal
│   ├── layouts/                  # Layout components
│   │   └── MainLayout.vue       # Main application layout
│   ├── router/                   # Vue Router configuration
│   │   └── index.ts             # Route definitions
│   ├── stores/                   # Pinia state management
│   │   └── auth.ts              # Authentication store
│   ├── utils/                    # Utility functions
│   │   ├── api.ts               # API client configuration
│   │   └── tableConfig.ts       # Table configuration
│   ├── views/                    # Page components
│   │   ├── Login.vue            # Login page
│   │   ├── ProductList.vue      # Product management
│   │   ├── DeviceManagement.vue # Device management
│   │   ├── Firmware.vue         # Firmware management
│   │   ├── IPAudio.vue          # Audio resource management
│   │   ├── IPVideo.vue          # Video resource management
│   │   ├── IPImage.vue          # Image resource management
│   │   ├── MusicResources.vue  # Music resource management
│   │   ├── ToyProduction.vue    # Toy production management
│   │   ├── DeviceProduction.vue # Device production management
│   │   ├── ProductType.vue      # Product type management
│   │   ├── DeviceType.vue       # Device type management
│   │   ├── ModelConfiguration.vue # Model configuration
│   │   ├── AgentConfiguration.vue # Agent configuration
│   │   ├── ToolConfiguration.vue # Tool configuration
│   │   ├── BuiltInAlarm.vue     # Alarm management
│   │   ├── IPManagement.vue     # IP management
│   │   └── Account.vue          # Account management
│   ├── App.vue                   # Root component
│   └── main.ts                   # Application entry point
├── server/                       # Backend Node.js application
│   ├── config/                   # Configuration files
│   │   └── database.js           # Database connection configuration
│   ├── middleware/               # Express middleware
│   │   └── upload.js             # File upload middleware
│   ├── routes/                    # API routes
│   │   ├── accounts.js           # Account management routes
│   │   ├── productList.js        # Product list routes
│   │   ├── deviceManagement.js   # Device management routes
│   │   ├── firmware.js           # Firmware routes
│   │   ├── ipAudio.js            # IP audio routes
│   │   ├── ipVideo.js            # IP video routes
│   │   ├── ipImage.js            # IP image routes
│   │   ├── ipMusic.js            # IP music routes
│   │   ├── ipManagement.js       # IP management routes
│   │   ├── toyProduction.js      # Toy production routes
│   │   ├── deviceProduction.js   # Device production routes
│   │   ├── productType.js        # Product type routes
│   │   ├── deviceType.js         # Device type routes
│   │   ├── modelConfiguration.js # Model configuration routes
│   │   ├── agentConfiguration.js # Agent configuration routes
│   │   ├── toolConfiguration.js  # Tool configuration routes
│   │   ├── alarm.js              # Alarm routes
│   │   └── bom.js                # BOM routes
│   ├── database/                  # Database setup and documentation
│   │   ├── setup_complete_database.sql # Complete database setup
│   │   ├── 01_create_database.sql # Database creation
│   │   ├── 02_sample_data.sql    # Sample data insertion
│   │   └── README.md              # Database documentation
│   ├── scripts/                   # Database setup scripts
│   │   └── setup-database.js     # Database initialization script
│   └── server.js                  # Main server file
├── public/                        # Public assets
│   ├── audio/                     # Audio files
│   ├── images/                     # Image files
│   ├── videos/                     # Video files
│   ├── firmware/                   # Firmware files
│   ├── bom-files/                  # BOM files
│   ├── QRcode/                     # QR code files
│   └── barcode/                    # Barcode files
├── docs/                          # Built frontend files (production)
├── package.json                   # Frontend dependencies
├── vite.config.ts                 # Vite configuration
├── tsconfig.json                  # TypeScript configuration
├── README.md                      # Main documentation
└── README_EN.md                   # English documentation
```

## Configuration

### Environment Variables

#### Backend (.env in server directory)
```env
# Database Configuration
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=hewan_page_server
DB_PORT=3306

# Server Configuration
PORT=2829
NODE_ENV=development

# File Upload Configuration
MAX_FILE_SIZE=52428800  # 50MB in bytes
UPLOAD_PATH=../public
```

#### Frontend (vite.config.ts)
```typescript
export default defineConfig({
  base: '/30_HEWAN_PAGE/',
  server: {
    port: 2830,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:2829',
        changeOrigin: true,
      },
    },
  },
})
```

### Database Configuration
```javascript
// server/config/database.js
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hewan_page_server',
  port: process.env.DB_PORT || 3306,
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
```

## Development Guide

### Adding New Features

#### 1. Backend API Development
1. Create new route file in `server/routes/`
2. Define API endpoints with proper error handling
3. Add database queries using the connection pool
4. Implement file upload middleware if needed
5. Add route to `server.js`

#### 2. Frontend Component Development
1. Create new Vue component in `src/views/`
2. Add route definition in `src/router/index.ts`
3. Implement API calls using `src/utils/api.ts`
4. Add to navigation menu in `src/components/AppSidebar.vue`

#### 3. Database Schema Changes
1. Create migration SQL file
2. Update `setup_complete_database.sql`
3. Test with sample data
4. Update documentation

### Code Standards

#### Backend (Node.js/Express)
- Use ES6 modules
- Implement proper error handling
- Use async/await for database operations
- Validate input data
- Use meaningful variable names

#### Frontend (Vue 3/TypeScript)
- Use Composition API
- Implement TypeScript interfaces
- Use Ant Design Vue components
- Follow Vue.js best practices
- Implement proper error handling

### Testing
```bash
# Test database connection
cd server
node test_connection.js

# Test API endpoints
node test_api.js

# Test file upload
node test_upload.js
```

## Deployment

### Production Build
```bash
# Build frontend
npm run build

# The built files will be in the docs/ directory
```

### Server Deployment
```bash
# Install PM2 for process management
npm install -g pm2

# Start server with PM2
cd server
pm2 start server.js --name hewan-page-server

# Monitor server
pm2 status
pm2 logs hewan-page-server
```

### Database Migration
```bash
# Backup existing database
mysqldump -u username -p hewan_page_server > backup.sql

# Apply new schema
mysql -u username -p hewan_page_server < migration.sql
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Issues
- Check database credentials in `.env`
- Verify MySQL service is running
- Check firewall settings
- Test connection with `mysql -u username -p`

#### 2. File Upload Issues
- Check file size limits in `upload.js`
- Verify upload directory permissions
- Check disk space
- Review file type restrictions

#### 3. Frontend Build Issues
- Clear node_modules and reinstall
- Check TypeScript errors
- Verify Vite configuration
- Check for missing dependencies

#### 4. API Connection Issues
- Verify backend server is running
- Check CORS configuration
- Review proxy settings in `vite.config.ts`
- Check network connectivity

### Debug Commands
```bash
# Check server status
curl http://localhost:2829/api/health

# Test database connection
cd server && node test_db_connection.js

# Check file permissions
ls -la public/

# Monitor server logs
pm2 logs hewan-page-server
```

### Performance Optimization
- Implement database indexing
- Use connection pooling
- Optimize file uploads
- Implement caching strategies
- Monitor memory usage

## Support

For technical support or questions:
- Check the troubleshooting section above
- Review the database documentation in `server/database/README.md`
- Examine the API documentation in each route file
- Check the Vue.js component documentation

## License

This project is licensed under the MIT License.
