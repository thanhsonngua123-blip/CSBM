const customerService = require('../services/customer.service');
const auditService = require('../services/audit.service');
const customerImportService = require('../services/customer-import.service');
const customerValidator = require('../validators/customer.validator');
const HttpError = require('../utils/http-error');
const { AUDIT_ACTIONS } = require('../constants/audit.constants');
const { PROTECTED_CUSTOMER_FIELDS } = require('../constants/customer.constants');

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizePreserveSensitiveFields(value) {
  if (!Array.isArray(value)) return [];

  const fields = [];

  for (let i = 0; i < value.length; i = i + 1) {
    const fieldName = normalizeText(value[i]);
    if (PROTECTED_CUSTOMER_FIELDS.includes(fieldName) && !fields.includes(fieldName)) {
      fields.push(fieldName);
    }
  }

  return fields;
}

function isDataTooLongError(error) {
  return error && (error.code === 'ER_DATA_TOO_LONG' || error.errno === 1406);
}

function classifyServiceError(err) {
  if (isDataTooLongError(err)) {
    return new HttpError(500, 'Kích thước cột CSDL chưa đủ cho dữ liệu mã hóa. Hãy cập nhật schema customers.');
  }

  if (err.message === 'Email đã tồn tại' || err.message === 'CCCD/CMND đã tồn tại') {
    return new HttpError(400, err.message);
  }

  if (err.message === 'Không tìm thấy khách hàng') {
    return new HttpError(404, err.message);
  }

  return new HttpError(500, err.message);
}

async function getAll(req, res, next) {
  try {
    const result = await customerService.getAll(req.query.search || '', req.user.role, {
      page: req.query.page,
      limit: req.query.limit
    });

    await auditService.recordIntegrityAlerts(req.user, result.data);
    res.json(result);
  } catch (err) {
    next(classifyServiceError(err));
  }
}

async function getById(req, res, next) {
  try {
    const customer = await customerService.getById(req.params.id, req.user.role);

    await auditService.recordIntegrityAlerts(req.user, [customer]);
    res.json(customer);
  } catch (err) {
    next(classifyServiceError(err));
  }
}

async function create(req, res, next) {
  try {
    const missing = customerValidator.validateRequiredCustomerFields(req.body);

    if (missing.length > 0) {
      throw new HttpError(400, 'Vui lòng nhập đầy đủ thông tin bắt buộc (*)', { missing_fields: missing });
    }

    const formatErrors = customerValidator.validateCustomerFormats(req.body, { preserveSensitiveFields: [] });

    if (Object.keys(formatErrors).length > 0) {
      throw new HttpError(400, formatErrors.email || formatErrors.phone || formatErrors.id_number || formatErrors.address, { field_errors: formatErrors });
    }

    const result = await customerService.create(req.body, req.user.id);

    await auditService.createLog({
      userId: req.user.id,
      action: AUDIT_ACTIONS.CREATE_CUSTOMER,
      entityType: 'customer',
      entityId: result.id,
      description: `${req.user.username} đã thêm khách hàng "${req.body.full_name}"`
    });

    res.status(201).json({ message: 'Thêm khách hàng thành công', ...result });
  } catch (err) {
    if (err instanceof HttpError) return next(err);
    next(classifyServiceError(err));
  }
}

async function update(req, res, next) {
  try {
    const missing = customerValidator.validateRequiredCustomerFields(req.body);

    if (missing.length > 0) {
      throw new HttpError(400, 'Vui lòng nhập đầy đủ thông tin bắt buộc', { missing_fields: missing });
    }

    const preserveSensitiveFields = req.user.role === 'staff'
      ? normalizePreserveSensitiveFields(req.body.preserve_sensitive_fields)
      : [];

    req.body.preserve_sensitive_fields = preserveSensitiveFields;

    const formatErrors = customerValidator.validateCustomerFormats(req.body, { preserveSensitiveFields });

    if (Object.keys(formatErrors).length > 0) {
      throw new HttpError(400, formatErrors.email || formatErrors.phone || formatErrors.id_number || formatErrors.address, { field_errors: formatErrors });
    }

    const result = await customerService.update(req.params.id, req.body);

    await auditService.createLog({
      userId: req.user.id,
      action: AUDIT_ACTIONS.UPDATE_CUSTOMER,
      entityType: 'customer',
      entityId: Number(req.params.id),
      description: `${req.user.username} đã cập nhật khách hàng "${req.body.full_name}"`
    });

    res.json({ message: 'Cập nhật thành công', ...result });
  } catch (err) {
    if (err instanceof HttpError) return next(err);
    next(classifyServiceError(err));
  }
}

async function remove(req, res, next) {
  try {
    const customer = await customerService.getById(req.params.id, 'admin');
    const result = await customerService.remove(req.params.id);

    await auditService.createLog({
      userId: req.user.id,
      action: AUDIT_ACTIONS.DELETE_CUSTOMER,
      entityType: 'customer',
      entityId: Number(req.params.id),
      description: `${req.user.username} đã xóa khách hàng "${customer.full_name}"`
    });

    res.json({ message: 'Xóa khách hàng thành công', ...result });
  } catch (err) {
    next(classifyServiceError(err));
  }
}

async function exportExcel(req, res, next) {
  try {
    const customers = await customerService.getAll(req.query.search || '', req.user.role, { paginate: false });
    const workbook = customerImportService.buildCustomerExportWorkbook(customers, req.user.role);

    const exportDate = new Date().toISOString().slice(0, 10);
    const fileName = `danh-sach-khach-hang-${req.user.role}-${exportDate}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    next(classifyServiceError(err));
  }
}

async function importExcel(req, res, next) {
  try {
    let worksheet, headerIndexes;

    try {
      ({ worksheet, headerIndexes } = await customerImportService.parseExcelFile(
        req.body.file_base64,
        req.body.file_name
      ));
    } catch (parseErr) {
      await auditService.recordImportError(req.user, { reason: parseErr.message });

      const body = parseErr.missingHeaders
        ? { message: parseErr.message, missing_headers: parseErr.missingHeaders }
        : { message: parseErr.message };

      return res.status(400).json(body);
    }

    const { totalRows, importedCount, importedIds, errors } =
      await customerImportService.importRowsFromWorksheet(worksheet, headerIndexes, req.user.id);

    const failedCount = errors.length;

    if (importedCount > 0) {
      await auditService.createLog({
        userId: req.user.id,
        action: AUDIT_ACTIONS.IMPORT_CUSTOMERS,
        entityType: 'customer',
        entityId: null,
        description: `${req.user.username} đã nhập Excel ${importedCount} khách hàng${failedCount > 0 ? `, lỗi ${failedCount} dòng` : ''}`
      });
    }

    if (failedCount > 0) {
      await auditService.recordImportError(req.user, {
        reason: importedCount > 0 ? 'nhập Excel một phần' : 'không có dòng nào được nhập',
        totalRows,
        importedCount,
        failedCount,
        errors
      });
    }

    let message = 'Nhập Excel thành công';
    if (importedCount > 0 && failedCount > 0) message = 'Đã nhập một phần dữ liệu từ file Excel';
    else if (importedCount === 0) message = 'Không có dòng nào được nhập từ file Excel';

    res.json({ message, total_rows: totalRows, imported_count: importedCount, failed_count: failedCount, imported_ids: importedIds, errors });
  } catch (err) {
    await auditService.recordImportError(req.user, { reason: err.message || 'Lỗi không xác định khi nhập file Excel' });
    next(new HttpError(500, err.message || 'Không thể nhập file Excel'));
  }
}

module.exports = { getAll, getById, create, update, remove, exportExcel, importExcel };
