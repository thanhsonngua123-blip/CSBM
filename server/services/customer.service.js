const pool = require('../config/db');
const { encryptAES, decryptAES } = require('../utils/encryption');
const { maskPhone, maskIdNumber, maskEmail, maskAddress } = require('../utils/masking');

const AES_KEY = process.env.AES_SECRET_KEY;
const PROTECTED_CUSTOMER_FIELDS = ['email', 'phone', 'id_number', 'address'];
const PROTECTED_FIELD_LABELS = {
  email: 'Email',
  phone: 'So dien thoai',
  id_number: 'CCCD / CMND',
  address: 'Dia chi'
};
const INTEGRITY_PLACEHOLDER = 'DU LIEU BI SUA';

function normalizeText(value) {
  if (value === undefined || value === null) {
    return '';
  }

  return String(value).trim();
}

function normalizeEmail(value) {
  return normalizeText(value).toLowerCase();
}

function isValidEmailValue(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));
}

function isValidPhoneValue(value) {
  return /^0\d{9}$/.test(normalizeText(value));
}

function isValidCitizenIdValue(value) {
  return /^0\d{11}$/.test(normalizeText(value));
}

function isValidAddressValue(value) {
  return normalizeText(value).length >= 5;
}

function encryptValue(value) {
  const normalized = normalizeText(value);

  if (!normalized) {
    return null;
  }

  if (!AES_KEY) {
    return normalized;
  }

  return encryptAES(normalized, AES_KEY);
}

function decryptValue(value) {
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
    throw new Error('Du lieu nhay cam trong CSDL da bi sua hoac khong hop le');
  }
}

function isValidDecryptedValue(fieldName, value) {
  if (fieldName === 'email') {
    return isValidEmailValue(value);
  }

  if (fieldName === 'phone') {
    return isValidPhoneValue(value);
  }

  if (fieldName === 'id_number') {
    return isValidCitizenIdValue(value);
  }

  if (fieldName === 'address') {
    return isValidAddressValue(value);
  }

  return true;
}

function maskSensitiveDisplay(fieldName, value) {
  if (fieldName === 'email') {
    return maskEmail(value);
  }

  if (fieldName === 'phone') {
    return maskPhone(value);
  }

  if (fieldName === 'id_number') {
    return maskIdNumber(value);
  }

  if (fieldName === 'address') {
    return maskAddress(value);
  }

  return value;
}

function buildIntegrityIssue(fieldName) {
  return {
    field: fieldName,
    label: PROTECTED_FIELD_LABELS[fieldName] || fieldName,
    message: `${PROTECTED_FIELD_LABELS[fieldName] || fieldName} da bi thay doi trong CSDL`
  };
}

function inspectStoredSensitiveValue(fieldName, storedValue, role) {
  const normalizedStored = normalizeText(storedValue);

  if (!normalizedStored) {
    return {
      value: '',
      issue: null
    };
  }

  if (!AES_KEY) {
    return {
      value: role === 'staff' ? maskSensitiveDisplay(fieldName, normalizedStored) : normalizedStored,
      issue: null
    };
  }

  try {
    const decryptedValue = decryptAES(normalizedStored, AES_KEY);

    if (!isValidDecryptedValue(fieldName, decryptedValue)) {
      throw new Error('Gia tri sau giai ma khong hop le');
    }

    return {
      value: role === 'staff' ? maskSensitiveDisplay(fieldName, decryptedValue) : decryptedValue,
      issue: null
    };
  } catch (error) {
    return {
      value: INTEGRITY_PLACEHOLDER,
      issue: buildIntegrityIssue(fieldName)
    };
  }
}

function encryptFields(data) {
  return {
    full_name: data.full_name,
    email: encryptValue(data.email),
    phone: encryptValue(data.phone),
    id_number: encryptValue(data.id_number),
    address: encryptValue(data.address)
  };
}

function normalizePreserveSensitiveFields(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  const fields = [];

  for (let i = 0; i < value.length; i = i + 1) {
    const fieldName = normalizeText(value[i]);
    if (PROTECTED_CUSTOMER_FIELDS.includes(fieldName) && !fields.includes(fieldName)) {
      fields.push(fieldName);
    }
  }

  return fields;
}

function shouldPreserveField(preserveFields, fieldName) {
  return preserveFields.includes(fieldName);
}

function resolveSensitiveValue(fieldName, inputValue, existingCipherValue, preserveFields) {
  if (shouldPreserveField(preserveFields, fieldName)) {
    return existingCipherValue;
  }

  return encryptValue(inputValue);
}

async function ensureUniqueCustomerFields({ email, idNumber, excludeId }) {
  const normalizedEmail = normalizeEmail(email);
  const normalizedIdNumber = normalizeText(idNumber);

  if (!normalizedEmail && !normalizedIdNumber) {
    return;
  }

  let query = 'SELECT id, email, id_number FROM customers';
  const params = [];

  if (excludeId) {
    query = query + ' WHERE id <> ?';
    params.push(excludeId);
  }

  const [rows] = await pool.query(query, params);

  for (let i = 0; i < rows.length; i = i + 1) {
    const row = rows[i];
    const rowEmail = row.email ? normalizeEmail(decryptValue(row.email)) : '';
    const rowIdNumber = row.id_number ? normalizeText(decryptValue(row.id_number)) : '';

    if (normalizedEmail && rowEmail === normalizedEmail) {
      throw new Error('Email da ton tai');
    }

    if (normalizedIdNumber && rowIdNumber === normalizedIdNumber) {
      throw new Error('CCCD/CMND da ton tai');
    }
  }
}

function formatCustomerRow(row, role) {
  const emailResult = inspectStoredSensitiveValue('email', row.email, role);
  const phoneResult = inspectStoredSensitiveValue('phone', row.phone, role);
  const idNumberResult = inspectStoredSensitiveValue('id_number', row.id_number, role);
  const addressResult = inspectStoredSensitiveValue('address', row.address, role);
  const integrityIssues = [];
  const inspectedFields = [emailResult, phoneResult, idNumberResult, addressResult];

  for (let i = 0; i < inspectedFields.length; i = i + 1) {
    if (inspectedFields[i].issue) {
      integrityIssues.push(inspectedFields[i].issue);
    }
  }

  return {
    id: row.id,
    full_name: row.full_name,
    email: emailResult.value,
    phone: phoneResult.value,
    id_number: idNumberResult.value,
    address: addressResult.value,
    created_by: row.created_by,
    created_by_username: row.created_by_username || null,
    created_by_role: row.created_by_role || null,
    created_at: row.created_at,
    updated_at: row.updated_at,
    has_integrity_issue: integrityIssues.length > 0,
    integrity_issues: integrityIssues
  };
}

async function getAll(search, role, options = {}) {
  const paginate = options.paginate !== false;
  const currentPage = Number(options.page) > 0 ? Number(options.page) : 1;
  const pageSize = Number(options.limit) > 0 ? Number(options.limit) : 10;
  let countQuery = 'SELECT COUNT(*) AS total FROM customers';
  let query = `
    SELECT
      customers.*,
      users.username AS created_by_username,
      users.role AS created_by_role
    FROM customers
    INNER JOIN users ON users.id = customers.created_by
  `;
  const params = [];
  const countParams = [];

  if (search) {
    query = query + ' WHERE customers.full_name LIKE ?';
    countQuery = countQuery + ' WHERE full_name LIKE ?';
    params.push('%' + search + '%');
    countParams.push('%' + search + '%');
  }

  const [countRows] = await pool.query(countQuery, countParams);
  const total = countRows[0].total;
  const totalPages = paginate ? Math.max(Math.ceil(total / pageSize), 1) : 1;
  const safePage = paginate ? Math.min(currentPage, totalPages) : 1;

  query = query + ' ORDER BY customers.created_at ASC, customers.id ASC';

  if (paginate) {
    query = query + ' LIMIT ? OFFSET ?';
    params.push(pageSize, (safePage - 1) * pageSize);
  }

  const [rows] = await pool.query(query, params);
  const result = [];

  for (let i = 0; i < rows.length; i = i + 1) {
    result[i] = formatCustomerRow(rows[i], role);
  }

  if (!paginate) {
    return result;
  }

  return {
    data: result,
    pagination: {
      page: safePage,
      limit: pageSize,
      total,
      total_pages: totalPages
    }
  };
}

async function getById(id, role) {
  const [rows] = await pool.query(
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

  return formatCustomerRow(rows[0], role);
}

async function create(data, userId) {
  const normalizedData = {
    full_name: normalizeText(data.full_name),
    email: normalizeEmail(data.email),
    phone: normalizeText(data.phone),
    id_number: normalizeText(data.id_number),
    address: normalizeText(data.address)
  };

  const encrypted = encryptFields(normalizedData);

  await ensureUniqueCustomerFields({
    email: normalizedData.email,
    idNumber: normalizedData.id_number
  });

  const [result] = await pool.query(
    'INSERT INTO customers (full_name, email, phone, id_number, address, created_by) VALUES (?, ?, ?, ?, ?, ?)',
    [encrypted.full_name, encrypted.email, encrypted.phone, encrypted.id_number, encrypted.address, userId]
  );

  return { id: result.insertId };
}

async function update(id, data) {
  const [rows] = await pool.query('SELECT * FROM customers WHERE id = ?', [id]);

  if (rows.length === 0) {
    throw new Error('Khong tim thay khach hang');
  }

  const existing = rows[0];
  const preserveFields = normalizePreserveSensitiveFields(data.preserve_sensitive_fields);
  const normalizedFullName = normalizeText(data.full_name);
  const normalizedEmail = normalizeEmail(data.email);
  const normalizedIdNumber = normalizeText(data.id_number);

  const emailCipher = resolveSensitiveValue('email', normalizedEmail, existing.email, preserveFields);
  const phoneCipher = resolveSensitiveValue('phone', data.phone, existing.phone, preserveFields);
  const idNumberCipher = resolveSensitiveValue('id_number', normalizedIdNumber, existing.id_number, preserveFields);
  const addressCipher = resolveSensitiveValue('address', data.address, existing.address, preserveFields);

  await ensureUniqueCustomerFields({
    email: shouldPreserveField(preserveFields, 'email') ? '' : normalizedEmail,
    idNumber: shouldPreserveField(preserveFields, 'id_number') ? '' : normalizedIdNumber,
    excludeId: Number(id)
  });

  await pool.query(
    'UPDATE customers SET full_name = ?, email = ?, phone = ?, id_number = ?, address = ? WHERE id = ?',
    [normalizedFullName, emailCipher, phoneCipher, idNumberCipher, addressCipher, id]
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
