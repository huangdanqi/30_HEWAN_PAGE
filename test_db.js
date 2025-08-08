import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'h05010501',
      database: process.env.DB_NAME || 'page_test',
      charset: 'utf8mb4'
    });

    console.log('Database connected successfully!');

    // Test query
    const [rows] = await connection.execute('SELECT COUNT(*) as total FROM account_data');
    console.log('Total records in account_data:', rows[0].total);

    // Test sample data
    const [sampleData] = await connection.execute('SELECT * FROM account_data LIMIT 3');
    console.log('Sample data:', JSON.stringify(sampleData, null, 2));

    await connection.end();
    console.log('Database test completed successfully!');
  } catch (error) {
    console.error('Database test failed:', error);
  }
}

testDatabase(); 