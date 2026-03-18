const express = require('express');
const router = express.Router();
const securityToolController = require('../controllers/security-tool.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('admin'));
router.post('/preview', securityToolController.preview);

module.exports = router;
