import mysql from 'mysql2/promise';

async function updateFirmwareDatabase() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'h05010501',
    database: 'page_test'
  });

  try {
    console.log('Connecting to database...');
    
    // Add file_address column (handle error if it already exists)
    console.log('Adding file_address column...');
    try {
      await connection.execute(`
        ALTER TABLE firmware ADD COLUMN file_address VARCHAR(500) 
        DEFAULT 'https://example.com/firmware.bin' COMMENT '文件地址'
      `);
      console.log('Column added successfully');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('Column already exists, continuing...');
      } else {
        throw error;
      }
    }
    
    // Clear existing data
    console.log('Clearing existing data...');
    await connection.execute('DELETE FROM firmware');
    
    // Insert new sample data
    console.log('Inserting sample data...');
    const insertQuery = `
      INSERT INTO firmware (device_model, release_version, version_number, description, file_address, creator, release_time, update_time) VALUES
      ('HWSZ001', '主版本', 'Z001 V 1.0.0', 'desc', 'https://firmware.example.com/hwz001_v1.0.0.bin', '张三', '2025-07-13 19:25:11', '2025-07-13 19:25:11'),
      ('HWSZ001', '主版本', 'Z001 V 2.0.0', 'desc', 'https://firmware.example.com/hwz001_v2.0.0.bin', '张三', '2025-08-13 19:25:11', '2025-08-13 19:25:11'),
      ('HWSZ002', '主版本', 'Z002 V 1.0.0', 'desc', 'https://firmware.example.com/hwz002_v1.0.0.bin', '李四', '2025-07-14 19:25:11', '2025-07-14 19:25:11'),
      ('HWSZ002', '主版本', 'Z002 V 2.0.0', 'desc', 'https://firmware.example.com/hwz002_v2.0.0.bin', '李四', '2025-08-14 19:25:11', '2025-08-14 19:25:11'),
      ('HWSZ003', '主版本', 'Z003 V 1.0.0', 'desc', 'https://firmware.example.com/hwz003_v1.0.0.bin', '王五', '2025-07-15 19:25:11', '2025-07-15 19:25:11'),
      ('HWSZ003', '主版本', 'Z003 V 2.0.0', 'desc', 'https://firmware.example.com/hwz003_v2.0.0.bin', '王五', '2025-08-15 19:25:11', '2025-08-15 19:25:11'),
      ('HWSZ003', '主版本', 'Z003 V 3.0.0', 'desc', 'https://firmware.example.com/hwz003_v3.0.0.bin', '王五', '2025-09-15 19:25:11', '2025-09-15 19:25:11'),
      ('HWSZ004', '主版本', 'Z004 V 1.0.0', 'desc', 'https://firmware.example.com/hwz004_v1.0.0.bin', '赵六', '2025-07-16 19:25:11', '2025-07-16 19:25:11'),
      ('HWSZ004', '主版本', 'Z004 V 2.0.0', 'desc', 'https://firmware.example.com/hwz004_v2.0.0.bin', '赵六', '2025-08-16 19:25:11', '2025-08-16 19:25:11'),
      ('HWSZ005', '主版本', 'Z005 V 1.0.0', 'desc', 'https://firmware.example.com/hwz005_v1.0.0.bin', '钱七', '2025-07-17 19:25:11', '2025-07-17 19:25:11'),
      ('HWSZ005', '主版本', 'Z005 V 2.0.0', 'desc', 'https://firmware.example.com/hwz005_v2.0.0.bin', '钱七', '2025-08-17 19:25:11', '2025-08-17 19:25:11'),
      ('HWSZ006', '主版本', 'Z006 V 1.0.0', 'desc', 'https://firmware.example.com/hwz006_v1.0.0.bin', '孙八', '2025-07-18 19:25:11', '2025-07-18 19:25:11'),
      ('HWSZ006', '主版本', 'Z006 V 2.0.0', 'desc', 'https://firmware.example.com/hwz006_v2.0.0.bin', '孙八', '2025-08-18 19:25:11', '2025-08-18 19:25:11'),
      ('HWSZ007', '主版本', 'Z007 V 1.0.0', 'desc', 'https://firmware.example.com/hwz007_v1.0.0.bin', '周九', '2025-07-19 19:25:11', '2025-07-19 19:25:11'),
      ('HWSZ007', '主版本', 'Z007 V 2.0.0', 'desc', 'https://firmware.example.com/hwz007_v2.0.0.bin', '周九', '2025-08-19 19:25:11', '2025-08-19 19:25:11'),
      ('HWSZ008', '主版本', 'Z008 V 1.0.0', 'desc', 'https://firmware.example.com/hwz008_v1.0.0.bin', '吴十', '2025-07-20 19:25:11', '2025-07-20 19:25:11'),
      ('HWSZ008', '主版本', 'Z008 V 2.0.0', 'desc', 'https://firmware.example.com/hwz008_v2.0.0.bin', '吴十', '2025-08-20 19:25:11', '2025-08-20 19:25:11'),
      ('HWSZ009', '主版本', 'Z009 V 1.0.0', 'desc', 'https://firmware.example.com/hwz009_v1.0.0.bin', '郑十一', '2025-07-21 19:25:11', '2025-07-21 19:25:11'),
      ('HWSZ009', '主版本', 'Z009 V 2.0.0', 'desc', 'https://firmware.example.com/hwz009_v2.0.0.bin', '郑十一', '2025-08-21 19:25:11', '2025-08-21 19:25:11'),
      ('HWSZ010', '主版本', 'Z010 V 1.0.0', 'desc', 'https://firmware.example.com/hwz010_v1.0.0.bin', '王十二', '2025-07-22 19:25:11', '2025-07-22 19:25:11')
    `;
    
    await connection.execute(insertQuery);
    
    // Verify the data
    console.log('Verifying data...');
    const [rows] = await connection.execute('SELECT * FROM firmware');
    console.log('Database updated successfully! Found', rows.length, 'records');
    
    for (const row of rows) {
      console.log(`ID: ${row.id}, Device: ${row.device_model}, Version: ${row.version_number}, File: ${row.file_address}`);
    }
    
  } catch (error) {
    console.error('Error updating database:', error);
  } finally {
    await connection.end();
  }
}

updateFirmwareDatabase(); 