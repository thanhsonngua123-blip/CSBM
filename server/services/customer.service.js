const pool = require('../config/db');
const { encryptAES, decryptAES } = require('../utils/encryption');
const { maskPhone, maskIdNumber, maskAddress } = require('../utils/masking');

const AES_KEY = process.env.AES_SECRET_KEY;

// Ma hoa cac truong nhay cam truoc khi luu
function encryptFields(data) {
  return {
    full_name: data.full_name,
    email: data.email || null,
    phone: data.phone ? encryptAES(data.phone, AES_KEY) : null,
    id_number: data.id_number ? encryptAES(data.id_number, AES_KEY) : null,
    address: data.address ? encryptAES(data.address, AES_KEY) : null
  };
}

function hasMaskCharacter(value) {
  return typeof value === 'string' && value.includes('*');
}

function normalizeText(value) {
  if (value === undefined || value === null) return '';
  return String(value).trim();
}

function normalizeEmail(value) {
  return normalizeText(value).toLowerCase();
}

function resolveSensitiveValue(inputValue, existingCipherValue) {
  const normalized = normalizeText(inputValue);

  // Neu client gui lai gia tri da mask thi giu nguyen du lieu cu.
  if (hasMaskCharacter(normalized)) {
    return existingCipherValue;
  }

  return encryptAES(normalized, AES_KEY);
}

async function ensureUniqueCustomerFields({ email, idNumberCipher, excludeId }) {
  const conditions = [];
  const params = [];

  if (email) {
    conditions.push('email = ?');
    params.push(email);
  }

  if (idNumberCipher) {
    conditions.push('id_number = ?');
    params.push(idNumberCipher);
  }

  if (conditions.length === 0) {
    return;
  }

  let query = `SELECT id, email, id_number FROM customers WHERE (${conditions.join(' OR ')})`;

  if (excludeId) {
    query = query + ' AND id <> ?';
    params.push(excludeId);
  }

  const [rows] = await pool.query(query, params);

  for (let i = 0; i < rows.length; i = i + 1) {
    const row = rows[i];

    if (email && row.email === email) {
      throw new Error('Email da ton tai');
    }

    if (idNumberCipher && row.id_number === idNumberCipher) {
      throw new Error('CCCD/CMND da ton tai');
    }
  }
}

// Giai ma + mask theo role
function decryptAndFormat(row, role) {
  var phone = row.phone ? decryptAES(row.phone, AES_KEY) : '';
  var idNumber = row.id_number ? decryptAES(row.id_number, AES_KEY) : '';
  var address = row.address ? decryptAES(row.address, AES_KEY) : '';

  // Staff chi thay du lieu da che
  if (role === 'staff') {
    phone = phone ? maskPhone(phone) : '';
    idNumber = idNumber ? maskIdNumber(idNumber) : '';
    address = address ? maskAddress(address) : '';
  }

  return {
    id: row.id,
    full_name: row.full_name,
    email: row.email,
    phone: phone,
    id_number: idNumber,
    address: address,
    created_by: row.created_by,
    created_by_username: row.created_by_username || null,
    created_by_role: row.created_by_role || null,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

function formatRaw(row) {
  return {
    id: row.id,
    full_name: row.full_name,
    email: row.email,
    phone: row.phone || '',
    id_number: row.id_number || '',
    address: row.address || '',
    created_by: row.created_by,
    created_by_username: row.created_by_username || null,
    created_by_role: row.created_by_role || null,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

// Lay danh sach khach hang (co search theo ten)
async function getAll(search, role, options = {}) {
  const rawMode = options.rawMode === true;
  var query = `
    SELECT 
      customers.*,
      users.username AS created_by_username,
      users.role AS created_by_role
    FROM customers
    INNER JOIN users ON users.id = customers.created_by
  `;
  var params = [];

  if (search) {
    query = query + ' WHERE customers.full_name LIKE ?';
    params[0] = '%' + search + '%';
  }
  query = query + ' ORDER BY customers.created_at ASC, customers.id ASC';

  var [rows] = await pool.query(query, params);

  // Giai ma va format tung dong
  var result = [];
  for (var i = 0; i < rows.length; i++) {
    result[i] = rawMode ? formatRaw(rows[i]) : decryptAndFormat(rows[i], role);
  }
  return result;
}

// Lay chi tiet 1 khach hang
async function getById(id, role) {
  var [rows] = await pool.query(
    `SELECT 
      customers.*,
      users.username AS created_by_username,
      users.role AS created_by_role
    FROM customers
    INNER JOIN users ON users.id = customers.created_by
    WHERE customers.id = ?`,
    [id]
  );
  if (rows.length === 0) {
    throw new Error('Khong tim thay khach hang');
  }
  return decryptAndFormat(rows[0], role);
}

// Them khach hang moi
async function create(data, userId) {
  const normalizedData = {
    full_name: normalizeText(data.full_name),
    email: normalizeEmail(data.email),
    phone: normalizeText(data.phone),
    id_number: normalizeText(data.id_number),
    address: normalizeText(data.address)
  };

  var encrypted = encryptFields(normalizedData);
  await ensureUniqueCustomerFields({
    email: encrypted.email,
    idNumberCipher: encrypted.id_number
  });

  var [result] = await pool.query(
    'INSERT INTO customers (full_name, email, phone, id_number, address, created_by) VALUES (?, ?, ?, ?, ?, ?)',
    [encrypted.full_name, encrypted.email, encrypted.phone, encrypted.id_number, encrypted.address, userId]
  );
  return { id: result.insertId };
}

// Cap nhat khach hang
async function update(id, data) {
  const [rows] = await pool.query('SELECT * FROM customers WHERE id = ?', [id]);
  if (rows.length === 0) {
    throw new Error('Khong tim thay khach hang');
  }

  const existing = rows[0];
  const normalizedFullName = normalizeText(data.full_name);
  const normalizedEmail = normalizeEmail(data.email);

  const phoneCipher = resolveSensitiveValue(data.phone, existing.phone);
  const idNumberCipher = resolveSensitiveValue(data.id_number, existing.id_number);
  const addressCipher = resolveSensitiveValue(data.address, existing.address);

  await ensureUniqueCustomerFields({
    email: normalizedEmail,
    idNumberCipher: idNumberCipher,
    excludeId: Number(id)
  });

  await pool.query(
    'UPDATE customers SET full_name = ?, email = ?, phone = ?, id_number = ?, address = ? WHERE id = ?',
    [normalizedFullName, normalizedEmail, phoneCipher, idNumberCipher, addressCipher, id]
  );
  return { id: id };
}

async function remove(id) {
  const [result] = await pool.query('DELETE FROM customers WHERE id = ?', [id]);
  if (result.affectedRows === 0) {
    throw new Error('Khong tim thay khach hang');
  }
  return { id: Number(id) };
}

module.exports = { getAll, getById, create, update, remove };
