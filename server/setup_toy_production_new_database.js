import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'page_test',
  port: process.env.DB_PORT || 3306
};

async function setupToyProductionNewDatabase() {
  let pool;
  
  try {
    console.log('Setting up toy-production-new database tables...');
    console.log('Database config:', { ...dbConfig, password: '***' });
    
    // Create connection pool
    pool = mysql.createPool(dbConfig);
    
    // Test connection first
    const connection = await pool.getConnection();
    console.log('✅ Database connection successful');
    connection.release();
    
    // Read and execute SQL file
    const sqlFilePath = path.join(__dirname, 'database', 'toy_production_new.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Split SQL content into individual statements
    const statements = sqlContent.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await pool.execute(statement);
        console.log('Executed SQL statement successfully');
      }
    }
    
    console.log('Toy-production-new database setup completed successfully!');
    
    // Verify the table was created and has data
    const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM `toy_production_new`');
    console.log('Total records in toy_production_new table:', countResult[0].total);
    
    // Show sample data
    const [sampleData] = await pool.execute('SELECT * FROM `toy_production_new` LIMIT 5');
    console.log('Sample data from toy_production_new table:');
    sampleData.forEach((row, index) => {
      console.log(`Row ${index + 1}:`, {
        id: row.id,
        production_batch_id: row.production_batch_id,
        product_model: row.product_model,
        product_name: row.product_name,
        production_batch_date: row.production_batch_date,
        manufacturer: row.manufacturer,
        unit_price: row.unit_price,
        quantity: row.quantity,
        total_price: row.total_price,
        updater_id: row.updater_id
      });
    });
    
    // Show table structure
    const [columns] = await pool.execute('DESCRIBE `toy_production_new`');
    console.log('\nTable structure:');
    columns.forEach(col => {
      console.log(`${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });
    
  } catch (error) {
    console.error('Error setting up toy-production-new database:', error);
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

// Run the setup
setupToyProductionNewDatabase(); 