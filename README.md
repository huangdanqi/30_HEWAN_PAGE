# Hewan Page - Hotel Management System

A modern hotel management system built with Vue 3, TypeScript, and Ant Design Vue, featuring a complete backend API with MySQL database integration.

## Features

- **Login System**: Secure authentication system
- **Account Management**: Track income, expenses, and financial transactions with real-time database integration
- **Product Management**: Manage hotel products and services
- **OTA Integration**: Manage listings across multiple Online Travel Agencies (Booking.com, Expedia, Agoda, Airbnb)
- **Device Management**: Complete device lifecycle management including types, production, and firmware
- **IP Management**: Comprehensive IP management system for audio, image, video, and music resources
- **Alarm System**: Built-in alarm management and configuration
- **Configuration Management**: Model, agent, and tool configuration systems
- **File Upload System**: Support for audio, image, video, and firmware file uploads

## Tech Stack

### Frontend
- Vue 3 with Composition API
- TypeScript
- Vite
- Ant Design Vue 4.x
- Vue Router 4
- Pinia (State Management)
- Axios (API Client)

### Backend
- Node.js with Express
- MySQL Database
- Multer (File Upload)
- CORS
- dotenv (Environment Variables)

## Project Structure

```
hewan_page_server/
├── src/                    # Frontend Vue.js application
│   ├── assets/            # Static assets
│   ├── components/        # Reusable components
│   ├── layouts/           # Layout components
│   ├── router/            # Vue Router configuration
│   ├── stores/            # Pinia stores
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   ├── views/             # Page components
│   ├── App.vue            # Root component
│   └── main.ts            # Application entry point
├── server/                # Backend Node.js application
│   ├── config/            # Configuration files
│   │   └── database.js    # Database connection
│   ├── middleware/        # Express middleware
│   │   └── upload.js      # File upload middleware
│   ├── routes/            # API routes
│   │   ├── accounts.js    # Account management
│   │   ├── ipManagement.js # IP management
│   │   ├── ipAudio.js     # IP audio routes
│   │   ├── ipImage.js     # IP image routes
│   │   ├── ipVideo.js     # IP video routes
│   │   ├── ipMusic.js     # IP music routes
│   │   ├── alarm.js       # Alarm routes
│   │   ├── modelConfiguration.js # Model configuration
│   │   ├── agentConfiguration.js # Agent configuration
│   │   └── toolConfiguration.js  # Tool configuration
│   ├── database/          # Database setup and documentation
│   ├── server.js          # Main server file
│   └── .env               # Environment variables
├── public/                # Public assets
│   ├── audio/             # Audio files
│   ├── images/            # Image files
│   ├── videos/            # Video files
│   └── firmware/          # Firmware files
├── docs/                  # Built frontend files
└── README.md              # This file
```

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/huangdanqi/30_HEWAN_PAGE.git
cd hewan_page_server
```

### 2. Database Setup
```bash
# Create MySQL database
mysql -u your_username -p
CREATE DATABASE hewan_page CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Import database structure and sample data
mysql -u your_username -p hewan_page < create_database.sql
```

### 3. Environment Configuration
Create `.env` files in both root and server directories:

**Root `.env`:**
```env
VITE_API_BASE_URL=http://localhost:3001
```

**Server `.env`:**
```env
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=hewan_page
PORT=3001
```

### 4. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 5. Start the Application
```bash
# Start backend server (in one terminal)
cd server
npm start

# Start frontend development server (in another terminal)
npm run dev
```

### 6. Access the Application
- Frontend: http://localhost:5173 (or similar)
- Backend API: http://localhost:3001
- API Documentation: http://localhost:3001/api/health

## API Endpoints

### Account Management
- `GET /api/accounts` - Get account data with filtering and pagination
- `GET /api/filter-options` - Get available filter options
- `GET /api/health` - Health check

### IP Management
- `GET /api/ip-management` - Get IP management data
- `POST /api/ip-management` - Create new IP record
- `PUT /api/ip-management/:id` - Update IP record
- `DELETE /api/ip-management/:id` - Delete IP record

### File Management
- `POST /api/ipaudio/upload` - Upload audio files
- `POST /api/ipimage/upload` - Upload image files
- `POST /api/ipvideo/upload` - Upload video files
- `POST /api/ipmusic/upload` - Upload music files
- `POST /api/alarm/upload` - Upload alarm files

### Configuration Management
- `GET /api/model-configuration` - Get model configurations
- `GET /api/agent-configuration` - Get agent configurations
- `GET /api/tool-configuration` - Get tool configurations

## Database Tables

### Core Tables
- `account_data` - Account management and user data
- `device_type` - Device model information
- `firmware` - Firmware version management
- `device_production` - Device production tracking
- `device_management` - Individual device management
- `product_type` - Product type definitions
- `product_list` - Product inventory
- `ip_management` - IP resource management
- `ip_audio` - IP audio resources
- `ip_image` - IP image resources
- `ip_video` - IP video resources
- `ip_music` - IP music resources
- `alarm` - Alarm system data

## Development

### Frontend Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Backend Development
```bash
# Start backend server
cd server
npm start

# Run in development mode with auto-restart
npm run dev
```

### Database Development
```bash
# Connect to database
mysql -u your_username -p hewan_page

# Run SQL scripts
mysql -u your_username -p hewan_page < script_name.sql
```

## Deployment

### Production Build
```bash
# Build frontend
npm run build

# The built files will be in the `docs` directory
# Deploy the contents of the `docs` directory to your web server
```

### Server Deployment
```bash
# Deploy backend
cd server
npm install --production
npm start
```

### Using Deployment Scripts
```bash
# Windows
deploy.bat

# PowerShell
.\deploy.ps1
```

## Environment Variables

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:3001
```

### Backend (server/.env)
```env
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=hewan_page
PORT=3001
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Check the [documentation](docs/)
- Review [README_SETUP.md](README_SETUP.md) for detailed setup instructions
- Check [server/README.md](server/README.md) for backend documentation
- Review [MULTI_API_ARCHITECTURE.md](MULTI_API_ARCHITECTURE.md) for architecture details
