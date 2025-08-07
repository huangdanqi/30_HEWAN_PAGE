import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

async function setupToyProductionDatabase() {
  try {
    console.log('Setting up toy production database tables...');
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'database', 'toy_production.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Split the SQL content into individual statements
    const statements = sqlContent.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.substring(0, 100) + '...');
        await pool.execute(statement);
      }
    }
    
    console.log('Toy production database setup completed successfully!');
    
    // Test the table by counting records
    const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM toy_production');
    console.log('Total records in toy_production table:', countResult[0].total);
    
  } catch (error) {
    console.error('Error setting up toy production database:', error);
  } finally {
    await pool.end();
  }
}

setupToyProductionDatabase(); 