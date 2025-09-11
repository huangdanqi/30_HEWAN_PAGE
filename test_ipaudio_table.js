import pool from './server/config/database.js';

async function testIPAudioTable() {
  const connection = await pool.getConnection();
  try {
    console.log('Testing IPAudio table...');
    
    // Check if table exists
    const [tables] = await connection.execute(`SHOW TABLES LIKE 'ipaudio'`);
    console.log('Table exists:', tables.length > 0);
    
    if (tables.length > 0) {
      // Check table structure
      const [columns] = await connection.execute(`DESCRIBE ipaudio`);
      console.log('Table columns:', columns);
      
      // Try a simple query
      const [rows] = await connection.execute(`SELECT COUNT(*) as count FROM ipaudio`);
      console.log('Row count:', rows[0].count);
      
      // Try the exact query from the route
      const [testRows] = await connection.execute(`
        SELECT id, audio_id, ip_name, audio_name, audio_type, tags, emotion, language, audio_file_address, updater, create_time, update_time
        FROM ipaudio ORDER BY update_time DESC
      `);
      console.log('Test query successful, rows:', testRows.length);
    }
    
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    connection.release();
  }
}

testIPAudioTable().then(() => {
  console.log('Test completed');
  process.exit(0);
}).catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});
