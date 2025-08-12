import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  console.log('🔍 Testing database connection...');
  console.log('Environment variables:');
  console.log('  DB_HOST:', process.env.DB_HOST);
  console.log('  DB_PORT:', process.env.DB_PORT);
  console.log('  DB_USER:', process.env.DB_USER);
  console.log('  DB_NAME:', process.env.DB_NAME);
  console.log('  DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'NOT SET');
  
  try {
    // Try standard MySQL port first
    console.log('\n🔌 Trying standard MySQL port (3306)...');
    const pool1 = mysql.createPool({
      host: process.env.DB_HOST,
      port: 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      charset: 'utf8mb4',
      connectTimeout: 10000,
      acquireTimeout: 10000,
      timeout: 10000
    });
    
    const connection1 = await pool1.getConnection();
    console.log('✅ Connection successful on port 3306');
    connection1.release();
    await pool1.end();
    
  } catch (error1) {
    console.log('❌ Connection failed on port 3306:', error1.message);
    
    try {
      // Try custom port
      console.log('\n🔌 Trying custom port (2829)...');
      const pool2 = mysql.createPool({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT) || 2829,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        charset: 'utf8mb4',
        connectTimeout: 10000,
        acquireTimeout: 10000,
        timeout: 10000
      });
      
      const connection2 = await pool2.getConnection();
      console.log('✅ Connection successful on port 2829');
      connection2.release();
      await pool2.end();
      
    } catch (error2) {
      console.log('❌ Connection failed on port 2829:', error2.message);
      
      // Try without specifying port (default)
      try {
        console.log('\n🔌 Trying without specifying port...');
        const pool3 = mysql.createPool({
          host: process.env.DB_HOST,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME,
          charset: 'utf8mb4',
          connectTimeout: 10000,
          acquireTimeout: 10000,
          timeout: 10000
        });
        
        const connection3 = await pool3.getConnection();
        console.log('✅ Connection successful without specifying port');
        connection3.release();
        await pool3.end();
        
      } catch (error3) {
        console.log('❌ Connection failed without specifying port:', error3.message);
        console.log('\n💡 Possible solutions:');
        console.log('1. Check if MySQL is running on the cloud server');
        console.log('2. Verify the database credentials');
        console.log('3. Check if the user has permission to connect from external IPs');
        console.log('4. Verify the port number (2829 might not be MySQL)');
      }
    }
  }
}

testConnection(); 