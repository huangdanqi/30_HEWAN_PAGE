import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    console.log('Host:', process.env.DB_HOST);
    console.log('User:', process.env.DB_USER);
    console.log('Database:', process.env.DB_NAME);
    console.log('Password length:', process.env.DB_PASSWORD ? process.env.DB_PASSWORD.length : 0);
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'h05010501',
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
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'h05010501'
      });
      console.log('✅ Connection without database successful');
      await connection.end();
    } catch (err) {
      console.error('❌ Connection without database failed:', err.message);
    }
    
    return false;
  }
}

testConnection(); 