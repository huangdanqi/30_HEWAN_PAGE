const mysql = require('mysql2/promise');

const createIpImageTable = async () => {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'h05010501',
    database: 'page_test',
    charset: 'utf8mb4'
  });

  try {
    console.log('Connected to MySQL database');

    // Drop table if exists
    await connection.execute('DROP TABLE IF EXISTS ipimage');
    console.log('Dropped existing ipimage table');

    // Create ipimage table
    const createTableSQL = `
      CREATE TABLE ipimage (
        id INT AUTO_INCREMENT PRIMARY KEY,
        image_id VARCHAR(50) NOT NULL,
        ip_name VARCHAR(100) NOT NULL,
        image_name VARCHAR(100) NOT NULL,
        scene VARCHAR(100) NOT NULL,
        weather VARCHAR(50) NOT NULL,
        emotion VARCHAR(50) NOT NULL,
        time_period VARCHAR(50) NOT NULL,
        tags TEXT,
        image_file_address TEXT NOT NULL,
        updater VARCHAR(100) NOT NULL,
        create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;

    await connection.execute(createTableSQL);
    console.log('Created ipimage table');

    // Sample data based on the image
    const sampleData = [
      {
        image_id: 'hjhwn832nj2f',
        ip_name: '啵啵',
        image_name: '晒太阳',
        scene: '居家',
        weather: '晴天',
        emotion: '放松',
        time_period: '白天',
        tags: '休闲,温暖,舒适',
        image_file_address: 'https://example.com/images/sunbathing.jpg',
        updater: '管理员'
      },
      {
        image_id: 'k2m9x4p8q1r',
        ip_name: '啵啵',
        image_name: '读书时光',
        scene: '书房',
        weather: '阴天',
        emotion: '平静',
        time_period: '下午',
        tags: '学习,专注,安静',
        image_file_address: 'https://example.com/images/reading.jpg',
        updater: '管理员'
      },
      {
        image_id: 'n5v7w9y2z4a',
        ip_name: '啵啵',
        image_name: '晨练',
        scene: '公园',
        weather: '晴天',
        emotion: '兴奋',
        time_period: '上午',
        tags: '运动,健康,活力',
        image_file_address: 'https://example.com/images/morning_exercise.jpg',
        updater: '管理员'
      },
      {
        image_id: 'b6c8d0e3f5g',
        ip_name: '蝴蝶',
        image_name: '花间飞舞',
        scene: '花园',
        weather: '晴天',
        emotion: '开心',
        time_period: '白天',
        tags: '自然,美丽,自由',
        image_file_address: 'https://example.com/images/butterfly_garden.jpg',
        updater: '管理员'
      },
      {
        image_id: 'h7i9j1k3l5m',
        ip_name: '蝴蝶',
        image_name: '雨中漫步',
        scene: '森林',
        weather: '小雨',
        emotion: '忧郁',
        time_period: '下午',
        tags: '雨天,神秘,宁静',
        image_file_address: 'https://example.com/images/rainy_forest.jpg',
        updater: '管理员'
      },
      {
        image_id: 'n6o8p0q2r4s',
        ip_name: '小熊',
        image_name: '蜂蜜时光',
        scene: '森林',
        weather: '晴天',
        emotion: '开心',
        time_period: '上午',
        tags: '甜蜜,可爱,温馨',
        image_file_address: 'https://example.com/images/honey_bear.jpg',
        updater: '管理员'
      },
      {
        image_id: 't7u9v1w3x5y',
        ip_name: '小熊',
        image_name: '冬眠准备',
        scene: '洞穴',
        weather: '阴天',
        emotion: '放松',
        time_period: '晚上',
        tags: '温暖,安全,休息',
        image_file_address: 'https://example.com/images/hibernation.jpg',
        updater: '管理员'
      },
      {
        image_id: 'z8a0b2c4d6e',
        ip_name: '啵啵',
        image_name: '午后茶点',
        scene: '客厅',
        weather: '多云',
        emotion: '放松',
        time_period: '下午',
        tags: '休闲,美食,社交',
        image_file_address: 'https://example.com/images/afternoon_tea.jpg',
        updater: '管理员'
      },
      {
        image_id: 'f9g1h3i5j7k',
        ip_name: '蝴蝶',
        image_name: '月光舞者',
        scene: '夜空',
        weather: '晴天',
        emotion: '兴奋',
        time_period: '晚上',
        tags: '浪漫,神秘,优雅',
        image_file_address: 'https://example.com/images/moonlight_dance.jpg',
        updater: '管理员'
      },
      {
        image_id: 'l8m0n2o4p6q',
        ip_name: '小熊',
        image_name: '钓鱼时光',
        scene: '湖边',
        weather: '晴天',
        emotion: '平静',
        time_period: '上午',
        tags: '耐心,自然,宁静',
        image_file_address: 'https://example.com/images/fishing_bear.jpg',
        updater: '管理员'
      },
      {
        image_id: 'r9s1t3u5v7w',
        ip_name: '啵啵',
        image_name: '夜读',
        scene: '卧室',
        weather: '阴天',
        emotion: '平静',
        time_period: '晚上',
        tags: '学习,安静,专注',
        image_file_address: 'https://example.com/images/night_reading.jpg',
        updater: '管理员'
      },
      {
        image_id: 'x0y2z4a6b8c',
        ip_name: '蝴蝶',
        image_name: '晨露',
        scene: '花园',
        weather: '多云',
        emotion: '开心',
        time_period: '上午',
        tags: '清新,自然,美丽',
        image_file_address: 'https://example.com/images/morning_dew.jpg',
        updater: '管理员'
      },
      {
        image_id: 'd1e3f5g7h9i',
        ip_name: '小熊',
        image_name: '野餐',
        scene: '草地',
        weather: '晴天',
        emotion: '开心',
        time_period: '下午',
        tags: '户外,美食,欢乐',
        image_file_address: 'https://example.com/images/picnic_bear.jpg',
        updater: '管理员'
      },
      {
        image_id: 'j2k4l6m8n0o',
        ip_name: '啵啵',
        image_name: '冥想',
        scene: '禅室',
        weather: '阴天',
        emotion: '平静',
        time_period: '凌晨',
        tags: '冥想,宁静,内心',
        image_file_address: 'https://example.com/images/meditation.jpg',
        updater: '管理员'
      },
      {
        image_id: 'p3q5r7s9t1u',
        ip_name: '蝴蝶',
        image_name: '彩虹桥',
        scene: '天空',
        weather: '雷雨',
        emotion: '兴奋',
        time_period: '下午',
        tags: '彩虹,希望,美丽',
        image_file_address: 'https://example.com/images/rainbow_bridge.jpg',
        updater: '管理员'
      },
      {
        image_id: 'v4w6x8y0z2a',
        ip_name: '小熊',
        image_name: '滑雪',
        scene: '雪山',
        weather: '大风',
        emotion: '兴奋',
        time_period: '上午',
        tags: '运动,冒险,刺激',
        image_file_address: 'https://example.com/images/skiing_bear.jpg',
        updater: '管理员'
      },
      {
        image_id: 'b5c7d9e1f3g',
        ip_name: '啵啵',
        image_name: '音乐会',
        scene: '音乐厅',
        weather: '通用',
        emotion: '兴奋',
        time_period: '晚上',
        tags: '音乐,艺术,激情',
        image_file_address: 'https://example.com/images/concert.jpg',
        updater: '管理员'
      },
      {
        image_id: 'h6i8j0k2l4m',
        ip_name: '蝴蝶',
        image_name: '秋叶',
        scene: '森林',
        weather: '阴天',
        emotion: '忧郁',
        time_period: '下午',
        tags: '秋天,落叶,诗意',
        image_file_address: 'https://example.com/images/autumn_leaves.jpg',
        updater: '管理员'
      },
      {
        image_id: 'n7o9p1q3r5s',
        ip_name: '小熊',
        image_name: '生日派对',
        scene: '客厅',
        weather: '通用',
        emotion: '开心',
        time_period: '下午',
        tags: '庆祝,欢乐,温馨',
        image_file_address: 'https://example.com/images/birthday_party.jpg',
        updater: '管理员'
      },
      {
        image_id: 't8u0v2w4x6y',
        ip_name: '啵啵',
        image_name: '星空',
        scene: '阳台',
        weather: '晴天',
        emotion: '平静',
        time_period: '凌晨',
        tags: '星空,浪漫,宁静',
        image_file_address: 'https://example.com/images/starry_night.jpg',
        updater: '管理员'
      }
    ];

    // Insert sample data
    for (const data of sampleData) {
      const insertSQL = `
        INSERT INTO ipimage (
          image_id, ip_name, image_name, scene, weather, emotion, 
          time_period, tags, image_file_address, updater
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      await connection.execute(insertSQL, [
        data.image_id,
        data.ip_name,
        data.image_name,
        data.scene,
        data.weather,
        data.emotion,
        data.time_period,
        data.tags,
        data.image_file_address,
        data.updater
      ]);
    }

    console.log(`Inserted ${sampleData.length} rows of sample data`);

    // Verify the data
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM ipimage');
    console.log(`Total rows in ipimage table: ${rows[0].count}`);

    console.log('✅ ipimage table created successfully with sample data!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await connection.end();
    console.log('Database connection closed');
  }
};

createIpImageTable(); 