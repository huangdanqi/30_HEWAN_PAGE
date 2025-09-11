import pool from './server/config/database.js';

async function insertSampleModelConfigurationData() {
  const connection = await pool.getConnection();
  try {
    console.log('Inserting sample model configuration data...');
    
    // Check if table exists
    const [tables] = await connection.execute(`SHOW TABLES LIKE 'model_configuration'`);
    if (tables.length === 0) {
      console.error('Table model_configuration does not exist');
      return;
    }
    
    // Check current count
    const [countResult] = await connection.execute(`SELECT COUNT(*) as count FROM model_configuration`);
    console.log('Current model configuration count:', countResult[0].count);
    
    // Insert sample data
    const insertQuery = `
      INSERT IGNORE INTO model_configuration (
        modelId, modelType, modelName, containerId, versionNumber, apiUrl, 
        localModelFileDir, remainingTrainingTimes, billingUnit, unitCost, 
        accumulatedUsage, accumulatedCost, configuration_type, configuration_data, 
        version, status, creator, updater, createTime, updateTime
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    const sampleModels = [
      [
        'MODEL001', 'GPT', 'GPT-3.5 Turbo', 'container_001', 'v1.0.0',
        'https://api.openai.com/v1/chat/completions', '/models/gpt35', 100,
        'tokens', 0.002, 1500.00, 3.00, 'chat_completion',
        '{"temperature": 0.7, "max_tokens": 1000}', '1.0.0', '启用', '管理员', '管理员'
      ],
      [
        'MODEL002', 'Claude', 'Claude-3 Sonnet', 'container_002', 'v2.1.0',
        'https://api.anthropic.com/v1/messages', '/models/claude3', 50,
        'tokens', 0.003, 800.00, 2.40, 'text_generation',
        '{"temperature": 0.5, "max_tokens": 2000}', '2.1.0', '启用', '管理员', '管理员'
      ],
      [
        'MODEL003', 'Gemini', 'Gemini Pro', 'container_003', 'v1.5.0',
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', 
        '/models/gemini', 75, 'characters', 0.001, 2000.00, 2.00, 'content_generation',
        '{"temperature": 0.8, "top_p": 0.9}', '1.5.0', '测试', '管理员', '管理员'
      ]
    ];
    
    for (const model of sampleModels) {
      await connection.execute(insertQuery, model);
      console.log('Inserted model:', model[2]); // modelName is at index 2
    }
    
    // Verify insertion
    const [finalCount] = await connection.execute(`SELECT COUNT(*) as count FROM model_configuration`);
    console.log('Final model configuration count:', finalCount[0].count);
    
    // Show all models
    const [allModels] = await connection.execute(`
      SELECT modelId, modelName, modelType, status, version, unitCost, accumulatedCost 
      FROM model_configuration ORDER BY createTime DESC
    `);
    console.log('All models:', allModels);
    
  } catch (error) {
    console.error('Error inserting sample data:', error);
  } finally {
    connection.release();
  }
}

insertSampleModelConfigurationData().then(() => {
  console.log('Sample model configuration data insertion completed');
  process.exit(0);
}).catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});
