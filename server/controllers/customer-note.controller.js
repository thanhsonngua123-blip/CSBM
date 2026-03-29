const customerNoteService = require('../services/customer-note.service');
const auditService = require('../services/audit.service');
const HttpError = require('../utils/http-error');
const { AUDIT_ACTIONS } = require('../constants/audit.constants');

async function getByCustomerId(req, res, next) {
  try {
    const notes = await customerNoteService.getByCustomerId(Number(req.params.id), req.user.role);
    res.json(notes);
  } catch (err) {
    if (err.message === 'Không tìm thấy khách hàng') {
      return next(new HttpError(404, err.message));
    }

    next(err);
  }
}

async function create(req, res, next) {
  const content = typeof req.body.content === 'string' ? req.body.content.trim() : '';

  if (!content) {
    return next(new HttpError(400, 'Nội dung ghi chú không được để trống'));
  }

  try {
    const result = await customerNoteService.create({
      customerId: Number(req.params.id),
      userId: req.user.id,
      content,
      role: req.user.role
    });

    await auditService.createLog({
      userId: req.user.id,
      action: AUDIT_ACTIONS.ADD_CUSTOMER_NOTE,
      entityType: 'customer_note',
      entityId: result.note.id,
      description: `${req.user.username} đã thêm ghi chú chăm sóc cho khách hàng "${result.customer_name}"`
    });

    res.status(201).json({
      message: 'Thêm ghi chú thành công',
      note: result.note
    });
  } catch (err) {
    if (err.message === 'Không tìm thấy khách hàng') {
      return next(new HttpError(404, err.message));
    }

    if (err.message === 'Nội dung ghi chú không được để trống') {
      return next(new HttpError(400, err.message));
    }

    next(err);
  }
}

module.exports = { getByCustomerId, create };
