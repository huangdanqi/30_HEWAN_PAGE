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

    // Clear table
    await pool.execute('DELETE FROM product_list');
    console.log('✅ Cleared existing data');

    const insertData = [
      ['A001', '粉色碳碳娃挂件富盒普通款', '普通挂件', '亮光粉', '批次A', '厂家X', '/qr/A001.png', 1, '/barcode/A001.png', 1, '0075A1B2SZTD5ZSD69I892XJUB', '183****7953', null, '2025-01-13 10:25:11', 1],
      ['A002', '蓝色小熊玩偶', '毛绒玩具', '天蓝', '批次A', '厂家X', '/qr/A002.png', 1, '/barcode/A002.png', 1, '0075A1B2SZTD5ZSD69I892XJUC', '183****7963', null, '2025-01-14 11:25:12', 1],
      ['A003', '绿色恐龙模型', '模型', '草绿', '批次A', '厂家X', '/qr/A003.png', 1, '/barcode/A003.png', 1, '0075A1B2SZTD5ZSD69I892XJUD', '183****7973', null, '2025-01-15 12:25:13', 1],
      ['A004', '红色蝴蝶结蓝牙配件', '蓝牙配件', '荧光粉', '批次A', '厂家X', '/qr/A004.png', 1, '/barcode/A004.png', 1, '0075A1B2SZTD5ZSD69I892XJUE', '183****7983', null, '2025-01-16 13:25:14', 1],
      ['A005', '银色蝴蝶结蓝牙配件', '蓝牙配件', '银白色', '批次A', '厂家X', '/qr/A005.png', 1, '/barcode/A005.png', 1, '0075A1B2SZTD5ZSD69I892XJUF', '183****7993', null, '2025-01-17 14:25:15', 1],
      ['A006', '金色蝴蝶结蓝牙配件', '蓝牙配件', '纯金色', '批次A', '厂家X', '/qr/A006.png', 1, '/barcode/A006.png', 1, '0075A1B2SZTD5ZSD69I892XJUG', '183****8003', null, '2025-01-18 15:25:16', 1],
      ['A007', '紫色碳碳娃挂件富盒普通款', '普通挂件', '亮光紫', '批次A', '厂家X', '/qr/A007.png', 1, '/barcode/A007.png', 1, '0075A1B2SZTD5ZSD69I892XJUH', '183****8013', null, '2025-01-19 16:25:17', 1],
      ['A008', '橙色小熊玩偶', '毛绒玩具', '橙色', '批次A', '厂家X', '/qr/A008.png', 1, '/barcode/A008.png', 1, '0075A1B2SZTD5ZSD69I892XJUI', '183****8023', null, '2025-01-20 17:25:18', 1],
      ['A009', '黄色恐龙模型', '模型', '柠檬黄', '批次A', '厂家X', '/qr/A009.png', 1, '/barcode/A009.png', 1, '0075A1B2SZTD5ZSD69I892XJUJ', '183****8033', null, '2025-01-21 18:25:19', 1],
      ['A010', '黑色蝴蝶结蓝牙配件', '蓝牙配件', '纯黑色', '批次A', '厂家X', '/qr/A010.png', 1, '/barcode/A010.png', 1, '0075A1B2SZTD5ZSD69I892XJUK', '183****8043', null, '2025-01-22 19:25:20', 1],
      ['A011', '白色碳碳娃挂件富盒普通款', '普通挂件', '纯白色', '批次A', '厂家X', '/qr/A011.png', 1, '/barcode/A011.png', 1, '0075A1B2SZTD5ZSD69I892XJUL', '183****8053', null, '2025-01-23 20:25:21', 1],
      ['A012', '灰色小熊玩偶', '毛绒玩具', '深灰色', '批次A', '厂家X', '/qr/A012.png', 1, '/barcode/A012.png', 1, '0075A1B2SZTD5ZSD69I892XJUM', '183****8063', null, '2025-01-24 21:25:22', 1],
      ['A013', '棕色恐龙模型', '模型', '深棕色', '批次A', '厂家X', '/qr/A013.png', 1, '/barcode/A013.png', 1, '0075A1B2SZTD5ZSD69I892XJUN', '183****8073', null, '2025-01-25 22:25:23', 1],
      ['A014', '粉色蝴蝶结蓝牙配件', '蓝牙配件', '淡粉色', '批次A', '厂家X', '/qr/A014.png', 1, '/barcode/A014.png', 1, '0075A1B2SZTD5ZSD69I892XJUO', '183****8083', null, '2025-01-26 23:25:24', 1],
      ['A015', '蓝色碳碳娃挂件富盒普通款', '普通挂件', '深蓝色', '批次A', '厂家X', '/qr/A015.png', 1, '/barcode/A015.png', 1, '0075A1B2SZTD5ZSD69I892XJUP', '183****8093', null, '2025-01-27 00:25:25', 1],
      ['A016', '绿色小熊玩偶', '毛绒玩具', '深绿色', '批次A', '厂家X', '/qr/A016.png', 1, '/barcode/A016.png', 1, '0075A1B2SZTD5ZSD69I892XJUQ', '183****8103', null, '2025-01-28 01:25:26', 1],
      ['A017', '红色恐龙模型', '模型', '深红色', '批次A', '厂家X', '/qr/A017.png', 1, '/barcode/A017.png', 1, '0075A1B2SZTD5ZSD69I892XJUR', '183****8113', null, '2025-01-29 02:25:27', 1],
      ['A018', '黄色蝴蝶结蓝牙配件', '蓝牙配件', '金黄色', '批次A', '厂家X', '/qr/A018.png', 1, '/barcode/A018.png', 1, '0075A1B2SZTD5ZSD69I892XJUS', '183****8123', null, '2025-01-30 03:25:28', 1],
      ['A019', '紫色碳碳娃挂件富盒普通款', '普通挂件', '深紫色', '批次A', '厂家X', '/qr/A019.png', 1, '/barcode/A019.png', 1, '0075A1B2SZTD5ZSD69I892XJUT', '183****8133', null, '2025-01-31 04:25:29', 1],
      ['A020', '橙色恐龙模型', '模型', '深橙色', '批次A', '厂家X', '/qr/A020.png', 1, '/barcode/A020.png', 1, '0075A1B2SZTD5ZSD69I892XJUU', '183****8143', null, '2025-02-01 05:25:30', 1],
    ];

    const insertQuery = `
      INSERT INTO product_list (
        product_id,
        product_name,
        product_type,
        color,
        production_batch,
        manufacturer,
        qr_code_file_directory,
        qr_code_exported,
        barcode_file_directory,
        barcode_exported,
        device_id,
        sub_account_id,
        file_export_time,
        first_binding_time,
        creator_id,
        creation_time,
        update_time
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    for (const data of insertData) {
      await pool.execute(insertQuery, data);
    }

    console.log('✅ Successfully inserted 20 rows of data');

    // Verify
    const [rows] = await pool.execute('SELECT COUNT(*) as count FROM product_list');
    console.log(`✅ Total records in product_list table: ${rows[0].count}`);

  } catch (error) {
    console.error('❌ Error updating product_list data:', error);
  } finally {
    await pool.end();
  }
}

updateProductListData();
