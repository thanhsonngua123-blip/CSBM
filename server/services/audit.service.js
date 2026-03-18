const pool = require('../config/db');

async function createLog({ userId, action, entityType, entityId, description }) {
  await pool.query(
    'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, description) VALUES (?, ?, ?, ?, ?)',
    [userId, action, entityType, entityId || null, description]
  );
}

async function getAll({ page = 1, limit = 10, role, action, sort = 'desc' }) {
  const currentPage = Number(page) > 0 ? Number(page) : 1;
  const pageSize = Number(limit) > 0 ? Number(limit) : 10;
  const offset = (currentPage - 1) * pageSize;
  const filters = [];
  const params = [];

  if (role) {
    filters.push('users.role = ?');
    params.push(role);
  }

  if (action) {
    filters.push('audit_logs.action = ?');
    params.push(action);
  }

  const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';
  const sortDirection = sort === 'asc' ? 'ASC' : 'DESC';

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM audit_logs
     INNER JOIN users ON users.id = audit_logs.user_id
     ${whereClause}`,
    params
  );

  const [rows] = await pool.query(
    `SELECT 
      audit_logs.id,
      audit_logs.action,
      audit_logs.entity_type,
      audit_logs.entity_id,
      audit_logs.description,
      audit_logs.created_at,
      users.id AS user_id,
      users.username,
      users.role
    FROM audit_logs
    INNER JOIN users ON users.id = audit_logs.user_id
    ${whereClause}
    ORDER BY audit_logs.created_at ${sortDirection}, audit_logs.id ${sortDirection}
    LIMIT ? OFFSET ?`,
    [...params, pageSize, offset]
  );

  return {
    data: rows,
    pagination: {
      page: currentPage,
      limit: pageSize,
      total: countRows[0].total,
      total_pages: Math.ceil(countRows[0].total / pageSize) || 1
    }
  };
}

async function clearAll() {
  const [result] = await pool.query('DELETE FROM audit_logs');
  return { deleted_count: result.affectedRows };
}

module.exports = { createLog, getAll, clearAll };
