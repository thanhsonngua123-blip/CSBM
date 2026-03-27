require('dotenv').config();
const pool = require('../config/db');
const { encryptAES, isModernCiphertext } = require('../utils/encryption');

const AES_KEY = process.env.AES_SECRET_KEY;

function normalizeText(value) {
  if (value === undefined || value === null) {
    return '';
  }

  return String(value).trim();
}

function shouldEncryptValue(value) {
  const normalized = normalizeText(value);

  return normalized && !isModernCiphertext(normalized);
}

function reencryptValue(value) {
  const normalized = normalizeText(value);

  if (!normalized) {
    return null;
  }

  if (isModernCiphertext(normalized)) {
    return normalized;
  }

  return encryptAES(normalized, AES_KEY);
}

async function migrateCustomerRows() {
  const [rows] = await pool.query(
    'SELECT id, email, phone, id_number, address FROM customers ORDER BY id ASC'
  );

  let updatedRows = 0;
  let updatedFields = 0;

  for (let i = 0; i < rows.length; i = i + 1) {
    const row = rows[i];
    const assignments = [];
    const params = [];
    const fields = ['email', 'phone', 'id_number', 'address'];

    for (let j = 0; j < fields.length; j = j + 1) {
      const fieldName = fields[j];
      if (shouldEncryptValue(row[fieldName])) {
        assignments.push(`${fieldName} = ?`);
        params.push(reencryptValue(row[fieldName]));
        updatedFields = updatedFields + 1;
      }
    }

    if (assignments.length > 0) {
      params.push(row.id);
      await pool.query(`UPDATE customers SET ${assignments.join(', ')} WHERE id = ?`, params);
      updatedRows = updatedRows + 1;
    }
  }

  return { updatedRows, updatedFields };
}

async function migrateCustomerNotes() {
  const [rows] = await pool.query(
    'SELECT id, content FROM customer_notes ORDER BY id ASC'
  );

  let updatedRows = 0;

  for (let i = 0; i < rows.length; i = i + 1) {
    const row = rows[i];
    if (!shouldEncryptValue(row.content)) {
      continue;
    }

    await pool.query(
      'UPDATE customer_notes SET content = ? WHERE id = ?',
      [reencryptValue(row.content), row.id]
    );
    updatedRows = updatedRows + 1;
  }

  return { updatedRows };
}

async function run() {
  if (!AES_KEY) {
    throw new Error('AES_SECRET_KEY is required to migrate sensitive data');
  }

  const customerSummary = await migrateCustomerRows();
  const noteSummary = await migrateCustomerNotes();

  console.log('Sensitive data migration completed.');
  console.log(
    `Customers updated: ${customerSummary.updatedRows} rows, ${customerSummary.updatedFields} fields.`
  );
  console.log(`Customer notes updated: ${noteSummary.updatedRows} rows.`);
}

run()
  .catch((error) => {
    console.error('Sensitive data migration failed.');
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
