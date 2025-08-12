import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// If dotenv didn't work properly, manually read the .env file
if (!process.env.DB_PASSWORD || process.env.DB_PASSWORD.length < 10) {
  console.log('🔍 Manually reading .env file for database config...');
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('DB_PASSWORD=')) {
        const password = trimmedLine.substring('DB_PASSWORD='.length);
        process.env.DB_PASSWORD = password;
        console.log('✅ Manually set DB_PASSWORD from .env');
        break;
      }
    }
  }
}

// Clean the password (remove quotes if present)
let password = process.env.DB_PASSWORD || 'h05010501';
if (password.startsWith('"') && password.endsWith('"')) {
  password = password.slice(1, -1);
}
if (password.startsWith("'") && password.endsWith("'")) {
  password = password.slice(1, -1);
}

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306, // Add port configuration
  user: process.env.DB_USER || 'root',
  password: password,
  database: process.env.DB_NAME || 'page_test',
  charset: 'utf8mb4',
  supportBigNumbers: true,
  bigNumberStrings: true,
  dateStrings: true,
  timezone: '+00:00',
  connectionLimit: 10,
  // Add these options for better compatibility
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
});

// Test the pool connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Database pool connected successfully');
    connection.release();
  } catch (err) {
    console.error('Database pool connection error:', err);
    console.error('Connection details:', {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
      passwordLength: password.length,
      // Don't log the password for security
    });
  }
};

testConnection();

export default pool; 