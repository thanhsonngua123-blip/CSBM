function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Lỗi hệ thống';

  res.status(statusCode).json({
    message,
    ...(err.details || {})
  });
}

module.exports = errorHandler;
