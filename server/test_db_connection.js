import mysql from 'mysql2/promise';

async function testDBConnection() {
  try {
    console.log('Testing database connection...');
    
    const pool = mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: 'h05010501',
      database: 'page_test',
      charset: 'utf8mb4',
      supportBigNumbers: true,
      bigNumberStrings: true,
      dateStrings: true,
      timezone: '+00:00',
      connectionLimit: 10
    });
    
    // Test connection
    const [rows] = await pool.execute('SELECT COUNT(*) as count FROM `toy-production`');
    console.log('✅ Database connection successful');
    console.log('✅ Table count:', rows[0].count);
    
    // Test a simple query
    const [sampleRows] = await pool.execute('SELECT * FROM `toy-production` LIMIT 1');
    if (sampleRows.length > 0) {
      console.log('✅ Sample data:', sampleRows[0].product_name);
    }
    
    await pool.end();
    
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
  }
}

testDBConnection(); 