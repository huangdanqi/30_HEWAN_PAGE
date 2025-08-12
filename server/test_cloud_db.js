import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function testCloudDB() {
  let pool;
  
  try {
    console.log('🔍 Testing cloud database connection...');
    console.log('Environment variables:');
    console.log('  DB_HOST:', process.env.DB_HOST);
    console.log('  DB_USER:', process.env.DB_USER);
    console.log('  DB_NAME:', process.env.DB_NAME);
    console.log('  DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'NOT SET');
    
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
    
    // Check what tables exist
    console.log('\n📋 Available tables:');
    const [tables] = await pool.execute('SHOW TABLES');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`  - ${tableName}`);
    });
    
    // Check if toy_production table exists
    const toyProductionTable = tables.find(table => 
      Object.values(table)[0] === 'toy_production' || 
      Object.values(table)[0] === 'toy-production'
    );
    
    if (!toyProductionTable) {
      console.log('❌ No toy production table found!');
      return;
    }
    
    const actualTableName = Object.values(toyProductionTable)[0];
    console.log(`\n✅ Found table: ${actualTableName}`);
    
    // Check table structure
    console.log('\n🏗️  Table structure:');
    const [columns] = await pool.execute(`DESCRIBE \`${actualTableName}\``);
    columns.forEach(col => {
      console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    // Check sample data
    console.log('\n📊 Sample data (first 3 rows):');
    const [rows] = await pool.execute(`SELECT * FROM \`${actualTableName}\` LIMIT 3`);
    rows.forEach((row, index) => {
      console.log(`\nRow ${index + 1}:`);
      Object.keys(row).forEach(key => {
        console.log(`  ${key}: ${row[key]} (${typeof row[key]})`);
      });
    });
    
    // Check specific problematic fields
    console.log('\n🔍 Checking problematic fields:');
    
    // Check if production_batch_id field exists and has data
    const hasProductionBatchId = columns.some(col => col.Field === 'production_batch_id');
    if (hasProductionBatchId) {
      const [batchIdData] = await pool.execute(`SELECT DISTINCT production_batch_id FROM \`${actualTableName}\` LIMIT 5`);
      console.log('Production batch ID values:', batchIdData.map(r => r.production_batch_id));
    } else {
      console.log('❌ production_batch_id field not found');
    }
    
    // Check if product_model field exists and has data
    const hasProductModel = columns.some(col => col.Field === 'product_model');
    if (hasProductModel) {
      const [modelData] = await pool.execute(`SELECT DISTINCT product_model FROM \`${actualTableName}\` LIMIT 5`);
      console.log('Product model values:', modelData.map(r => r.product_model));
    } else {
      console.log('❌ product_model field not found');
    }
    
    // Check if production_batch_date field exists and has data
    const hasProductionBatchDate = columns.some(col => col.Field === 'production_batch_date');
    if (hasProductionBatchDate) {
      const [dateData] = await pool.execute(`SELECT DISTINCT production_batch_date FROM \`${actualTableName}\` LIMIT 5`);
      console.log('Production batch date values:', dateData.map(r => r.production_batch_date));
    } else {
      console.log('❌ production_batch_date field not found');
    }
    
    // Check if updater_id field exists and has data
    const hasUpdaterId = columns.some(col => col.Field === 'updater_id');
    if (hasUpdaterId) {
      const [updaterData] = await pool.execute(`SELECT DISTINCT updater_id FROM \`${actualTableName}\` LIMIT 5`);
      console.log('Updater ID values:', updaterData.map(r => r.updater_id));
    } else {
      console.log('❌ updater_id field not found');
    }
    
    // Count total records
    const [countResult] = await pool.execute(`SELECT COUNT(*) as total FROM \`${actualTableName}\``);
    console.log(`\n📈 Total records: ${countResult[0].total}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

testCloudDB(); 