const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const customerNoteController = require('../controllers/customer-note.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', customerController.getAll);

router.get('/export/excel', customerController.exportExcel);
router.post('/import/excel', customerController.importExcel);

router.get('/:id/notes', customerNoteController.getByCustomerId);

router.post('/:id/notes', customerNoteController.create);

router.get('/:id', customerController.getById);

router.post('/', customerController.create);

router.put('/:id', customerController.update);

router.delete('/:id', customerController.remove);

module.exports = router;
