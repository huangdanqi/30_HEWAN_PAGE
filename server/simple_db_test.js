import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function simpleDBTest() {
  let pool;
  
  try {
    console.log('🔍 Simple database test...');
    
    // Create connection pool
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'page_test',
      charset: 'utf8mb4'
    });
    
    // Test connection
    const connection = await pool.getConnection();
    console.log('✅ Database connection successful');
    connection.release();
    
    // Check table structure
    console.log('\n📋 Table structure:');
    const [columns] = await pool.execute('DESCRIBE `toy-production`');
    columns.forEach(col => {
      console.log(`  ${col.Field}: ${col.Type}`);
    });
    
    // Check sample data
    console.log('\n📊 Sample data (first 3 rows):');
    const [rows] = await pool.execute('SELECT * FROM `toy-production` LIMIT 3');
    rows.forEach((row, index) => {
      console.log(`\nRow ${index + 1}:`);
      console.log(`  id: ${row.id}`);
      console.log(`  product_id: ${row.product_id}`);
      console.log(`  product_name: ${row.product_name}`);
      console.log(`  production_batch: ${row.production_batch}`);
      console.log(`  manufacturer: ${row.manufacturer}`);
      console.log(`  unit_price: ${row.unit_price}`);
      console.log(`  quantity: ${row.quantity}`);
      console.log(`  total_price: ${row.total_price}`);
      console.log(`  creator: ${row.creator}`);
      console.log(`  device_model: ${row.device_model}`);
      console.log(`  create_time: ${row.create_time}`);
      console.log(`  update_time: ${row.update_time}`);
    });
    
    // Check specific problematic fields
    console.log('\n🔍 Checking problematic fields:');
    
    // Check creator field
    const [creatorData] = await pool.execute('SELECT DISTINCT creator FROM `toy-production` LIMIT 5');
    console.log('Creator values:', creatorData.map(r => r.creator));
    
    // Check production_batch field
    const [batchData] = await pool.execute('SELECT DISTINCT production_batch FROM `toy-production` LIMIT 5');
    console.log('Production batch values:', batchData.map(r => r.production_batch));
    
    // Count total records
    const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM `toy-production`');
    console.log(`\n📈 Total records: ${countResult[0].total}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

simpleDBTest(); 