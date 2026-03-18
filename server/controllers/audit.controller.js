const auditService = require('../services/audit.service');

async function getAll(req, res) {
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
    res.status(500).json({ message: err.message });
  }
}

async function clearAll(req, res) {
  try {
    const result = await auditService.clearAll();
    res.json({ message: 'Đã xóa toàn bộ nhật ký hệ thống', ...result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { getAll, clearAll };
