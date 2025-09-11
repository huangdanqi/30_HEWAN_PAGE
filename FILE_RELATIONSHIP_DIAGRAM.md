# Hewan Page Server - File Relationship Diagram

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              HEWAN PAGE SERVER                                    │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                    FRONTEND                                       │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐              │
│  │   main.ts       │    │   App.vue       │    │ MainLayout.vue  │              │
│  │   (Entry)       │───▶│   (Root)        │───▶│   (Wrapper)     │              │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘              │
│           │                       │                       │                      │
│           ▼                       ▼                       ▼                      │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐              │
│  │   Router        │    │   Stores        │    │   Components    │              │
│  │   (Navigation)  │    │   (Pinia)       │    │   (Reusable)    │              │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘              │
│           │                       │                       │                      │
│           ▼                       ▼                       ▼                      │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐              │
│  │   Views         │    │   Utils         │    │   Assets        │              │
│  │   (Pages)       │    │   (Helpers)     │    │   (Media)       │              │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘              │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                    BACKEND                                        │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐              │
│  │   server.js     │    │   Routes        │    │   Middleware    │              │
│  │   (Express)     │───▶│   (API)         │───▶│   (Upload)      │              │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘              │
│           │                       │                       │                      │
│           ▼                       ▼                       ▼                      │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐              │
│  │   Config        │    │   Database      │    │   Scripts       │              │
│  │   (DB Config)   │    │   (MySQL)       │    │   (Setup)       │              │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘              │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                   DATABASE                                        │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐              │
│  │  product_list   │    │ device_management│   │    firmware     │              │
│  │  (Products)     │    │   (Devices)      │    │   (Updates)     │              │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘              │
│           │                       │                       │                      │
│           ▼                       ▼                       ▼                      │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐              │
│  │ toy_production  │    │  user_accounts  │    │  model_config   │              │
│  │  (Production)   │    │    (Users)      │    │  (Settings)     │              │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘              │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## Frontend Component Hierarchy

```
main.ts
  └── App.vue
      └── MainLayout.vue
          ├── AppSidebar.vue (Navigation)
          ├── AppTopbar.vue (Header)
          └── Router View
              ├── Login.vue
              ├── ProductList.vue
              │   ├── ProductCreateModal.vue
              │   ├── AddBatchModal.vue
              │   └── LogQueryTable.vue
              ├── DeviceManagement.vue
              │   └── DeviceImportModal.vue
              ├── Firmware.vue
              │   ├── FirmwareEditModal.vue
              │   └── FirmwareReleaseModal.vue
              ├── ToyProduction.vue
              ├── IPManagement.vue
              │   ├── IPAudio.vue
              │   ├── IPImage.vue
              │   └── IPVideo.vue
              └── Other Views...
```

## Backend API Structure

```
server.js (Main Server)
  ├── /api/accounts (User Management)
  ├── /api/productList (Product CRUD)
  ├── /api/productType (Product Categories)
  ├── /api/deviceManagement (Device Tracking)
  ├── /api/deviceProduction (Production Data)
  ├── /api/deviceType (Device Categories)
  ├── /api/firmware (Firmware Management)
  ├── /api/toyProduction (Toy Production)
  ├── /api/modelConfiguration (Model Settings)
  ├── /api/toolConfiguration (Tool Settings)
  ├── /api/ipManagement (IP Addresses)
  ├── /api/ipAudio (Audio Files)
  ├── /api/ipImage (Image Files)
  ├── /api/ipVideo (Video Files)
  ├── /api/alarm (Alarm Management)
  ├── /api/bom (Bill of Materials)
  └── /api/agentConfiguration (Agent Settings)
```

## Database Table Relationships

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   product_list  │    │  product_type   │    │ device_management│
│                 │    │                 │    │                 │
│ • id (PK)       │◄───│ • id (PK)       │    │ • id (PK)       │
│ • name          │    │ • name          │    │ • name          │
│ • type_id (FK)  │    │ • description   │    │ • type_id (FK)  │
│ • creator_id    │    │ • created_at    │    │ • status        │
│ • creator_name  │    │ • updated_at    │    │ • location      │
│ • created_at    │    └─────────────────┘    │ • created_at    │
│ • updated_at    │                           │ • updated_at    │
└─────────────────┘                           └─────────────────┘
         │                                              │
         │                                              │
         ▼                                              ▼
┌─────────────────┐                           ┌─────────────────┐
│ toy_production  │                           │  device_type    │
│                 │                           │                 │
│ • id (PK)       │                           │ • id (PK)       │
│ • product_id(FK)│                           │ • name          │
│ • quantity      │                           │ • description   │
│ • status        │                           │ • created_at    │
│ • created_at    │                           │ • updated_at    │
│ • updated_at    │                           └─────────────────┘
└─────────────────┘
```

## File Dependencies Flow

### Frontend Data Flow
```
User Input → Vue Component → Pinia Store → API Utility → HTTP Request
    ↑                                                                  ↓
Display ← Vue Component ← Pinia Store ← API Response ← HTTP Response
```

### Backend Data Flow
```
HTTP Request → Express Middleware → Route Handler → Database Query → MySQL
     ↑                                                                  ↓
HTTP Response ← Express Middleware ← Route Handler ← Query Result ← MySQL
```

### Build Process
```
Source Files → Vite Build → Bundle → Production Files
     ↓
TypeScript → Compilation → JavaScript → Browser
```

## Key File Functions

### Core Application Files
- **`main.ts`**: Application bootstrap, Vue app initialization
- **`App.vue`**: Root component, global layout structure
- **`server.js`**: Express server, middleware setup, route registration

### Configuration Files
- **`vite.config.ts`**: Build configuration, development server settings
- **`tsconfig.json`**: TypeScript compiler options
- **`package.json`**: Dependencies, scripts, project metadata

### Database Files
- **`database.js`**: MySQL connection configuration
- **`*.sql`**: Table creation, data insertion, schema updates
- **`setup_*.js`**: Database initialization scripts

### Route Files
- **`productList.js`**: Product CRUD operations, batch processing
- **`deviceManagement.js`**: Device tracking, status updates
- **`firmware.js`**: Firmware version management, file handling

### Component Files
- **`AppSidebar.vue`**: Navigation menu, route links
- **`ProductList.vue`**: Product table, search, filtering
- **`DeviceManagement.vue`**: Device status, location tracking

## Development Workflow Files

### Setup Scripts
- **`run_migration.*`**: Database schema updates
- **`start_server.*`**: Server startup automation
- **`deploy.*`**: Production deployment automation

### Utility Scripts
- **`check_*.sh`**: System health monitoring
- **`fix_*.sh`**: Problem resolution automation
- **`test_*.js`**: Connection and functionality testing

## File Organization Principles

### 1. Separation of Concerns
- Frontend (Vue.js) and Backend (Node.js) are completely separate
- Each route handles a specific domain (products, devices, firmware)
- Components are reusable and focused on single responsibilities

### 2. Configuration Management
- Environment-specific settings in config files
- Database credentials in separate configuration files
- Build settings centralized in Vite configuration

### 3. Database Organization
- Each domain has its own table structure
- Foreign key relationships maintain data integrity
- Migration scripts handle schema evolution

### 4. Asset Management
- Static files organized by type (images, audio, video)
- Firmware files stored separately for security
- Media resources categorized by IP management system

This diagram provides a comprehensive view of how all the files in the Hewan Page Server project relate to each other and work together to create a complete full-stack application.
