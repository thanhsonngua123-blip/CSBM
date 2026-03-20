const jwt = require('jsonwebtoken');

const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'auth_token';

function parseCookies(cookieHeader) {
  const cookies = {};

  if (!cookieHeader) {
    return cookies;
  }

  const parts = cookieHeader.split(';');

  for (let i = 0; i < parts.length; i = i + 1) {
    const segment = parts[i];
    const separatorIndex = segment.indexOf('=');

    if (separatorIndex <= 0) {
      continue;
    }

    const name = segment.slice(0, separatorIndex).trim();
    const value = segment.slice(separatorIndex + 1).trim();

    if (!name) {
      continue;
    }

    cookies[name] = decodeURIComponent(value);
  }

  return cookies;
}

function getTokenFromRequest(req) {
  const cookies = parseCookies(req.headers.cookie);

  if (cookies[AUTH_COOKIE_NAME]) {
    return cookies[AUTH_COOKIE_NAME];
  }

  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  return '';
}

function authenticate(req, res, next) {
  const token = getTokenFromRequest(req);

  if (!token) {
    return res.status(401).json({ message: 'Chưa đăng nhập' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token không hợp lệ' });
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    next();
  };
}

module.exports = { authenticate, authorize };
