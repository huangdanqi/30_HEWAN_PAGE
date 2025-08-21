const fs = require('fs');
const path = require('path');

// Ensure QRcode and barcode directories exist in public folder
const publicDir = path.join(__dirname, 'public');
const qrCodeDir = path.join(publicDir, 'QRcode');
const barcodeDir = path.join(publicDir, 'barcode');

console.log('Setting up directories...');

// Create directories if they don't exist
if (!fs.existsSync(qrCodeDir)) {
  fs.mkdirSync(qrCodeDir, { recursive: true });
  console.log('Created QRcode directory');
} else {
  console.log('QRcode directory already exists');
}

if (!fs.existsSync(barcodeDir)) {
  fs.mkdirSync(barcodeDir, { recursive: true });
  console.log('Created barcode directory');
} else {
  console.log('Barcode directory already exists');
}

// Create a sample QR code file for testing
const sampleQRFile = path.join(qrCodeDir, 'sample_qr.txt');
if (!fs.existsSync(sampleQRFile)) {
  fs.writeFileSync(sampleQRFile, 'Sample QR Code File\nGenerated on: ' + new Date().toISOString());
  console.log('Created sample QR code file');
}

// Create a sample barcode file for testing
const sampleBarcodeFile = path.join(barcodeDir, 'sample_barcode.txt');
if (!fs.existsSync(sampleBarcodeFile)) {
  fs.writeFileSync(sampleBarcodeFile, 'Sample Barcode File\nGenerated on: ' + new Date().toISOString());
  console.log('Created sample barcode file');
}

console.log('Directory setup completed successfully!');
