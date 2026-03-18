const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

async function login(username, password) {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE username = ?',
    [username]
  );

  if (rows.length === 0) {
    throw new Error('Tên đăng nhập không tồn tại');
  }

  const user = rows[0];
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new Error('Mật khẩu không đúng');
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role
    }
  };
}

module.exports = { login };
