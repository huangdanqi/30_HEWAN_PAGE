import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

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
    const {
      product_id,
      product_name,
      product_code,
      product_name2,
      product_type,
      color,
      member_type,
      device_id,
      sub_account_id,
      activation_time
    } = req.body;

    // Validate required fields
    if (!product_id || !product_name || !product_code || !product_name2 || !product_type) {
      return res.status(400).json({ error: 'Product ID, product name, product code, product name2, and product type are required' });
    }

    const [result] = await pool.execute(
      'INSERT INTO product_list (product_id, product_name, product_code, product_name2, product_type, color, member_type, device_id, sub_account_id, activation_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [product_id, product_name, product_code, product_name2, product_type, color, member_type, device_id, sub_account_id, activation_time]
    );

    res.status(201).json({
      id: result.insertId,
      message: 'Product list record created successfully'
    });
  } catch (error) {
    console.error('Error creating product list record:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Product ID already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update product list record
router.put('/:id', async (req, res) => {
  try {
    const {
      product_id,
      product_name,
      product_code,
      product_name2,
      product_type,
      color,
      member_type,
      device_id,
      sub_account_id,
      activation_time
    } = req.body;

    // Validate required fields
    if (!product_id || !product_name || !product_code || !product_name2 || !product_type) {
      return res.status(400).json({ error: 'Product ID, product name, product code, product name2, and product type are required' });
    }

    const [result] = await pool.execute(
      'UPDATE product_list SET product_id = ?, product_name = ?, product_code = ?, product_name2 = ?, product_type = ?, color = ?, member_type = ?, device_id = ?, sub_account_id = ?, activation_time = ? WHERE id = ?',
      [product_id, product_name, product_code, product_name2, product_type, color, member_type, device_id, sub_account_id, activation_time, req.params.id]
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

export default router; 