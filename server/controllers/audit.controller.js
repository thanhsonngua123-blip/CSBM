const auditService = require('../services/audit.service');

async function getAll(req, res, next) {
  try {
    const result = await auditService.getAll({
      page: req.query.page,
      limit: req.query.limit,
      role: req.query.role,
      action: req.query.action,
      sort: req.query.sort
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function clearAll(req, res, next) {
  try {
    const result = await auditService.clearAll();
    res.json({ message: 'Đã xóa toàn bộ nhật ký hệ thống', ...result });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, clearAll };
