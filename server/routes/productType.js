import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Get all product type records
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM product_type ORDER BY create_time DESC'
    );
    
    // Transform snake_case to camelCase for frontend
    const transformedRows = rows.map(row => ({
      id: row.id,
      productId: row.product_id,
      productModel: row.product_model,
      productName: row.product_name,
      productType: row.product_type,
      color: row.color,
      productDetails: row.product_details,
      deviceModel: row.device_model,
      ipName: row.ip_name,
      creator: row.creator,
      createTime: row.create_time,
      updateTime: row.update_time
    }));
    
    res.json(transformedRows);
  } catch (error) {
    console.error('Error fetching product type records:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get product type by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM product_type WHERE id = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product type record not found' });
    }
    
    const row = rows[0];
    // Transform snake_case to camelCase for frontend
    const transformedRow = {
      id: row.id,
      productId: row.product_id,
      productModel: row.product_model,
      productName: row.product_name,
      productType: row.product_type,
      color: row.color,
      productDetails: row.product_details,
      deviceModel: row.device_model,
      ipName: row.ip_name,
      creator: row.creator,
      createTime: row.create_time,
      updateTime: row.update_time
    };
    
    res.json(transformedRow);
  } catch (error) {
    console.error('Error fetching product type record:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new product type record
router.post('/', async (req, res) => {
  try {
    const {
      product_id,
      product_model,
      product_name,
      product_type,
      color,
      product_details,
      device_model,
      ip_name,
      creator
    } = req.body;

    // Validate required fields
    if (!product_id || !product_model || !product_name || !product_type || !device_model) {
      return res.status(400).json({ error: 'Product ID, product model, product name, product type, and device model are required' });
    }

    const [result] = await pool.execute(
      'INSERT INTO product_type (product_id, product_model, product_name, product_type, color, product_details, device_model, ip_name, creator) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [product_id, product_model, product_name, product_type, color, product_details, device_model, ip_name, creator]
    );

    res.status(201).json({
      id: result.insertId,
      message: 'Product type record created successfully'
    });
  } catch (error) {
    console.error('Error creating product type record:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Product ID or product model already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update product type record
router.put('/:id', async (req, res) => {
  try {
    const {
      product_id,
      product_model,
      product_name,
      product_type,
      color,
      product_details,
      device_model,
      ip_name,
      creator
    } = req.body;

    // Validate required fields
    if (!product_id || !product_model || !product_name || !product_type || !device_model) {
      return res.status(400).json({ error: 'Product ID, product model, product name, product type, and device model are required' });
    }

    const [result] = await pool.execute(
      'UPDATE product_type SET product_id = ?, product_model = ?, product_name = ?, product_type = ?, color = ?, product_details = ?, device_model = ?, ip_name = ?, creator = ? WHERE id = ?',
      [product_id, product_model, product_name, product_type, color, product_details, device_model, ip_name, creator, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product type record not found' });
    }

    res.json({ message: 'Product type record updated successfully' });
  } catch (error) {
    console.error('Error updating product type record:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Product ID or product model already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete product type record
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM product_type WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product type record not found' });
    }

    res.json({ message: 'Product type record deleted successfully' });
  } catch (error) {
    console.error('Error deleting product type record:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get product type by device model
router.get('/device/:deviceModel', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM product_type WHERE device_model = ? ORDER BY create_time DESC',
      [req.params.deviceModel]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching product type by device model:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get product type by product type
router.get('/type/:productType', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM product_type WHERE product_type = ? ORDER BY create_time DESC',
      [req.params.productType]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching product type by product type:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get product type by product ID
router.get('/product-id/:productId', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM product_type WHERE product_id = ?',
      [req.params.productId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching product type by product ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 