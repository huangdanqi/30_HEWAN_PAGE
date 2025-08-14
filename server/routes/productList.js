import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Simple test route to verify the router is working
router.get('/ping', (req, res) => {
  console.log('=== PING ROUTE CALLED ===');
  res.json({ message: 'ProductList router is working!', timestamp: new Date().toISOString() });
});

// Get all product list records
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM product_list ORDER BY update_time DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching product list records:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get product list by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM product_list WHERE id = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product list record not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching product list record:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new product list record
router.post('/', async (req, res) => {
  try {
    console.log('=== POST REQUEST DEBUG ===');
    console.log('Request body:', req.body);
    console.log('Request body type:', typeof req.body);
    console.log('Request body keys:', Object.keys(req.body || {}));
    console.log('Request body length:', req.body ? Object.keys(req.body).length : 0);
    console.log('Content-Type:', req.get('Content-Type'));
    console.log('Request method:', req.method);
    console.log('Request URL:', req.url);
    console.log('Request headers:', req.headers);
    
    // Check if this is a batch add request (empty or minimal body)
    const hasRequiredFields = req.body && 
      req.body.product_id && 
      req.body.product_name && 
      req.body.product_type;
    
    const isEmptyOrMinimal = !req.body || 
      Object.keys(req.body).length === 0 || 
      (req.body.product_id === undefined && req.body.product_name === undefined && req.body.product_type === undefined) ||
      (req.body.product_id === '' && req.body.product_name === '' && req.body.product_type === '');
    
    console.log('=== BATCH ADD DETECTION DEBUG ===');
    console.log('Has required fields:', hasRequiredFields);
    console.log('Is empty or minimal:', isEmptyOrMinimal);
    console.log('Request body keys:', Object.keys(req.body || {}));
    console.log('Request body values:', req.body);
    console.log('product_id:', req.body?.product_id);
    console.log('product_name:', req.body?.product_name);
    console.log('product_type:', req.body?.product_type);
    console.log('req.body is empty object:', req.body && Object.keys(req.body).length === 0);
    console.log('req.body === null:', req.body === null);
    console.log('req.body === undefined:', req.body === undefined);
    
    if (!hasRequiredFields || isEmptyOrMinimal) {
      
      console.log('=== BATCH ADD DETECTED ===');
      
      try {
        // Generate a unique product ID for batch add
        const timestamp = Date.now();
        const randomSuffix = Math.floor(Math.random() * 1000);
        const product_id = `PROD_${timestamp}_${randomSuffix}`;
        
        // Use default values for batch add - match the actual database schema
        const sql = `INSERT INTO product_list (
          product_id, product_name, product_code, product_name2, product_type, 
          color, member_type, device_id, sub_account_id, activation_time, update_time
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;
        
        const values = [
          product_id, '新产品', product_id, '新产品', '默认类型', 
          '默认颜色', '普通会员', '默认设备', '默认账户'
        ];
        
        console.log('Batch Add SQL Query:', sql);
        console.log('Batch Add Values:', values);
        console.log('========================');

        const [result] = await pool.execute(sql, values);

        return res.status(201).json({
          id: result.insertId,
          product_id: product_id,
          message: 'Product list record created successfully via batch add'
        });
      } catch (dbError) {
        console.error('=== DATABASE ERROR IN BATCH ADD ===');
        console.error('Database error:', dbError);
        console.error('Error code:', dbError.code);
        console.error('Error message:', dbError.message);
        
        // Return a more specific error message
        return res.status(500).json({ 
          error: 'Database error during batch add', 
          details: dbError.message,
          code: dbError.code 
        });
      }
    }
    
    console.log('=== REGULAR PRODUCT CREATION DETECTED ===');
    
    // Regular product creation (existing logic)
    const {
      product_id,
      product_name,
      product_type,
      product_code,
      product_name2,
      color,
      member_type,
      device_id,
      sub_account_id,
      activation_time
    } = req.body;

    // Validate required fields
    if (!product_id || !product_name || !product_type) {
      console.log('=== VALIDATION FAILED ===');
      console.log('Missing required fields:', { product_id, product_name, product_type });
      return res.status(400).json({ error: 'Product ID, product name, and product type are required' });
    }

    // Use the correct columns that exist in your table
    const sql = `INSERT INTO product_list (
      product_id, product_name, product_code, product_name2, product_type, 
      color, member_type, device_id, sub_account_id, activation_time, update_time
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`;
    
    const values = [
      product_id, 
      product_name,
      product_code || product_id, // Use product_id as fallback for product_code
      product_name2 || product_name, // Use product_name as fallback for product_name2
      product_type,
      color || null,
      member_type || null,
      device_id || null,
      sub_account_id || null,
      activation_time || new Date().toISOString().slice(0, 19).replace('T', ' ')
    ];
    
    console.log('Regular Creation SQL Query:', sql);
    console.log('Regular Creation Values:', values);
    console.log('========================');

    const [result] = await pool.execute(sql, values);

    res.status(201).json({
      id: result.insertId,
      message: 'Product list record created successfully'
    });
  } catch (error) {
    console.error('=== ERROR DETAILS ===');
    console.error('Error creating product list record:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('SQL Error message:', error.sqlMessage);
    console.error('SQL Query that failed:', error.sql);
    console.error('Error stack:', error.stack);
    console.error('=====================');
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Product ID already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Batch add new product list record (批量新增)
router.post('/batch-add', async (req, res) => {
  try {
    console.log('=== BATCH ADD REQUEST DEBUG ===');
    console.log('Request body:', req.body);
    
    // Generate a unique product ID (you can modify this logic as needed)
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 1000);
    const product_id = `PROD_${timestamp}_${randomSuffix}`;
    
    // Use default values for the new row
    const sql = `INSERT INTO product_list (
      product_id, product_name, product_type, product_model, ip_role, color, 
      production_batch, manufacturer, qr_code_file_directory, qr_code_exported, 
      barcode_file_directory, barcode_exported, device_id, sub_account_id, 
      file_export_time, first_binding_time, creator_id, creation_time, update_time
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`;
    
    const values = [
      product_id,                    // Auto-generated product ID
      '新产品',                       // Default product name
      '默认类型',                     // Default product type
      null,                         // product_model
      null,                         // ip_role
      null,                         // color
      null,                         // production_batch
      null,                         // manufacturer
      null,                         // qr_code_file_directory
      '否',                         // qr_code_exported
      null,                         // barcode_file_directory
      '否',                         // barcode_exported
      null,                         // device_id
      null,                         // sub_account_id
      null,                         // file_export_time
      null,                         // first_binding_time
      1,                            // creator_id (default)
      new Date().toISOString().slice(0, 19).replace('T', ' '), // creation_time
    ];
    
    console.log('SQL Query:', sql);
    console.log('Values:', values);
    console.log('========================');

    const [result] = await pool.execute(sql, values);

    res.status(201).json({
      id: result.insertId,
      product_id: product_id,
      message: 'Product list record created successfully via batch add'
    });
  } catch (error) {
    console.error('=== BATCH ADD ERROR DETAILS ===');
    console.error('Error creating product list record:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('SQL Error message:', error.sqlMessage);
    console.error('SQL Query that failed:', error.sql);
    console.error('Error stack:', error.stack);
    console.error('=====================');
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update product list record
router.put('/:id', async (req, res) => {
  try {
    const {
      product_id,
      product_name,
      product_type,
      product_model,
      ip_role,
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
      creation_time
    } = req.body;

    // Validate required fields based on actual table structure
    if (!product_id || !product_name || !product_type) {
      return res.status(400).json({ error: 'Product ID, product name, and product type are required' });
    }

    const [result] = await pool.execute(
      `UPDATE product_list SET 
        product_id = ?, product_name = ?, product_type = ?, product_model = ?, ip_role = ?, 
        color = ?, production_batch = ?, manufacturer = ?, qr_code_file_directory = ?, 
        qr_code_exported = ?, barcode_file_directory = ?, barcode_exported = ?, 
        device_id = ?, sub_account_id = ?, file_export_time = ?, first_binding_time = ?, 
        creator_id = ?, creation_time = ?, update_time = NOW()
      WHERE id = ?`,
      [
        product_id, product_name, product_type, product_model || null, ip_role || null,
        color || null, production_batch || null, manufacturer || null, qr_code_file_directory || null,
        qr_code_exported || '否', barcode_file_directory || null, barcode_exported || '否',
        device_id || null, sub_account_id || null, file_export_time || null, first_binding_time || null,
        creator_id || 1, creation_time || new Date().toISOString().slice(0, 19).replace('T', ' '),
        req.params.id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product list record not found' });
    }

    res.json({ message: 'Product list record updated successfully' });
  } catch (error) {
    console.error('Error updating product list record:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Product ID already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete product list record
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM product_list WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product list record not found' });
    }

    res.json({ message: 'Product list record deleted successfully' });
  } catch (error) {
    console.error('Error deleting product list record:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get product list by product type
router.get('/type/:productType', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM product_list WHERE product_type = ? ORDER BY update_time DESC',
      [req.params.productType]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching product list by product type:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get product list by product name
router.get('/name/:productName', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM product_list WHERE product_name LIKE ? ORDER BY update_time DESC',
      [`%${req.params.productName}%`]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching product list by product name:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get product list by member type
router.get('/member/:memberType', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM product_list WHERE member_type = ? ORDER BY update_time DESC',
      [req.params.memberType]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching product list by member type:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get product list by device ID
router.get('/device/:deviceId', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM product_list WHERE device_id = ? ORDER BY update_time DESC',
      [req.params.deviceId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching product list by device ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get product list by product ID
router.get('/product-id/:productId', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM product_list WHERE product_id = ?',
      [req.params.productId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching product list by product ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test endpoint to verify database connectivity
router.get('/test', async (req, res) => {
  try {
    console.log('=== TEST ENDPOINT CALLED ===');
    
    // Test database connection
    const [rows] = await pool.execute('SELECT 1 as test');
    console.log('Database connection test result:', rows);
    
    // Test table structure
    const [tableInfo] = await pool.execute('DESCRIBE product_list');
    console.log('Table structure:', tableInfo);
    
    // Show actual columns
    const [columns] = await pool.execute('SHOW COLUMNS FROM product_list');
    console.log('Actual columns:', columns.map(col => col.Field));
    
    res.json({
      message: 'Database connection successful',
      tableStructure: tableInfo,
      actualColumns: columns.map(col => col.Field),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({ error: 'Database test failed', details: error.message });
  }
});

// Test endpoint to verify batch add logic without database access
router.post('/test-batch-add', async (req, res) => {
  try {
    console.log('=== TEST BATCH ADD ENDPOINT ===');
    console.log('Request body:', req.body);
    console.log('Request body type:', typeof req.body);
    console.log('Request body keys:', Object.keys(req.body || {}));
    
    // Check if this is a batch add request (empty or minimal body)
    const hasRequiredFields = req.body && 
      req.body.product_id && 
      req.body.product_name && 
      req.body.product_type;
    
    const isEmptyOrMinimal = !req.body || 
      Object.keys(req.body).length === 0 || 
      (req.body.product_id === undefined && req.body.product_name === undefined && req.body.product_type === undefined) ||
      (req.body.product_id === '' && req.body.product_name === '' && req.body.product_type === '');
    
    console.log('=== BATCH ADD DETECTION DEBUG ===');
    console.log('Has required fields:', hasRequiredFields);
    console.log('Is empty or minimal:', isEmptyOrMinimal);
    console.log('Request body keys:', Object.keys(req.body || {}));
    console.log('Request body values:', req.body);
    console.log('product_id:', req.body?.product_id);
    console.log('product_name:', req.body?.product_name);
    console.log('product_type:', req.body?.product_type);
    
    if (!hasRequiredFields || isEmptyOrMinimal) {
      console.log('=== BATCH ADD DETECTED (TEST MODE) ===');
      
      // Generate a unique product ID for batch add
      const timestamp = Date.now();
      const randomSuffix = Math.floor(Math.random() * 1000);
      const product_id = `PROD_${timestamp}_${randomSuffix}`;
      
      console.log('Generated product ID:', product_id);
      console.log('========================');

      return res.status(201).json({
        id: Math.floor(Math.random() * 10000),
        product_id: product_id,
        message: 'Product list record created successfully via batch add (TEST MODE)',
        test_mode: true
      });
    }
    
    console.log('=== REGULAR PRODUCT CREATION DETECTED (TEST MODE) ===');
    
    // Regular product creation (test mode)
    const {
      product_id,
      product_name,
      product_type
    } = req.body;

    // Validate required fields
    if (!product_id || !product_name || !product_type) {
      console.log('=== VALIDATION FAILED ===');
      console.log('Missing required fields:', { product_id, product_name, product_type });
      return res.status(400).json({ error: 'Product ID, product name, and product type are required' });
    }

    return res.status(201).json({
      id: Math.floor(Math.random() * 10000),
      message: 'Product list record created successfully (TEST MODE)',
      test_mode: true,
      received_data: { product_id, product_name, product_type }
    });
    
  } catch (error) {
    console.error('=== TEST ENDPOINT ERROR ===');
    console.error('Error:', error);
    res.status(500).json({ error: 'Test endpoint error: ' + error.message });
  }
});

export default router;