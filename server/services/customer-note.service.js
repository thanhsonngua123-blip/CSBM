const pool = require('../config/db');

async function getCustomerById(customerId) {
  const [rows] = await pool.query(
    'SELECT id, full_name FROM customers WHERE id = ?',
    [customerId]
  );

  if (rows.length === 0) {
    throw new Error('Khong tim thay khach hang');
  }

  return rows[0];
}

function normalizeContent(value) {
  return typeof value === 'string' ? value.trim() : '';
}

async function getByCustomerId(customerId) {
  await getCustomerById(customerId);

  const [rows] = await pool.query(
    `SELECT
      customer_notes.id,
      customer_notes.customer_id,
      customer_notes.user_id,
      customer_notes.content,
      customer_notes.created_at,
      users.username,
      users.role
    FROM customer_notes
    INNER JOIN users ON users.id = customer_notes.user_id
    WHERE customer_notes.customer_id = ?
    ORDER BY customer_notes.created_at DESC, customer_notes.id DESC`,
    [customerId]
  );

  return rows;
}

async function create({ customerId, userId, content }) {
  const customer = await getCustomerById(customerId);
  const normalizedContent = normalizeContent(content);

  if (!normalizedContent) {
    throw new Error('Noi dung ghi chu khong duoc de trong');
  }

  const [result] = await pool.query(
    'INSERT INTO customer_notes (customer_id, user_id, content) VALUES (?, ?, ?)',
    [customerId, userId, normalizedContent]
  );

  const [rows] = await pool.query(
    `SELECT
      customer_notes.id,
      customer_notes.customer_id,
      customer_notes.user_id,
      customer_notes.content,
      customer_notes.created_at,
      users.username,
      users.role
    FROM customer_notes
    INNER JOIN users ON users.id = customer_notes.user_id
    WHERE customer_notes.id = ?`,
    [result.insertId]
  );

  return {
    note: rows[0],
    customer_name: customer.full_name
  };
}

module.exports = { getByCustomerId, create };
