import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'h05010501',
  database: process.env.DB_NAME || 'page_test',
  charset: process.env.DB_CHARSET || 'utf8mb4',
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
      // Don't log the password for security
    });
  }
};

testConnection();

export default pool; 