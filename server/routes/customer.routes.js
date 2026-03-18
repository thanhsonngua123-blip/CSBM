const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const customerNoteController = require('../controllers/customer-note.controller');
const { authenticate } = require('../middleware/auth');

// Tất cả route customer đều cần đăng nhập
router.use(authenticate);

// GET /api/customers?search=...
router.get('/', customerController.getAll);

// GET /api/customers/export/excel?search=...
router.get('/export/excel', customerController.exportExcel);

// GET /api/customers/:id/notes
router.get('/:id/notes', customerNoteController.getByCustomerId);

// POST /api/customers/:id/notes
router.post('/:id/notes', customerNoteController.create);

// GET /api/customers/:id
router.get('/:id', customerController.getById);

// POST /api/customers
router.post('/', customerController.create);

// PUT /api/customers/:id
router.put('/:id', customerController.update);

// DELETE /api/customers/:id
router.delete('/:id', customerController.remove);

module.exports = router;
