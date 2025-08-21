import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Get all toy production records with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;
    
    // Get total count
    const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM toy_production');
    const total = countResult[0].total;
    
    // Get paginated data
    const [rows] = await pool.execute(
      `SELECT * FROM toy_production ORDER BY create_time DESC LIMIT ${pageSize} OFFSET ${offset}`
    );
    
    console.log('Raw database rows:', rows);
    console.log('First row keys:', rows.length > 0 ? Object.keys(rows[0]) : 'No rows');
    
    // Transform database fields to frontend expected format
    const transformedRows = rows.map(row => {
      console.log('Processing row:', row);
      
      return {
        id: row.id,
        key: row.id, // Add key for table
        productionBatchId: row.product_id || '',
        productModel: row.device_model || '',
        productName: row.product_name || '',
        productionBatchDate: row.production_batch || '',
        manufacturer: row.manufacturer || '',
        unitPrice: parseFloat(row.unit_price || 0),
        quantity: parseInt(row.quantity || 0),
        totalPrice: parseFloat(row.total_price || 0),
        updaterId: parseInt(row.creator || 0),
        createTime: row.create_time || '',
        updateTime: row.update_time || ''
      };
    });
    
    console.log('Transformed rows:', transformedRows);
    
    res.json({
      data: transformedRows,
      pagination: {
        current: page,
        pageSize: pageSize,
        total: total
      }
    });
  } catch (error) {
    console.error('Error fetching toy production records:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Get toy production by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM toy_production WHERE id = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Toy production record not found' });
    }
    
    const row = rows[0];
    // Transform database fields to frontend expected format
    const transformedRow = {
      id: row.id,
      productionBatchId: row.product_id,
      productModel: row.device_model,
      productName: row.product_name,
      productionBatchDate: row.production_batch,
      manufacturer: row.manufacturer,
      unitPrice: parseFloat(row.unit_price),
      quantity: row.quantity,
      totalPrice: parseFloat(row.total_price),
      updaterId: row.creator,
      createTime: row.create_time,
      updateTime: row.update_time
    };
    
    res.json(transformedRow);
  } catch (error) {
    console.error('Error fetching toy production record:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new toy production record
router.post('/', async (req, res) => {
  try {
    const {
      production_batch_id,
      product_model,
      product_name,
      production_batch_date,
      manufacturer,
      unit_price,
      quantity,
      updater_id
    } = req.body;

    // Validate required fields
    if (!production_batch_id || !product_model || !product_name || !production_batch_date || !manufacturer || !unit_price || !quantity) {
      return res.status(400).json({ error: 'Production batch ID, product model, product name, production batch date, manufacturer, unit price, and quantity are required' });
    }

    const [result] = await pool.execute(
      'INSERT INTO toy_production (product_id, device_model, product_name, production_batch, manufacturer, unit_price, quantity, creator) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [production_batch_id, product_model, product_name, production_batch_date, manufacturer, unit_price, quantity, updater_id]
    );

    res.status(201).json({
      id: result.insertId,
      message: 'Toy production record created successfully'
    });
  } catch (error) {
    console.error('Error creating toy production record:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update toy production record
router.put('/:id', async (req, res) => {
  try {
    const {
      production_batch_id,
      product_model,
      product_name,
      production_batch_date,
      manufacturer,
      unit_price,
      quantity,
      updater_id
    } = req.body;

    // Validate required fields
    if (!production_batch_id || !product_model || !product_name || !production_batch_date || !manufacturer || !unit_price || !quantity) {
      return res.status(400).json({ error: 'Production batch ID, product model, product name, production batch date, manufacturer, unit price, and quantity are required' });
    }

    const [result] = await pool.execute(
      'UPDATE toy_production SET product_id = ?, device_model = ?, product_name = ?, production_batch = ?, manufacturer = ?, unit_price = ?, quantity = ?, creator = ? WHERE id = ?',
      [production_batch_id, product_model, product_name, production_batch_date, manufacturer, unit_price, quantity, updater_id, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Toy production record not found' });
    }

    res.json({ message: 'Toy production record updated successfully' });
  } catch (error) {
    console.error('Error updating toy production record:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete toy production record
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM toy_production WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Toy production record not found' });
    }

    res.json({ message: 'Toy production record deleted successfully' });
  } catch (error) {
    console.error('Error deleting toy production record:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get toy production by product name
router.get('/product/:productName', async (req, res) => {
  try {
    const productName = req.params.productName;
    const [rows] = await pool.execute(
      'SELECT * FROM toy_production WHERE product_name LIKE ? ORDER BY create_time DESC',
      [`%${productName}%`]
    );

    const transformedRows = rows.map(row => ({
      id: row.id,
      productionBatchId: row.product_id,
      productModel: row.device_model,
      productName: row.product_name,
      productionBatchDate: row.production_batch,
      manufacturer: row.manufacturer,
      unitPrice: parseFloat(row.unit_price),
      quantity: row.quantity,
      totalPrice: parseFloat(row.total_price),
      updaterId: row.creator,
      createTime: row.create_time,
      updateTime: row.update_time
    }));

    res.json(transformedRows);
  } catch (error) {
    console.error('Error fetching toy production by product name:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get toy production by manufacturer
router.get('/manufacturer/:manufacturer', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM toy_production WHERE manufacturer LIKE ? ORDER BY create_time DESC',
      [`%${req.params.manufacturer}%`]
    );
    
    const transformedRows = rows.map(row => ({
      id: row.id,
      productionBatchId: row.product_id,
      productModel: row.device_model,
      productName: row.product_name,
      productionBatchDate: row.production_batch,
      manufacturer: row.manufacturer,
      unitPrice: parseFloat(row.unit_price),
      quantity: row.quantity,
      totalPrice: parseFloat(row.total_price),
      updaterId: row.creator,
      createTime: row.create_time,
      updateTime: row.update_time
    }));
    
    res.json(transformedRows);
  } catch (error) {
    console.error('Error fetching toy production by manufacturer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 