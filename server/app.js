require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const notFound = require('./middleware/not-found');
const errorHandler = require('./middleware/error-handler');

const authRoutes = require('./routes/auth.routes');
const auditRoutes = require('./routes/audit.routes');
const customerRoutes = require('./routes/customer.routes');
const securityToolRoutes = require('./routes/security-tool.routes');

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '15mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/security-tools', securityToolRoutes);

app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    res.json({ status: 'OK', db: 'Connected', result: rows[0].result });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
