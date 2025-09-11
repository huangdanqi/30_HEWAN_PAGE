import pool from './server/config/database.js';

async function insertSampleAlarmData() {
  const connection = await pool.getConnection();
  try {
    console.log('Inserting sample alarm data...');
    
    // Check if table exists
    const [tables] = await connection.execute(`SHOW TABLES LIKE 'alarm'`);
    if (tables.length === 0) {
      console.error('Table alarm does not exist');
      return;
    }
    
    // Check current count
    const [countResult] = await connection.execute(`SELECT COUNT(*) as count FROM alarm`);
    console.log('Current alarm count:', countResult[0].count);
    
    // Insert sample data
    const insertQuery = `
      INSERT IGNORE INTO alarm (alarmId, alarmName, alarmFileAddress, updater, createTime, updateTime) VALUES
      (?, ?, ?, ?, NOW(), NOW())
    `;
    
    const sampleAlarms = [
      ['ALM001', 'Morning Alarm', '/audio/Alarm01.wav', '管理员'],
      ['ALM002', 'Wake Up Call', '/audio/Alarm02.wav', '管理员'],
      ['ALM003', 'Emergency Alert', '/audio/Alarm03.wav', '管理员']
    ];
    
    for (const alarm of sampleAlarms) {
      await connection.execute(insertQuery, alarm);
      console.log('Inserted alarm:', alarm[1]);
    }
    
    // Verify insertion
    const [finalCount] = await connection.execute(`SELECT COUNT(*) as count FROM alarm`);
    console.log('Final alarm count:', finalCount[0].count);
    
    // Show all alarms
    const [allAlarms] = await connection.execute(`SELECT * FROM alarm ORDER BY createTime DESC`);
    console.log('All alarms:', allAlarms);
    
  } catch (error) {
    console.error('Error inserting sample data:', error);
  } finally {
    connection.release();
  }
}

insertSampleAlarmData().then(() => {
  console.log('Sample data insertion completed');
  process.exit(0);
}).catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});
