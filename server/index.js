require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth.routes');
const auditRoutes = require('./routes/audit.routes');
const customerRoutes = require('./routes/customer.routes');
const securityToolRoutes = require('./routes/security-tool.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/security-tools', securityToolRoutes);

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    res.json({ status: 'OK', db: 'Connected', result: rows[0].result });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
