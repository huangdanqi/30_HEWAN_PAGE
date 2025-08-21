import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import fs from 'fs';

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
app.use('/QRcode', express.static(path.join(__dirname, '..', 'public', 'QRcode')));
app.use('/barcode', express.static(path.join(__dirname, '..', 'public', 'barcode')));
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

// General file download endpoint
app.get('/api/files/download', (req, res) => {
  try {
    const { filePath } = req.query;
    
    if (!filePath) {
      return res.status(400).json({ error: 'File path is required' });
    }
    
    // Construct the full file path
    const fullPath = path.join(__dirname, '..', 'public', filePath);
    
    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Get file stats
    const stats = fs.statSync(fullPath);
    
    // Set appropriate headers
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Content-Disposition', `attachment; filename="${path.basename(filePath)}"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(fullPath);
    fileStream.pipe(res);
    
  } catch (error) {
    console.error('File download error:', error);
    res.status(500).json({ error: 'File download failed' });
  }
});

// File upload endpoint for QR codes and barcodes
app.post('/api/files/upload', express.json({ limit: '10mb' }), async (req, res) => {
  try {
    const { fileType, filename, data, productId } = req.body;
    
    if (!fileType || !filename || !data) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Determine the directory based on file type
    let uploadDir;
    if (fileType === 'qrcode') {
      uploadDir = path.join(__dirname, '..', 'public', 'QRcode');
    } else if (fileType === 'barcode') {
      uploadDir = path.join(__dirname, '..', 'public', 'barcode');
    } else {
      return res.status(400).json({ error: 'Invalid file type' });
    }
    
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Remove data URL prefix if present
    let base64Data = data;
    if (data.startsWith('data:image/png;base64,')) {
      base64Data = data.split(',')[1];
    }
    
    // Save the file
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
    
    // Return the relative path for storage in database
    const relativePath = `/${fileType === 'qrcode' ? 'QRcode' : 'barcode'}/${filename}`;
    
    res.json({
      success: true,
      filePath: relativePath,
      message: 'File uploaded successfully'
    });
    
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'File upload failed' });
  }
});

// Test endpoint to generate sample QR codes and barcodes
app.post('/api/files/generate-test', async (req, res) => {
  try {
    const { productId, productName, ipRole, productModel, manufacturer, productionBatch } = req.body;
    
    // Ensure directories exist
    const qrCodeDir = path.join(__dirname, '..', 'public', 'QRcode');
    const barcodeDir = path.join(__dirname, '..', 'public', 'barcode');
    
    if (!fs.existsSync(qrCodeDir)) {
      fs.mkdirSync(qrCodeDir, { recursive: true });
    }
    if (!fs.existsSync(barcodeDir)) {
      fs.mkdirSync(barcodeDir, { recursive: true });
    }
    
    // Generate QR code data
    const qrData = JSON.stringify({
      productId: productId,
      productName: productName,
      ipRole: ipRole,
      productModel: productModel,
      manufacturer: manufacturer,
      productionBatch: productionBatch,
      timestamp: new Date().toISOString()
    });
    
    // Generate barcode data (just the product ID for simplicity)
    const barcodeData = productId;
    
    // Create filenames
    const timestamp = Date.now();
    const qrFilename = `QR_${productId}_${timestamp}.png`;
    const barcodeFilename = `BAR_${productId}_${timestamp}.png`;
    
    // For now, create simple text files as placeholders
    // In production, you would use a QR code and barcode library
    const qrFilePath = path.join(qrCodeDir, qrFilename);
    const barcodeFilePath = path.join(barcodeDir, barcodeFilename);
    
    // Write QR code data to file (placeholder)
    fs.writeFileSync(qrFilePath, `QR Code Data: ${qrData}`);
    
    // Write barcode data to file (placeholder)
    fs.writeFileSync(barcodeFilePath, `Barcode Data: ${barcodeData}`);
    
    res.json({
      success: true,
      qrCodePath: `/QRcode/${qrFilename}`,
      barcodePath: `/barcode/${barcodeFilename}`,
      message: 'Test files generated successfully'
    });
    
  } catch (error) {
    console.error('Test file generation error:', error);
    res.status(500).json({ error: 'Test file generation failed' });
  }
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