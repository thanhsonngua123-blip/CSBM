const pool = require('../config/db');
const { AUDIT_ACTIONS } = require('../constants/audit.constants');

async function createLog({ userId, action, entityType, entityId, description }) {
  await pool.query(
    'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, description) VALUES (?, ?, ?, ?, ?)',
    [userId, action, entityType, entityId || null, description]
  );
}

async function createLogIfMissing({ userId, action, entityType, entityId, description }) {
  const [rows] = await pool.query(
    `SELECT id
     FROM audit_logs
     WHERE action = ?
       AND entity_type = ?
       AND entity_id <=> ?
       AND description = ?
     LIMIT 1`,
    [action, entityType, entityId || null, description]
  );

  if (rows.length > 0) {
    return { created: false, id: rows[0].id };
  }

  await createLog({ userId, action, entityType, entityId, description });
  return { created: true };
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

function formatAuditTimestamp(value) {
  if (!value) return 'không rõ';
  return new Date(value).toISOString();
}

function buildIntegrityAlertDescription(customer) {
  const labels = Array.isArray(customer.integrity_issues)
    ? customer.integrity_issues.map(function (issue) { return issue.label; }).join(', ')
    : '';

  return `Phát hiện dữ liệu khách hàng "${customer.full_name}" có dấu hiệu bị sửa trực tiếp trong CSDL ở các trường: ${labels}. Mốc updated_at: ${formatAuditTimestamp(customer.updated_at)}`;
}

function buildImportErrorDescription(user, details) {
  const segments = [];

  if (details.reason) segments.push(details.reason);
  if (typeof details.failedCount === 'number') segments.push(`số dòng lỗi: ${details.failedCount}`);
  if (typeof details.totalRows === 'number') segments.push(`tổng dòng xử lý: ${details.totalRows}`);
  if (typeof details.importedCount === 'number') segments.push(`thành công: ${details.importedCount}`);

  if (Array.isArray(details.errors) && details.errors.length > 0) {
    const previewErrors = details.errors.slice(0, 3).map(function (e) {
      return `dòng ${e.row}: ${e.message}`;
    });
    segments.push(`chi tiết: ${previewErrors.join(' | ')}`);
  }

  return `${user.username} gặp lỗi khi nhập Excel khách hàng. ${segments.join('. ')}`;
}

async function recordImportError(user, details) {
  await createLog({
    userId: user.id,
    action: AUDIT_ACTIONS.IMPORT_CUSTOMERS_ERROR,
    entityType: 'customer',
    entityId: null,
    description: buildImportErrorDescription(user, details)
  });
}

async function recordIntegrityAlerts(user, customers) {
  for (let i = 0; i < customers.length; i = i + 1) {
    const customer = customers[i];

    if (!customer || !customer.has_integrity_issue) continue;

    await createLogIfMissing({
      userId: user.id,
      action: AUDIT_ACTIONS.DETECT_TAMPERED_CUSTOMER_DATA,
      entityType: 'customer',
      entityId: customer.id,
      description: buildIntegrityAlertDescription(customer)
    });
  }
}

module.exports = { createLog, createLogIfMissing, getAll, clearAll, recordImportError, recordIntegrityAlerts };
