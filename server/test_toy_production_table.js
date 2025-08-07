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

async function testToyProductionTable() {
  try {
    console.log('Testing toy-production table...');
    
    // Check if table exists
    const [tables] = await pool.execute("SHOW TABLES LIKE 'toy-production'");
    if (tables.length === 0) {
      console.log('❌ Table "toy-production" does not exist!');
      return;
    }
    console.log('✅ Table "toy-production" exists!');
    
    // Count records
    const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM `toy-production`');
    const totalRecords = countResult[0].total;
    console.log(`✅ Total records in toy-production table: ${totalRecords}`);
    
    if (totalRecords === 0) {
      console.log('❌ No records found in the table!');
      return;
    }
    
    // Show sample data
    const [sampleData] = await pool.execute('SELECT * FROM `toy-production` LIMIT 5');
    console.log('\n📊 Sample data from toy-production table:');
    sampleData.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.product_name} - ${row.manufacturer} - ¥${row.unit_price} - Qty: ${row.quantity}`);
    });
    
    // Show table structure
    const [columns] = await pool.execute('DESCRIBE `toy-production`');
    console.log('\n🏗️  Table structure:');
    columns.forEach(column => {
      console.log(`  - ${column.Field} (${column.Type}) ${column.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    console.log('\n🎉 Toy-production table test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing toy-production table:', error.message);
  } finally {
    await pool.end();
  }
}

testToyProductionTable(); 