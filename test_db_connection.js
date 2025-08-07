import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory and override existing variables
dotenv.config({ path: path.join(__dirname, 'server', '.env'), override: true });

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    console.log('Host:', process.env.DB_HOST);
    console.log('User:', process.env.DB_USER);
    console.log('Database:', process.env.DB_NAME);
    console.log('Password length:', process.env.DB_PASSWORD ? process.env.DB_PASSWORD.length : 0);
    console.log('Password (first 3 chars):', process.env.DB_PASSWORD ? process.env.DB_PASSWORD.substring(0, 3) + '***' : 'undefined');
    
    // Clean the password (remove quotes if present and handle escaped characters)
    let password = process.env.DB_PASSWORD || 'h05010501';
    if (password.startsWith('"') && password.endsWith('"')) {
      password = password.slice(1, -1);
    }
    if (password.startsWith("'") && password.endsWith("'")) {
      password = password.slice(1, -1);
    }
    
    // Handle escaped brackets - convert \[ to [ for MySQL
    if (password.includes('\\[')) {
      password = password.replace(/\\\[/g, '[');
    }
    if (password.includes('\\]')) {
      password = password.replace(/\\\]/g, ']');
    }
    
    console.log('Cleaned password length:', password.length);
    console.log('Cleaned password (first 3 chars):', password.substring(0, 3) + '***');
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: password,
      database: process.env.DB_NAME || 'page_test',
      charset: process.env.DB_CHARSET || 'utf8mb4'
    });
    
    console.log('✅ Database connection successful!');
    
    // Test a simple query
    const [rows] = await connection.execute('SHOW TABLES');
    console.log('📋 Tables in database:');
    rows.forEach(row => {
      console.log('   -', Object.values(row)[0]);
    });
    
    await connection.end();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Error code:', error.code);
    console.error('Error number:', error.errno);
    
    // Try alternative connection methods
    console.log('\n🔄 Trying alternative connection methods...');
    
    // Method 1: Try without database
    try {
      let password = process.env.DB_PASSWORD || 'h05010501';
      if (password.startsWith('"') && password.endsWith('"')) {
        password = password.slice(1, -1);
      }
      if (password.startsWith("'") && password.endsWith("'")) {
        password = password.slice(1, -1);
      }
      
      // Handle escaped brackets
      if (password.includes('\\[')) {
        password = password.replace(/\\\[/g, '[');
      }
      if (password.includes('\\]')) {
        password = password.replace(/\\\]/g, ']');
      }
      
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: password
      });
      console.log('✅ Connection without database successful');
      await connection.end();
    } catch (err) {
      console.error('❌ Connection without database failed:', err.message);
    }
    
    // Method 2: Try with the exact password we know works
    console.log('\n🔄 Trying with exact password...');
    try {
      const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'aV2[kO2#iX',
        database: 'page_test'
      });
      console.log('✅ Connection successful with exact password!');
      await connection.end();
    } catch (err) {
      console.error('❌ Even exact password failed:', err.message);
    }
    
    return false;
  }
}

testConnection(); 