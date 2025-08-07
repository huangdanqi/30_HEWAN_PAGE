# Server Modular Structure

This server has been refactored into a modular structure for better maintainability and organization.

## Directory Structure

```
server/
├── config/
│   └── database.js          # Database connection configuration
├── middleware/
│   └── upload.js            # File upload middleware (multer configurations)
├── routes/
│   ├── accounts.js          # Account management routes
│   ├── ipManagement.js      # IP management routes
│   ├── ipAudio.js          # IP audio routes
│   ├── ipImage.js          # IP image routes
│   ├── ipVideo.js          # IP video routes
│   ├── ipMusic.js          # IP music routes
│   ├── alarm.js            # Alarm routes
│   ├── modelConfiguration.js # Model configuration routes
│   ├── agentConfiguration.js # Agent configuration routes
│   └── toolConfiguration.js # Tool configuration routes
├── server.js               # Main server file
├── .env                    # Environment variables
└── README.md              # This file
```

## File Descriptions

### Configuration Files

- **`config/database.js`**: Contains the MySQL connection pool configuration and exports the pool for use across the application.

### Middleware Files

- **`middleware/upload.js`**: Contains all multer configurations for different file types (audio, image, video) and exports the configured multer instances.

### Route Files

Each route file contains the specific endpoints for its domain:

- **`routes/accounts.js`**: Handles all account-related endpoints including basic data, membership, 4G service, and usage statistics.
- **`routes/ipManagement.js`**: Manages IP creation, updates, and retrieval.
- **`routes/ipAudio.js`**: Handles IP audio file uploads, updates, and management.
- **`routes/ipImage.js`**: Manages IP image file uploads, updates, and retrieval.
- **`routes/ipVideo.js`**: Handles IP video file uploads, updates, and deletion.
- **`routes/ipMusic.js`**: Manages IP music file uploads, updates, and deletion.
- **`routes/alarm.js`**: Handles alarm file uploads, updates, and management.
- **`routes/modelConfiguration.js`**: Manages model configuration CRUD operations.
- **`routes/agentConfiguration.js`**: Handles agent configuration CRUD operations.
- **`routes/toolConfiguration.js`**: Manages tool configuration CRUD operations.

### Main Server File

- **`server.js`**: The main entry point that imports all routes and middleware, sets up the Express app, and starts the server.

## API Endpoints

The modular structure maintains the same API endpoints as before:

- `/api/accounts/*` - Account management
- `/api/ip-management/*` - IP management
- `/api/ipaudio/*` - IP audio management
- `/api/ipimage/*` - IP image management
- `/api/ipvideo/*` - IP video management
- `/api/ipmusic/*` - IP music management
- `/api/alarm/*` - Alarm management
- `/api/model-configuration/*` - Model configuration
- `/api/agent-configuration/*` - Agent configuration
- `/api/tool-configuration/*` - Tool configuration

## Benefits of This Structure

1. **Modularity**: Each domain has its own route file, making the code easier to maintain.
2. **Separation of Concerns**: Database configuration, middleware, and routes are separated.
3. **Reusability**: Middleware and database connections can be reused across different routes.
4. **Maintainability**: Changes to one domain don't affect others.
5. **Scalability**: Easy to add new routes or modify existing ones without touching the main server file.

## Running the Server

The server can be started the same way as before:

```bash
node server.js
```

All functionality remains the same, but the code is now better organized and more maintainable. 