const customerNoteService = require('../services/customer-note.service');
const auditService = require('../services/audit.service');

async function getByCustomerId(req, res) {
  try {
    const notes = await customerNoteService.getByCustomerId(Number(req.params.id), req.user.role);
    res.json(notes);
  } catch (err) {
    if (err.message === 'Khong tim thay khach hang') {
      return res.status(404).json({ message: err.message });
    }

    res.status(500).json({ message: err.message });
  }
}

async function create(req, res) {
  const content = typeof req.body.content === 'string' ? req.body.content.trim() : '';

  if (!content) {
    return res.status(400).json({ message: 'Noi dung ghi chu khong duoc de trong' });
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
      action: 'ADD_CUSTOMER_NOTE',
      entityType: 'customer_note',
      entityId: result.note.id,
      description: `${req.user.username} da them ghi chu cham soc cho khach hang "${result.customer_name}"`
    });

    res.status(201).json({
      message: 'Them ghi chu thanh cong',
      note: result.note
    });
  } catch (err) {
    if (err.message === 'Khong tim thay khach hang') {
      return res.status(404).json({ message: err.message });
    }

    if (err.message === 'Noi dung ghi chu khong duoc de trong') {
      return res.status(400).json({ message: err.message });
    }

    res.status(500).json({ message: err.message });
  }
}

module.exports = { getByCustomerId, create };
