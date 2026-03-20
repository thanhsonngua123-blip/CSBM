const pool = require('../config/db');
const { encryptAES, decryptAES } = require('../utils/encryption');
const { maskSensitiveText } = require('../utils/masking');

const AES_KEY = process.env.AES_SECRET_KEY;

function normalizeText(value) {
  if (value === undefined || value === null) {
    return '';
  }

  return String(value).trim();
}

function encryptNoteContent(value) {
  const normalized = normalizeText(value);

  if (!normalized) {
    return null;
  }

  if (!AES_KEY) {
    return normalized;
  }

  return encryptAES(normalized, AES_KEY);
}

function decryptNoteContent(value) {
  const normalized = normalizeText(value);

  if (!normalized) {
    return '';
  }

  if (!AES_KEY) {
    return normalized;
  }

  try {
    return decryptAES(normalized, AES_KEY);
  } catch (error) {
    throw new Error('Du lieu ghi chu da bi sua hoac khong hop le');
  }
}

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
  return normalizeText(value);
}

function formatNote(row, role) {
  const decryptedContent = row.content ? decryptNoteContent(row.content) : '';

  return {
    id: row.id,
    customer_id: row.customer_id,
    user_id: row.user_id,
    content: role === 'staff' ? maskSensitiveText(decryptedContent) : decryptedContent,
    created_at: row.created_at,
    username: row.username,
    role: row.role
  };
}

async function getByCustomerId(customerId, role) {
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

  return rows.map((row) => formatNote(row, role));
}

async function create({ customerId, userId, content, role }) {
  const customer = await getCustomerById(customerId);
  const normalizedContent = normalizeContent(content);

  if (!normalizedContent) {
    throw new Error('Noi dung ghi chu khong duoc de trong');
  }

  const [result] = await pool.query(
    'INSERT INTO customer_notes (customer_id, user_id, content) VALUES (?, ?, ?)',
    [customerId, userId, encryptNoteContent(normalizedContent)]
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
    note: formatNote(rows[0], role),
    customer_name: customer.full_name
  };
}

module.exports = { getByCustomerId, create };
