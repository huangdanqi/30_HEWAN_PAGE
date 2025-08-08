import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function testDatabaseEncoding() {
  try {
    console.log('Testing database encoding...');
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      charset: 'utf8mb4',
      collation: 'utf8mb4_unicode_ci',
      supportBigNumbers: true,
      bigNumberStrings: true,
      dateStrings: true,
      timezone: '+00:00'
    });
    
    // Set explicit encoding for the connection
    await connection.execute('SET NAMES utf8mb4');
    await connection.execute('SET CHARACTER SET utf8mb4');
    await connection.execute('SET collation_connection = utf8mb4_unicode_ci');
    await connection.execute('SET character_set_client = utf8mb4');
    await connection.execute('SET character_set_connection = utf8mb4');
    await connection.execute('SET character_set_database = utf8mb4');
    await connection.execute('SET character_set_results = utf8mb4');
    await connection.execute('SET character_set_server = utf8mb4');
    
    console.log('Connection established with proper encoding');
    
    // Test query to get IP management data
    const [rows] = await connection.execute(`
      SELECT
        id,
        ip_id as ipId,
        ip_name as ipName,
        ip_intro as ipIntro,
        running,
        portrait,
        mbti,
        preference,
        agent_link as agentLink,
        updater,
        DATE_FORMAT(create_time, '%Y-%m-%d %H:%i:%s') as createTime,
        DATE_FORMAT(update_time, '%Y-%m-%d %H:%i:%s') as updateTime
      FROM ip_management
      LIMIT 5
    `);
    
    console.log('Data retrieved from database:');
    console.log(JSON.stringify(rows, null, 2));
    
    await connection.end();
    
  } catch (error) {
    console.error('Error testing database encoding:', error);
  }
}

testDatabaseEncoding(); 