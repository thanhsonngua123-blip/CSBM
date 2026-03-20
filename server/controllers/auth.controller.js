const authService = require('../services/auth.service');

const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'auth_token';
const AUTH_COOKIE_MAX_AGE_MS = 8 * 60 * 60 * 1000;

function buildAuthCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: AUTH_COOKIE_MAX_AGE_MS,
    path: '/'
  };
}

function buildClearCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/'
  };
}

async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
    }

    const result = await authService.login(username, password);
    res.cookie(AUTH_COOKIE_NAME, result.token, buildAuthCookieOptions());
    res.json({ user: result.user });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
}

async function logout(req, res) {
  res.clearCookie(AUTH_COOKIE_NAME, buildClearCookieOptions());
  res.json({ message: 'Đăng xuất thành công' });
}

async function getMe(req, res) {
  res.json({ user: req.user });
}

module.exports = { login, logout, getMe };
