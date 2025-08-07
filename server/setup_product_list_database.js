import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

async function setupProductListDatabase() {
  try {
    console.log('Setting up product_list database tables...');
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'database', 'product_list.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Split the SQL content into individual statements
    const statements = sqlContent
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0 && !statement.startsWith('--'));
    
    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.substring(0, 50) + '...');
        await pool.execute(statement);
      }
    }
    
    console.log('✅ Product list database setup completed successfully!');
    
    // Verify the data
    const [rows] = await pool.execute('SELECT COUNT(*) as count FROM product_list');
    console.log(`✅ Total records in product_list table: ${rows[0].count}`);
    
    // Show a few sample records
    const [sampleRows] = await pool.execute('SELECT * FROM product_list LIMIT 3');
    console.log('✅ Sample records:');
    sampleRows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.product_name} (${row.product_id}) - ${row.color} - ${row.member_type}`);
    });
    
  } catch (error) {
    console.error('❌ Error setting up product_list database:', error);
  } finally {
    await pool.end();
  }
}

setupProductListDatabase(); 