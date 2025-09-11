import pool from './config/database.js';

async function testModelConfigInsert() {
  const connection = await pool.getConnection();
  try {
    // Test the exact insert query from the route
    const insertQuery = `
      INSERT INTO model_configuration (
        modelId, modelType, modelName, containerId, versionNumber,
        apiUrl, localModelFileDir, billingUnit, unitCost, 
        accumulatedUsage, accumulatedCost, updater,
        createTime, updateTime
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    const insertParams = [
      `MDL${Date.now()}`,
      'ASR',
      '123',
      `MDL${Date.now()}`,
      'v1.0',
      '12313',
      null,
      'h',
      123,
      '0h',
      '0元',
      '123'
    ];
    
    console.log('Testing model configuration insert query...');
    console.log('Query:', insertQuery);
    console.log('Params:', insertParams);
    
    const [result] = await connection.execute(insertQuery, insertParams);
    console.log('✅ Model configuration insert successful! Insert ID:', result.insertId);
    
    // Clean up test data
    await connection.execute('DELETE FROM model_configuration WHERE id = ?', [result.insertId]);
    console.log('✅ Test data cleaned up');
    
  } catch (error) {
    console.error('❌ Error testing model configuration insert:', error.message);
    console.error('Error details:', error);
  } finally {
    connection.release();
    process.exit(0);
  }
}

testModelConfigInsert();
