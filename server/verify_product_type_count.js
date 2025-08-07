import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'h05010501',
  database: process.env.DB_NAME || 'page_test',
  charset: 'utf8mb4',
  supportBigNumbers: true,
  bigNumberStrings: true,
  dateStrings: true,
  timezone: '+00:00',
  connectionLimit: 10
});

async function verifyCount() {
  try {
    const [rows] = await pool.execute('SELECT COUNT(*) as count FROM product_type');
    console.log(`Total product_type records: ${rows[0].count}`);
    
    // Show a few recent records
    const [recentRows] = await pool.execute('SELECT product_id, product_name, product_type FROM product_type ORDER BY id DESC LIMIT 5');
    console.log('\nRecent 5 records:');
    recentRows.forEach(row => {
      console.log(`- ${row.product_id}: ${row.product_name} (${row.product_type})`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

verifyCount(); 