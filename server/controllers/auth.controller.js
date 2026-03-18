const authService = require('../services/auth.service');

async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
    }

    const result = await authService.login(username, password);
    res.json(result);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
}

// Lấy thông tin user hiện tại từ token
async function getMe(req, res) {
  res.json({ user: req.user });
}

module.exports = { login, getMe };
