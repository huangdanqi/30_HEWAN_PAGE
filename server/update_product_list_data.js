import mysql from 'mysql2/promise';

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

async function updateProductListData() {
  try {
    console.log('Updating product_list table with 20 rows of data...');
    
    // Clear existing data
    await pool.execute('DELETE FROM product_list');
    console.log('✅ Cleared existing data');
    
    // Insert 20 rows of sample data
    const insertData = [
      ['A001', '粉色碳碳娃挂件富盒普通款', 'HWSZ001001', '粉色碳碳娃挂件富盒普通款', '普通挂件', '亮光粉', '普通会员', '0075A1B2SZTD5ZSD69I892XJUB', '183****7953', '2025-01-13 10:25:11'],
      ['A002', '蓝色小熊玩偶', 'HWSZ001002', '蓝色小熊玩偶', '毛绒玩具', '天蓝', 'VIP', '0075A1B2SZTD5ZSD69I892XJUC', '183****7963', '2025-01-14 11:25:12'],
      ['A003', '绿色恐龙模型', 'HWSZ001003', '绿色恐龙模型', '模型', '草绿', 'SVIP', '0075A1B2SZTD5ZSD69I892XJUD', '183****7973', '2025-01-15 12:25:13'],
      ['A004', '红色蝴蝶结蓝牙配件', 'HWSZ001004', '红色蝴蝶结蓝牙配件', '蓝牙配件', '荧光粉', '普通会员', '0075A1B2SZTD5ZSD69I892XJUE', '183****7983', '2025-01-16 13:25:14'],
      ['A005', '银色蝴蝶结蓝牙配件', 'HWSZ001005', '银色蝴蝶结蓝牙配件', '蓝牙配件', '银白色', 'VIP', '0075A1B2SZTD5ZSD69I892XJUF', '183****7993', '2025-01-17 14:25:15'],
      ['A006', '金色蝴蝶结蓝牙配件', 'HWSZ001006', '金色蝴蝶结蓝牙配件', '蓝牙配件', '纯金色', 'SVIP', '0075A1B2SZTD5ZSD69I892XJUG', '183****8003', '2025-01-18 15:25:16'],
      ['A007', '紫色碳碳娃挂件富盒普通款', 'HWSZ001007', '紫色碳碳娃挂件富盒普通款', '普通挂件', '亮光紫', '普通会员', '0075A1B2SZTD5ZSD69I892XJUH', '183****8013', '2025-01-19 16:25:17'],
      ['A008', '橙色小熊玩偶', 'HWSZ001008', '橙色小熊玩偶', '毛绒玩具', '橙色', 'VIP', '0075A1B2SZTD5ZSD69I892XJUI', '183****8023', '2025-01-20 17:25:18'],
      ['A009', '黄色恐龙模型', 'HWSZ001009', '黄色恐龙模型', '模型', '柠檬黄', 'SVIP', '0075A1B2SZTD5ZSD69I892XJUJ', '183****8033', '2025-01-21 18:25:19'],
      ['A010', '黑色蝴蝶结蓝牙配件', 'HWSZ001010', '黑色蝴蝶结蓝牙配件', '蓝牙配件', '纯黑色', '普通会员', '0075A1B2SZTD5ZSD69I892XJUK', '183****8043', '2025-01-22 19:25:20'],
      ['A011', '白色碳碳娃挂件富盒普通款', 'HWSZ001011', '白色碳碳娃挂件富盒普通款', '普通挂件', '纯白色', 'VIP', '0075A1B2SZTD5ZSD69I892XJUL', '183****8053', '2025-01-23 20:25:21'],
      ['A012', '灰色小熊玩偶', 'HWSZ001012', '灰色小熊玩偶', '毛绒玩具', '深灰色', 'SVIP', '0075A1B2SZTD5ZSD69I892XJUM', '183****8063', '2025-01-24 21:25:22'],
      ['A013', '棕色恐龙模型', 'HWSZ001013', '棕色恐龙模型', '模型', '深棕色', '普通会员', '0075A1B2SZTD5ZSD69I892XJUN', '183****8073', '2025-01-25 22:25:23'],
      ['A014', '粉色蝴蝶结蓝牙配件', 'HWSZ001014', '粉色蝴蝶结蓝牙配件', '蓝牙配件', '淡粉色', 'VIP', '0075A1B2SZTD5ZSD69I892XJUO', '183****8083', '2025-01-26 23:25:24'],
      ['A015', '蓝色碳碳娃挂件富盒普通款', 'HWSZ001015', '蓝色碳碳娃挂件富盒普通款', '普通挂件', '深蓝色', 'SVIP', '0075A1B2SZTD5ZSD69I892XJUP', '183****8093', '2025-01-27 00:25:25'],
      ['A016', '绿色小熊玩偶', 'HWSZ001016', '绿色小熊玩偶', '毛绒玩具', '深绿色', '普通会员', '0075A1B2SZTD5ZSD69I892XJUQ', '183****8103', '2025-01-28 01:25:26'],
      ['A017', '红色恐龙模型', 'HWSZ001017', '红色恐龙模型', '模型', '深红色', 'VIP', '0075A1B2SZTD5ZSD69I892XJUR', '183****8113', '2025-01-29 02:25:27'],
      ['A018', '黄色蝴蝶结蓝牙配件', 'HWSZ001018', '黄色蝴蝶结蓝牙配件', '蓝牙配件', '金黄色', 'SVIP', '0075A1B2SZTD5ZSD69I892XJUS', '183****8123', '2025-01-30 03:25:28'],
      ['A019', '紫色碳碳娃挂件富盒普通款', 'HWSZ001019', '紫色碳碳娃挂件富盒普通款', '普通挂件', '深紫色', '普通会员', '0075A1B2SZTD5ZSD69I892XJUT', '183****8133', '2025-01-31 04:25:29'],
      ['A020', '橙色恐龙模型', 'HWSZ001020', '橙色恐龙模型', '模型', '深橙色', 'VIP', '0075A1B2SZTD5ZSD69I892XJUU', '183****8143', '2025-02-01 05:25:30']
    ];
    
    const insertQuery = `
      INSERT INTO product_list 
      (product_id, product_name, product_code, product_name2, product_type, color, member_type, device_id, sub_account_id, activation_time) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    for (const data of insertData) {
      await pool.execute(insertQuery, data);
    }
    
    console.log('✅ Successfully inserted 20 rows of data');
    
    // Verify the data
    const [rows] = await pool.execute('SELECT COUNT(*) as count FROM product_list');
    console.log(`✅ Total records in product_list table: ${rows[0].count}`);
    
    // Show a few sample records
    const [sampleRows] = await pool.execute('SELECT * FROM product_list LIMIT 5');
    console.log('✅ Sample records:');
    sampleRows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.product_name} (${row.product_id}) - ${row.color} - ${row.member_type}`);
    });
    
  } catch (error) {
    console.error('❌ Error updating product_list data:', error);
  } finally {
    await pool.end();
  }
}

updateProductListData(); 