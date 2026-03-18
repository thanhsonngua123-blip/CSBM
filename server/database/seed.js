// Script seed data: tạo 1 admin và 1 staff
// Chạy: node database/seed.js

require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

async function seed() {
  try {
    const adminPassword = await bcrypt.hash('admin123', 10);
    const staffPassword = await bcrypt.hash('staff123', 10);

    await pool.query(
      'INSERT IGNORE INTO users (username, password_hash, role) VALUES (?, ?, ?)',
      ['admin', adminPassword, 'admin']
    );

    await pool.query(
      'INSERT IGNORE INTO users (username, password_hash, role) VALUES (?, ?, ?)',
      ['staff', staffPassword, 'staff']
    );

    console.log('Seed data thành công!');
    console.log('  admin / admin123');
    console.log('  staff / staff123');
    process.exit(0);
  } catch (err) {
    console.error('Lỗi seed:', err.message);
    process.exit(1);
  }
}

seed();
