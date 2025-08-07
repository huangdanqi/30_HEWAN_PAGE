import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function addFileAddressColumn() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'h05010501',
    database: process.env.DB_NAME || 'page_test'
  });

  try {
    console.log('Connecting to database...');
    
    // Check if file_address column exists
    try {
      await connection.execute('SELECT file_address FROM firmware LIMIT 1');
      console.log('file_address column already exists');
    } catch (error) {
      if (error.code === 'ER_BAD_FIELD_ERROR') {
        console.log('file_address column does not exist, adding it...');
        
        // Add file_address column
        await connection.execute(`
          ALTER TABLE firmware 
          ADD COLUMN file_address VARCHAR(500) 
          DEFAULT 'https://example.com/firmware.bin' 
          COMMENT '文件地址'
        `);
        
        console.log('file_address column added successfully');
        
        // Update existing records with default file address
        await connection.execute(`
          UPDATE firmware 
          SET file_address = 'https://example.com/firmware.bin' 
          WHERE file_address IS NULL OR file_address = ''
        `);
        
        console.log('Existing records updated with default file address');
      } else {
        throw error;
      }
    }
    
    // Test the table structure
    const [columns] = await connection.execute('DESCRIBE firmware');
    console.log('Current firmware table structure:');
    columns.forEach(col => {
      console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

addFileAddressColumn(); 