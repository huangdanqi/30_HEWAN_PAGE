import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

// Import database configuration
import pool from './config/database.js';

// Import middleware
import { upload, imageUpload, videoUpload } from './middleware/upload.js';

// Import routes
import accountsRoutes from './routes/accounts.js';
import ipManagementRoutes from './routes/ipManagement.js';
import ipAudioRoutes from './routes/ipAudio.js';
import ipImageRoutes from './routes/ipImage.js';
import ipVideoRoutes from './routes/ipVideo.js';
import ipMusicRoutes from './routes/ipMusic.js';
import alarmRoutes from './routes/alarm.js';
import modelConfigurationRoutes from './routes/modelConfiguration.js';
import agentConfigurationRoutes from './routes/agentConfiguration.js';
import toolConfigurationRoutes from './routes/toolConfiguration.js';

// Import new database routes
import deviceTypeRoutes from './routes/deviceType.js';
import firmwareRoutes from './routes/firmware.js';
import deviceProductionRoutes from './routes/deviceProduction.js';
import deviceManagementRoutes from './routes/deviceManagement.js';
import productTypeRoutes from './routes/productType.js';
import productListRoutes from './routes/productList.js';
import toyProductionRoutes from './routes/toyProduction.js';
import bomRoutes from './routes/bom.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 2829;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from public directory
app.use('/audio', express.static(path.join(__dirname, '..', 'public', 'audio')));
app.use('/images', express.static(path.join(__dirname, '..', 'public', 'images')));
app.use('/videos', express.static(path.join(__dirname, '..', 'public', 'videos')));
app.use('/firmware', express.static(path.join(__dirname, '..', 'public', 'firmware')));
app.use('/bom-files', express.static(path.join(__dirname, '..', 'public', 'bom-files')));
app.use('/public', express.static(path.join(__dirname, '..', 'public')));

// API Routes - Original routes
app.use('/api/accounts', accountsRoutes);
app.use('/api/ip-management', ipManagementRoutes);
app.use('/api/ipaudio', ipAudioRoutes);
app.use('/api/ipimage', ipImageRoutes);
app.use('/api/ipvideo', ipVideoRoutes);
app.use('/api/ipmusic', ipMusicRoutes);
app.use('/api/alarm', alarmRoutes);
app.use('/api/model-configuration', modelConfigurationRoutes);
app.use('/api/agent-configuration', agentConfigurationRoutes);
app.use('/api/tool-configuration', toolConfigurationRoutes);

// API Routes - New database routes
app.use('/api/device-type', deviceTypeRoutes);
app.use('/api/firmware', firmwareRoutes);
app.use('/api/device-production', deviceProductionRoutes);
app.use('/api/device-management', deviceManagementRoutes);
app.use('/api/product-type', productTypeRoutes);
app.use('/api/product-list', productListRoutes);
app.use('/api/toy-production', toyProductionRoutes);
app.use('/api', bomRoutes);

// Error handling middleware for multer errors
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    console.error('Multer error:', error);
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 50MB.' });
    }
    return res.status(400).json({ error: 'File upload error: ' + error.message });
  }
  
  if (error.message && error.message.includes('Invalid file type')) {
    return res.status(400).json({ error: error.message });
  }
  
  next(error);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  
  // Get public IP for external access
  exec('curl -s --max-time 3 ifconfig.me 2>/dev/null || curl -s --max-time 3 ipinfo.io/ip 2>/dev/null || curl -s --max-time 3 icanhazip.com 2>/dev/null || echo "localhost"', (error, stdout, stderr) => {
    const publicIP = stdout.trim();
    if (publicIP && publicIP !== 'localhost') {
      console.log(`Public access: http://${publicIP}:${PORT}/api/health`);
    }
  });
  
  console.log(`API Endpoints:`);
  console.log(`  - Basic Account Data: http://localhost:${PORT}/api/accounts/basic`);
  console.log(`  - Membership Data: http://localhost:${PORT}/api/accounts/membership`);
  console.log(`  - 4G Service Data: http://localhost:${PORT}/api/accounts/4g-service`);
  console.log(`  - Usage Statistics: http://localhost:${PORT}/api/accounts/usage`);
  console.log(`  - All Account Data: http://localhost:${PORT}/api/accounts`);
  console.log(`  - IP Management Data: http://localhost:${PORT}/api/ip-management`);
  console.log(`  - IPaudio Data: http://localhost:${PORT}/api/ipaudio`);
  console.log(`  - IPvideo Data: http://localhost:${PORT}/api/ipvideo`);
  console.log(`  - IPmusic Data: http://localhost:${PORT}/api/ipmusic`);
  console.log(`  - Alarm Data: http://localhost:${PORT}/api/alarm`);
  console.log(`  - Model Configuration: http://localhost:${PORT}/api/model-configuration`);
  console.log(`  - Agent Configuration: http://localhost:${PORT}/api/agent-configuration`);
  console.log(`  - Tool Configuration: http://localhost:${PORT}/api/tool-configuration`);
  console.log(`  - Device Type: http://localhost:${PORT}/api/device-type`);
  console.log(`  - Firmware: http://localhost:${PORT}/api/firmware`);
  console.log(`  - Device Production: http://localhost:${PORT}/api/device-production`);
  console.log(`  - Device Management: http://localhost:${PORT}/api/device-management`);
  console.log(`  - Product Type: http://localhost:${PORT}/api/product-type`);
  console.log(`  - Product List: http://localhost:${PORT}/api/product-list`);
  console.log(`  - Toy Production: http://localhost:${PORT}/api/toy-production`);
}); 