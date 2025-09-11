import pool from './config/database.js'; // Adjust path as necessary

async function createToolConfigurationTable() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('Database connection established.');

    // Drop existing table if it exists
    await connection.execute('DROP TABLE IF EXISTS toolconfiguration');
    console.log('Dropped existing toolconfiguration table if it existed.');

    // Create the new table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS toolconfiguration (
        id INT AUTO_INCREMENT PRIMARY KEY,
        toolId VARCHAR(100) NOT NULL UNIQUE COMMENT '工具ID',
        toolType VARCHAR(100) COMMENT '工具类型',
        toolName VARCHAR(200) NOT NULL COMMENT '工具名称',
        apiAddress VARCHAR(500) COMMENT 'API地址',
        localToolFilePath VARCHAR(500) COMMENT '本地工具文件路径',
        purchaseTime DATETIME COMMENT '购买时间',
        activationTime DATETIME COMMENT '激活时间',
        expirationTime DATETIME COMMENT '过期时间',
        accumulatedUsage DECIMAL(15,2) DEFAULT 0.00 COMMENT '累计使用量',
        accumulatedCost DECIMAL(15,2) DEFAULT 0.00 COMMENT '累计成本',
        updater VARCHAR(100) COMMENT '更新者',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        INDEX idx_toolId (toolId),
        INDEX idx_toolName (toolName),
        INDEX idx_toolType (toolType),
        INDEX idx_createdAt (createdAt),
        INDEX idx_updatedAt (updatedAt)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='工具配置表'
    `;

    await connection.execute(createTableQuery);
    console.log('Created toolconfiguration table successfully.');

    // Insert sample data
    const insertQuery = `
      INSERT IGNORE INTO toolconfiguration (toolId, toolType, toolName, apiAddress, localToolFilePath, purchaseTime, activationTime, expirationTime, accumulatedUsage, accumulatedCost, updater) VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const sampleTools = [
      ['TOOL001', 'API', 'OpenAI GPT API', 'https://api.openai.com/v1/chat/completions', '/tools/openai-gpt', new Date('2024-01-01'), new Date('2024-01-01'), new Date('2025-01-01'), 1000.00, 50.00, '管理员'],
      ['TOOL002', 'Local', 'Image Processing Tool', null, '/tools/image-processor', new Date('2024-01-15'), new Date('2024-01-15'), null, 500.00, 0.00, '管理员'],
      ['TOOL003', 'API', 'Translation Service', 'https://api.translate.com/v1/translate', '/tools/translator', new Date('2024-02-01'), new Date('2024-02-01'), new Date('2025-02-01'), 2000.00, 100.00, '管理员']
    ];

    for (const tool of sampleTools) {
      await connection.execute(insertQuery, tool);
      console.log('Inserted tool:', tool[2]);
    }

    // Verify the data
    const [rows] = await connection.execute('SELECT COUNT(*) as total FROM toolconfiguration');
    console.log(`Total tools in database: ${rows[0].total}`);

    const [allTools] = await connection.execute('SELECT * FROM toolconfiguration ORDER BY createdAt DESC');
    console.log('All tools:', allTools);

  } catch (error) {
    console.error('Error creating toolconfiguration table:', error);
    if (error.code === 'ECONNREFUSED') {
      console.error('Database connection refused. Please ensure the database server is running and accessible.');
    }
  } finally {
    if (connection) {
      connection.release();
      console.log('Database connection released.');
    }
    process.exit();
  }
}

createToolConfigurationTable();
