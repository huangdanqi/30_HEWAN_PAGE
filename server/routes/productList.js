import express from 'express';
import pool from '../config/database.js';
const express = require('express');
const router = express.Router();
const pool = require('../db'); // adjust path if needed

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
      device_id,
      sub_account_id,
      file_export_time,
      first_binding_time,
      creator_id
    } = req.body;

    // Basic validation for required fields
    const requiredFields = [
      serial_number, product_id, ip_role, product_model, product_name, product_type, color,
      production_batch, manufacturer, qr_code_file_directory, barcode_file_directory,
      device_id, sub_account_id, file_export_time, first_binding_time, creator_id
    ];

    if (requiredFields.some(field => field === undefined || field === null || field === '')) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const sql = `
      INSERT INTO product_list (
        serial_number, product_id, ip_role, product_model, product_name, product_type, color,
        production_batch, manufacturer, qr_code_file_directory, qr_code_exported,
        barcode_file_directory, barcode_exported, device_id, sub_account_id,
        file_export_time, first_binding_time, creator_id, creation_time, update_time
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const values = [
      serial_number, product_id, ip_role, product_model, product_name, product_type, color,
      production_batch, manufacturer, qr_code_file_directory, qr_code_exported,
      barcode_file_directory, barcode_exported, device_id, sub_account_id,
      file_export_time, first_binding_time, creator_id
    ];

    const [result] = await pool.execute(sql, values);

    res.status(201).json({
      id: result.insertId,
      product_id,
      message: 'Product created successfully'
    });
  } catch (error) {
    console.error('CREATE PRODUCT ERROR:', error);
    res.status(500).json({ error: 'Internal server error' });
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
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const values = [
      1, // serial_number
      product_id,
      '默认角色',
      '默认型号',
      '新产品',
      '默认类型',
      '默认颜色',
      new Date().toISOString().slice(0, 10), // YYYY-MM-DD
      '默认制造商',
      '/default/qr/path',
      '否',
      '/default/barcode/path',
      '否',
      '默认设备',
      '默认账户',
      new Date().toISOString().slice(0, 19).replace('T', ' '),
      new Date().toISOString().slice(0, 19).replace('T', ' '),
      1 // creator_id
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

module.exports = router;
export default router;
