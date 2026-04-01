const authService = require('../services/auth.service');
const HttpError = require('../utils/http-error');

const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'auth_token';
const AUTH_COOKIE_MAX_AGE_MS = 8 * 60 * 60 * 1000;
// Hàm xây dựng tùy chọn cookie cho việc lưu token đăng nhập
function buildAuthCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: AUTH_COOKIE_MAX_AGE_MS,
    path: '/'
  };
}
// Hàm xây dựng tùy chọn cookie để xóa cookie khi đăng xuất
function buildClearCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/'
  };
}
// Hàm xử lý đăng nhập
async function login(req, res, next) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      throw new HttpError(400, 'Vui lòng nhập đầy đủ thông tin');
    }

    const result = await authService.login(username, password);
    res.cookie(AUTH_COOKIE_NAME, result.token, buildAuthCookieOptions());
    res.json({ user: result.user });
  } catch (err) {
    if (err instanceof HttpError) return next(err);
    next(new HttpError(401, err.message));
  }
}
// Hàm xử lý đăng xuất
async function logout(req, res) {
  res.clearCookie(AUTH_COOKIE_NAME, buildClearCookieOptions());
  res.json({ message: 'Đăng xuất thành công' });
}

async function getMe(req, res) {
  res.json({ user: req.user });
}

module.exports = { login, logout, getMe };
