import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function testSimpleConnection() {
  console.log('🔍 Testing simple database connection...');
  console.log('Environment variables:');
  console.log('  DB_HOST:', process.env.DB_HOST);
  console.log('  DB_PORT:', process.env.DB_PORT);
  console.log('  DB_USER:', process.env.DB_USER);
  console.log('  DB_NAME:', process.env.DB_NAME);
  
  try {
    // Try to connect with current settings
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      charset: 'utf8mb4',
      connectTimeout: 10000
    });
    
    const connection = await pool.getConnection();
    console.log('✅ Connection successful!');
    
    // Test a simple query
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Available tables:');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`  - ${tableName}`);
    });
    
    // Check if toy_production table exists
    const toyProductionTable = tables.find(table => 
      Object.values(table)[0] === 'toy_production' || 
      Object.values(table)[0] === 'toy-production'
    );
    
    if (toyProductionTable) {
      const actualTableName = Object.values(table)[0];
      console.log(`\n✅ Found table: ${actualTableName}`);
      
      // Check table structure
      const [columns] = await connection.execute(`DESCRIBE \`${actualTableName}\``);
      console.log('\n🏗️  Table structure:');
      columns.forEach(col => {
        console.log(`  ${col.Field}: ${col.Type}`);
      });
      
      // Check sample data
      const [rows] = await connection.execute(`SELECT * FROM \`${actualTableName}\` LIMIT 2`);
      console.log('\n📊 Sample data:');
      rows.forEach((row, index) => {
        console.log(`\nRow ${index + 1}:`);
        Object.keys(row).forEach(key => {
          console.log(`  ${key}: ${row[key]}`);
        });
      });
    }
    
    connection.release();
    await pool.end();
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.message.includes('Access denied')) {
      console.log('\n💡 This is a MySQL user permission issue.');
      console.log('You need to create a new MySQL user that can connect from external IPs.');
      console.log('\n🔧 Solution:');
      console.log('1. SSH into your cloud server: ssh root@121.43.196.106');
      console.log('2. Connect to MySQL: mysql -u root -p');
      console.log('3. Create new user: CREATE USER \'hewan_user\'@\'%\' IDENTIFIED BY \'password\';');
      console.log('4. Grant privileges: GRANT ALL PRIVILEGES ON page_test.* TO \'hewan_user\'@\'%\';');
      console.log('5. Apply: FLUSH PRIVILEGES;');
      console.log('6. Update your .env file with the new user credentials');
    }
  }
}

testSimpleConnection(); 