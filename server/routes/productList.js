import express from 'express';
import pool from '../config/database.js'; // adjust if needed

const router = express.Router();

// ==================== GET ALL PRODUCTS ====================
router.get('/', async (req, res) => {
  try {
    const sql = `
      SELECT 
        id,
        serial_number,
        product_id,
        ip_role,
        product_model,
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
      FROM product_list
      ORDER BY update_time DESC
    `;

    const [rows] = await pool.execute(sql);
    
    res.json(rows);
  } catch (error) {
    console.error('GET PRODUCTS ERROR:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== TEST DATABASE CONNECTION ====================
router.get('/test-db', async (req, res) => {
  try {
    // Test database connection
    const [result] = await pool.execute('SELECT 1 as test');
    console.log('Database connection test result:', result);
    
    // Test if table exists
    const [tables] = await pool.execute('SHOW TABLES LIKE "product_list"');
    console.log('Tables check result:', tables);
    
    // Test table structure
    const [columns] = await pool.execute('DESCRIBE product_list');
    console.log('Table structure:', columns);
    
    res.json({
      connection: 'OK',
      tableExists: tables.length > 0,
      tableStructure: columns
    });
  } catch (error) {
    console.error('DATABASE TEST ERROR:', error);
    res.status(500).json({ 
      error: 'Database test failed', 
      details: error.message,
      code: error.code
    });
  }
});

// ==================== CREATE SINGLE PRODUCT ====================
router.post('/', async (req, res) => {
  try {
    const {
      serial_number,
      product_id,
      ip_role,
      product_model,
      product_name,
      product_type,
      color,
      production_batch,
      manufacturer,
      qr_code_file_directory,
      qr_code_exported = '否',
      barcode_file_directory,
      barcode_exported = '否',
      device_id = '',
      sub_account_id = '',
      file_export_time = '',
      first_binding_time = '',
      creator_id
    } = req.body;

    // Only require essential fields
    const requiredFields = [
      serial_number, product_id, ip_role, product_model, product_name, product_type, color,
      production_batch, manufacturer, qr_code_file_directory, barcode_file_directory, creator_id
    ];

    if (requiredFields.some(field => field === undefined || field === null || field === '')) {
      console.error('Missing required fields:', { requiredFields, received: req.body });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const sql = `
      INSERT INTO product_list (
        serial_number, product_id, ip_role, product_model, product_name, product_type, color,
        production_batch, manufacturer, qr_code_file_directory, qr_code_exported,
        barcode_file_directory, barcode_exported, device_id, sub_account_id,
        file_export_time, first_binding_time, creator_id, creation_time, update_time
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const values = [
      serial_number, product_id, ip_role, product_model, product_name, product_type, color,
      production_batch, manufacturer, qr_code_file_directory, qr_code_exported,
      barcode_file_directory, barcode_exported, device_id, sub_account_id,
      file_export_time, first_binding_time, creator_id, new Date().toISOString().slice(0, 19).replace('T', ' ')
    ];

    console.log('Executing SQL with values:', values);

    const [result] = await pool.execute(sql, values);

    console.log('SQL execution result:', result);

    res.status(201).json({
      id: result.insertId,
      product_id,
      message: 'Product created successfully'
    });
  } catch (error) {
    console.error('CREATE PRODUCT ERROR:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage
    });
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message,
      code: error.code,
      sqlState: error.sqlState
    });
  }
});

// ==================== BATCH ADD PRODUCT ====================
router.post('/batch-add', async (req, res) => {
  try {
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 1000);
    const product_id = `PROD_${timestamp}_${randomSuffix}`;

    const sql = `
      INSERT INTO product_list (
        serial_number, product_id, ip_role, product_model, product_name, product_type, color,
        production_batch, manufacturer, qr_code_file_directory, qr_code_exported,
        barcode_file_directory, barcode_exported, device_id, sub_account_id,
        file_export_time, first_binding_time, creator_id, creation_time, update_time
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const values = [
      1, // serial_number
      product_id,
      '默认角色',
      '默认型号',
      '新产品',
      '默认类型',
      '默认颜色',
      new Date().toISOString().slice(0, 10),
      '默认制造商',
      '/default/qr/path',
      '否',
      '/default/barcode/path',
      '否',
      '默认设备',
      '默认账户',
      new Date().toISOString().slice(0, 19).replace('T', ' '),
      new Date().toISOString().slice(0, 19).replace('T', ' '),
      1, // creator_id
      new Date().toISOString().slice(0, 19).replace('T', ' ') // creation_time
    ];

    const [result] = await pool.execute(sql, values);

    res.status(201).json({
      id: result.insertId,
      product_id,
      message: 'Product list record created successfully via batch add'
    });
  } catch (error) {
    console.error('BATCH ADD ERROR:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== UPDATE PRODUCT ====================
router.put('/:id', async (req, res) => {
  try {
    const {
      serial_number,
      product_id,
      ip_role,
      product_model,
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
      creator_id
    } = req.body;

    const sql = `
      UPDATE product_list
      SET serial_number = ?, product_id = ?, ip_role = ?, product_model = ?, product_name = ?, 
          product_type = ?, color = ?, production_batch = ?, manufacturer = ?, 
          qr_code_file_directory = ?, qr_code_exported = ?, 
          barcode_file_directory = ?, barcode_exported = ?, 
          device_id = ?, sub_account_id = ?, 
          file_export_time = ?, first_binding_time = ?, creator_id = ?, update_time = NOW()
      WHERE id = ?
    `;

    const values = [
      serial_number, product_id, ip_role, product_model, product_name,
      product_type, color, production_batch, manufacturer,
      qr_code_file_directory, qr_code_exported,
      barcode_file_directory, barcode_exported,
      device_id, sub_account_id,
      file_export_time, first_binding_time, creator_id,
      req.params.id
    ];

    const [result] = await pool.execute(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('UPDATE PRODUCT ERROR:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== DELETE PRODUCT ====================
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.execute(`DELETE FROM product_list WHERE id = ?`, [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('DELETE PRODUCT ERROR:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== TEST PRODUCT CREATION ====================
router.post('/test-create', async (req, res) => {
  try {
    console.log('Testing product creation with data:', req.body);
    
    // Test with minimal required data
    const testData = {
      serial_number: 1,
      product_id: 'TEST_' + Date.now(),
      ip_role: '测试角色',
      product_model: '测试型号',
      product_name: '测试产品',
      product_type: '测试类型',
      color: '测试颜色',
      production_batch: '2025-01-27',
      manufacturer: '测试厂家',
      qr_code_file_directory: '/test/qr.png',
      barcode_file_directory: '/test/barcode.png',
      creator_id: 1
    };
    
    const sql = `
      INSERT INTO product_list (
        serial_number, product_id, ip_role, product_model, product_name, product_type, color,
        production_batch, manufacturer, qr_code_file_directory, qr_code_exported,
        barcode_file_directory, barcode_exported, device_id, sub_account_id,
        file_export_time, first_binding_time, creator_id, creation_time, update_time
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const values = [
      testData.serial_number, testData.product_id, testData.ip_role, testData.product_model, 
      testData.product_name, testData.product_type, testData.color, testData.production_batch, 
      testData.manufacturer, testData.qr_code_file_directory, '否', 
      testData.barcode_file_directory, '否', '', '', '', testData.creator_id,
      new Date().toISOString().slice(0, 19).replace('T', ' ') // creation_time
    ];
    
    console.log('Test SQL values:', values);
    
    const [result] = await pool.execute(sql, values);
    
    console.log('Test creation result:', result);
    
    res.json({
      success: true,
      message: 'Test product created successfully',
      id: result.insertId,
      data: testData
    });
    
  } catch (error) {
    console.error('TEST PRODUCT CREATION ERROR:', error);
    res.status(500).json({ 
      error: 'Test creation failed', 
      details: error.message,
      code: error.code,
      sqlState: error.sqlState
    });
  }
});

export default router;
