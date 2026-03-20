const ExcelJS = require('exceljs');
const customerService = require('../services/customer.service');
const auditService = require('../services/audit.service');

function isBlank(value) {
  return value === undefined || value === null || String(value).trim() === '';
}

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizePreserveSensitiveFields(value) {
  const allowedFields = ['email', 'phone', 'id_number', 'address'];

  if (!Array.isArray(value)) {
    return [];
  }

  const fields = [];

  for (let i = 0; i < value.length; i = i + 1) {
    const fieldName = normalizeText(value[i]);
    if (allowedFields.includes(fieldName) && !fields.includes(fieldName)) {
      fields.push(fieldName);
    }
  }

  return fields;
}

function shouldPreserveField(preserveFields, fieldName) {
  return preserveFields.includes(fieldName);
}

function isValidEmail(value) {
  const normalized = normalizeText(value);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
}

function isValidPhone(value) {
  const normalized = normalizeText(value);
  return /^0\d{9}$/.test(normalized);
}

function isValidCitizenId(value) {
  const normalized = normalizeText(value);
  return /^0\d{11}$/.test(normalized);
}

function validateRequiredCustomerFields(data) {
  const requiredFields = ['full_name', 'email', 'phone', 'id_number', 'address'];
  const missing = [];

  for (let i = 0; i < requiredFields.length; i = i + 1) {
    const field = requiredFields[i];
    if (isBlank(data[field])) {
      missing.push(field);
    }
  }

  return missing;
}

function validateCustomerFormats(data, options = {}) {
  const errors = {};
  const preserveFields = options.preserveSensitiveFields || [];

  if (!shouldPreserveField(preserveFields, 'email') && !isValidEmail(data.email)) {
    errors.email = 'Email khong hop le';
  }

  if (!shouldPreserveField(preserveFields, 'phone') && !isValidPhone(data.phone)) {
    errors.phone = 'So dien thoai phai gom 10 so va bat dau bang so 0';
  }

  if (!shouldPreserveField(preserveFields, 'id_number') && !isValidCitizenId(data.id_number)) {
    errors.id_number = 'CCCD phai gom 12 so va bat dau bang so 0';
  }

  if (!shouldPreserveField(preserveFields, 'address') && normalizeText(data.address).length < 5) {
    errors.address = 'Dia chi phai co it nhat 5 ky tu';
  }

  return errors;
}

function isDataTooLongError(error) {
  return error && (error.code === 'ER_DATA_TOO_LONG' || error.errno === 1406);
}

function formatAuditTimestamp(value) {
  if (!value) {
    return 'khong ro';
  }

  return new Date(value).toISOString();
}

function buildIntegrityAlertDescription(customer) {
  const labels = Array.isArray(customer.integrity_issues)
    ? customer.integrity_issues.map((issue) => issue.label).join(', ')
    : '';

  return `Phat hien du lieu khach hang "${customer.full_name}" co dau hieu bi sua truc tiep trong CSDL o cac truong: ${labels}. Moc updated_at: ${formatAuditTimestamp(customer.updated_at)}`;
}

function buildImportErrorDescription(user, details) {
  const segments = [];

  if (details.reason) {
    segments.push(details.reason);
  }

  if (typeof details.failedCount === 'number') {
    segments.push(`so dong loi: ${details.failedCount}`);
  }

  if (typeof details.totalRows === 'number') {
    segments.push(`tong dong xu ly: ${details.totalRows}`);
  }

  if (typeof details.importedCount === 'number') {
    segments.push(`thanh cong: ${details.importedCount}`);
  }

  if (Array.isArray(details.errors) && details.errors.length > 0) {
    const previewErrors = details.errors.slice(0, 3).map((error) => `dong ${error.row}: ${error.message}`);
    segments.push(`chi tiet: ${previewErrors.join(' | ')}`);
  }

  return `${user.username} gap loi khi nhap Excel khach hang. ${segments.join('. ')}`;
}

async function recordImportError(user, details) {
  await auditService.createLog({
    userId: user.id,
    action: 'IMPORT_CUSTOMERS_ERROR',
    entityType: 'customer',
    entityId: null,
    description: buildImportErrorDescription(user, details)
  });
}

async function recordIntegrityAlerts(user, customers) {
  for (let i = 0; i < customers.length; i = i + 1) {
    const customer = customers[i];

    if (!customer || !customer.has_integrity_issue) {
      continue;
    }

    await auditService.createLogIfMissing({
      userId: user.id,
      action: 'DETECT_TAMPERED_CUSTOMER_DATA',
      entityType: 'customer',
      entityId: customer.id,
      description: buildIntegrityAlertDescription(customer)
    });
  }
}

function stripDiacritics(value) {
  return normalizeText(value)
    .replace(/Đ/g, 'D')
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function normalizeImportHeader(value) {
  return stripDiacritics(value)
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/[^\w\s/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function mapImportField(headerText) {
  const normalized = normalizeImportHeader(headerText);

  if (!normalized) {
    return '';
  }

  if (
    normalized === 'ho ten' ||
    normalized === 'ten khach hang' ||
    normalized === 'full name' ||
    normalized === 'full_name'
  ) {
    return 'full_name';
  }

  if (normalized === 'email') {
    return 'email';
  }

  if (
    normalized === 'so dien thoai' ||
    normalized === 'dien thoai' ||
    normalized === 'phone' ||
    normalized === 'phone number'
  ) {
    return 'phone';
  }

  if (
    normalized === 'cccd / cmnd' ||
    normalized === 'cccd/cmnd' ||
    normalized === 'cccd' ||
    normalized === 'cmnd' ||
    normalized === 'id number' ||
    normalized === 'id_number'
  ) {
    return 'id_number';
  }

  if (normalized === 'dia chi' || normalized === 'address') {
    return 'address';
  }

  return '';
}

function extractWorksheetHeaders(worksheet) {
  const headerRow = worksheet.getRow(1);
  const headerIndexes = {};

  for (let columnIndex = 1; columnIndex <= headerRow.cellCount; columnIndex = columnIndex + 1) {
    const fieldName = mapImportField(headerRow.getCell(columnIndex).text);

    if (fieldName && !headerIndexes[fieldName]) {
      headerIndexes[fieldName] = columnIndex;
    }
  }

  return headerIndexes;
}

function getImportedCellText(row, columnIndex) {
  if (!columnIndex) {
    return '';
  }

  const cell = row.getCell(columnIndex);
  return normalizeText(cell.text || cell.value);
}

function buildImportedCustomer(row, headerIndexes) {
  return {
    full_name: getImportedCellText(row, headerIndexes.full_name),
    email: getImportedCellText(row, headerIndexes.email),
    phone: getImportedCellText(row, headerIndexes.phone),
    id_number: getImportedCellText(row, headerIndexes.id_number),
    address: getImportedCellText(row, headerIndexes.address)
  };
}

function isEmptyImportedCustomer(data) {
  return (
    !normalizeText(data.full_name) &&
    !normalizeText(data.email) &&
    !normalizeText(data.phone) &&
    !normalizeText(data.id_number) &&
    !normalizeText(data.address)
  );
}

function decodeExcelBase64(fileBase64) {
  const normalized = normalizeText(fileBase64);

  if (!normalized) {
    throw new Error('Vui long chon file Excel hop le');
  }

  const matched = normalized.match(/^data:.+;base64,(.+)$/);
  const base64Content = matched ? matched[1] : normalized;

  return Buffer.from(base64Content, 'base64');
}

async function getAll(req, res) {
  try {
    const search = req.query.search || '';
    const role = req.user.role;
    const result = await customerService.getAll(search, role, {
      page: req.query.page,
      limit: req.query.limit
    });
    await recordIntegrityAlerts(req.user, result.data);
    res.json(result);
  } catch (err) {
    if (isDataTooLongError(err)) {
      return res.status(500).json({
        message: 'Kich thuoc cot CSDL chua du cho du lieu ma hoa. Hay cap nhat schema customers.'
      });
    }

    if (err.message === 'Email da ton tai' || err.message === 'CCCD/CMND da ton tai') {
      return res.status(400).json({ message: err.message });
    }

    res.status(500).json({ message: err.message });
  }
}

function formatCreatedBy(customer) {
  if (customer.created_by_username && customer.created_by_role) {
    return `${customer.created_by_username} (${customer.created_by_role})`;
  }

  if (customer.created_by_username) {
    return customer.created_by_username;
  }

  return customer.created_by ? `User ID ${customer.created_by}` : '';
}

function formatDateTime(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(date);
}

async function exportExcel(req, res) {
  try {
    const search = req.query.search || '';
    const role = req.user.role;
    const customers = await customerService.getAll(search, role, { paginate: false });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Danh sach khach hang');

    worksheet.columns = [
      { header: 'STT', key: 'index', width: 8 },
      { header: 'Ho ten', key: 'full_name', width: 28 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'So dien thoai', key: 'phone', width: 18 },
      { header: 'CCCD / CMND', key: 'id_number', width: 22 },
      { header: 'Dia chi', key: 'address', width: 40 },
      { header: 'Tao boi', key: 'created_by_label', width: 24 },
      { header: 'Ngay tao', key: 'created_at_label', width: 24 }
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    customers.forEach((customer, index) => {
      worksheet.addRow({
        index: index + 1,
        full_name: customer.full_name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        id_number: customer.id_number || '',
        address: customer.address || '',
        created_by_label: formatCreatedBy(customer),
        created_at_label: formatDateTime(customer.created_at)
      });
    });

    worksheet.eachRow((row, rowNumber) => {
      row.alignment = { vertical: 'middle', wrapText: true };
      if (rowNumber > 1) {
        row.getCell('D').numFmt = '@';
        row.getCell('E').numFmt = '@';
      }
    });

    const exportDate = new Date().toISOString().slice(0, 10);
    const fileName = `danh-sach-khach-hang-${role}-${exportDate}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function importExcel(req, res) {
  try {
    const fileName = normalizeText(req.body.file_name).toLowerCase();

    if (fileName && !fileName.endsWith('.xlsx')) {
      await recordImportError(req.user, {
        reason: 'file khong dung dinh dang .xlsx'
      });
      return res.status(400).json({ message: 'Chi ho tro file Excel .xlsx' });
    }

    const buffer = decodeExcelBase64(req.body.file_base64);
    const workbook = new ExcelJS.Workbook();

    try {
      await workbook.xlsx.load(buffer);
    } catch (loadError) {
      await recordImportError(req.user, {
        reason: 'khong the doc noi dung file Excel'
      });
      return res.status(400).json({ message: 'Khong the doc file Excel' });
    }

    const worksheet = workbook.worksheets[0];

    if (!worksheet) {
      await recordImportError(req.user, {
        reason: 'file Excel khong co sheet hop le'
      });
      return res.status(400).json({ message: 'File Excel khong co du lieu hop le' });
    }

    const headerIndexes = extractWorksheetHeaders(worksheet);
    const requiredFields = ['full_name', 'email', 'phone', 'id_number', 'address'];
    const missingHeaders = [];

    for (let i = 0; i < requiredFields.length; i = i + 1) {
      const field = requiredFields[i];
      if (!headerIndexes[field]) {
        missingHeaders.push(field);
      }
    }

    if (missingHeaders.length > 0) {
      await recordImportError(req.user, {
        reason: `thieu cot bat buoc: ${missingHeaders.join(', ')}`
      });
      return res.status(400).json({
        message: 'File Excel thieu cot bat buoc',
        missing_headers: missingHeaders
      });
    }

    let totalRows = 0;
    let importedCount = 0;
    const importedIds = [];
    const errors = [];

    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber = rowNumber + 1) {
      const row = worksheet.getRow(rowNumber);
      const customerData = buildImportedCustomer(row, headerIndexes);

      if (isEmptyImportedCustomer(customerData)) {
        continue;
      }

      totalRows = totalRows + 1;

      const missingFields = validateRequiredCustomerFields(customerData);

      if (missingFields.length > 0) {
        errors.push({
          row: rowNumber,
          message: 'Vui long nhap day du thong tin bat buoc (*)',
          missing_fields: missingFields
        });
        continue;
      }

      const formatErrors = validateCustomerFormats(customerData, { preserveSensitiveFields: [] });

      if (Object.keys(formatErrors).length > 0) {
        errors.push({
          row: rowNumber,
          message:
            formatErrors.email ||
            formatErrors.phone ||
            formatErrors.id_number ||
            formatErrors.address,
          field_errors: formatErrors
        });
        continue;
      }

      try {
        const result = await customerService.create(customerData, req.user.id);
        importedCount = importedCount + 1;
        importedIds.push(result.id);
      } catch (err) {
        errors.push({
          row: rowNumber,
          message: err.message || 'Khong the nhap dong du lieu nay'
        });
      }
    }

    if (importedCount > 0) {
      await auditService.createLog({
        userId: req.user.id,
        action: 'IMPORT_CUSTOMERS',
        entityType: 'customer',
        entityId: null,
        description: `${req.user.username} da nhap Excel ${importedCount} khach hang${errors.length > 0 ? `, loi ${errors.length} dong` : ''}`
      });
    }

    const failedCount = errors.length;

    if (failedCount > 0) {
      await recordImportError(req.user, {
        reason: importedCount > 0 ? 'nhap Excel mot phan' : 'khong co dong nao duoc nhap',
        totalRows,
        importedCount,
        failedCount,
        errors
      });
    }

    let message = 'Nhap Excel thanh cong';

    if (importedCount > 0 && failedCount > 0) {
      message = 'Da nhap mot phan du lieu tu Excel';
    } else if (importedCount === 0) {
      message = 'Khong co dong nao duoc nhap';
    }

    res.json({
      message,
      total_rows: totalRows,
      imported_count: importedCount,
      failed_count: failedCount,
      imported_ids: importedIds,
      errors
    });
  } catch (err) {
    if (err.message === 'Vui long chon file Excel hop le') {
      await recordImportError(req.user, {
        reason: 'khong co file Excel hop le duoc gui len'
      });
      return res.status(400).json({ message: err.message });
    }

    await recordImportError(req.user, {
      reason: err.message || 'loi khong xac dinh khi nhap file Excel'
    });
    res.status(500).json({ message: err.message || 'Khong the nhap file Excel' });
  }
}

async function getById(req, res) {
  try {
    const role = req.user.role;
    const customer = await customerService.getById(req.params.id, role);
    await recordIntegrityAlerts(req.user, [customer]);
    res.json(customer);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
}

async function create(req, res) {
  try {
    const missing = validateRequiredCustomerFields(req.body);
    if (missing.length > 0) {
      return res.status(400).json({
        message: 'Vui long nhap day du thong tin bat buoc (*)',
        missing_fields: missing
      });
    }

    const formatErrors = validateCustomerFormats(req.body, { preserveSensitiveFields: [] });
    if (Object.keys(formatErrors).length > 0) {
      return res.status(400).json({
        message: formatErrors.email || formatErrors.phone || formatErrors.id_number || formatErrors.address,
        field_errors: formatErrors
      });
    }

    const result = await customerService.create(req.body, req.user.id);
    await auditService.createLog({
      userId: req.user.id,
      action: 'CREATE_CUSTOMER',
      entityType: 'customer',
      entityId: result.id,
      description: `${req.user.username} da them khach hang "${req.body.full_name}"`
    });

    res.status(201).json({ message: 'Them khach hang thanh cong', ...result });
  } catch (err) {
    if (isDataTooLongError(err)) {
      return res.status(500).json({
        message: 'Kich thuoc cot CSDL chua du cho du lieu ma hoa. Hay cap nhat schema customers.'
      });
    }

    if (err.message === 'Email da ton tai' || err.message === 'CCCD/CMND da ton tai') {
      return res.status(400).json({ message: err.message });
    }

    res.status(500).json({ message: err.message });
  }
}

async function update(req, res) {
  try {
    const missing = validateRequiredCustomerFields(req.body);
    if (missing.length > 0) {
      return res.status(400).json({
        message: 'Vui long nhap day du thong tin bat buoc',
        missing_fields: missing
      });
    }

    const preserveSensitiveFields =
      req.user.role === 'staff' ? normalizePreserveSensitiveFields(req.body.preserve_sensitive_fields) : [];
    req.body.preserve_sensitive_fields = preserveSensitiveFields;

    const formatErrors = validateCustomerFormats(req.body, {
      preserveSensitiveFields
    });
    if (Object.keys(formatErrors).length > 0) {
      return res.status(400).json({
        message: formatErrors.email || formatErrors.phone || formatErrors.id_number || formatErrors.address,
        field_errors: formatErrors
      });
    }

    const result = await customerService.update(req.params.id, req.body);
    await auditService.createLog({
      userId: req.user.id,
      action: 'UPDATE_CUSTOMER',
      entityType: 'customer',
      entityId: Number(req.params.id),
      description: `${req.user.username} da cap nhat khach hang "${req.body.full_name}"`
    });

    res.json({ message: 'Cap nhat thanh cong', ...result });
  } catch (err) {
    if (isDataTooLongError(err)) {
      return res.status(500).json({
        message: 'Kich thuoc cot CSDL chua du cho du lieu ma hoa. Hay cap nhat schema customers.'
      });
    }

    if (err.message === 'Khong tim thay khach hang') {
      return res.status(404).json({ message: err.message });
    }
    if (err.message === 'Email da ton tai' || err.message === 'CCCD/CMND da ton tai') {
      return res.status(400).json({ message: err.message });
    }

    res.status(500).json({ message: err.message });
  }
}

async function remove(req, res) {
  try {
    const customer = await customerService.getById(req.params.id, 'admin');
    const result = await customerService.remove(req.params.id);
    await auditService.createLog({
      userId: req.user.id,
      action: 'DELETE_CUSTOMER',
      entityType: 'customer',
      entityId: Number(req.params.id),
      description: `${req.user.username} da xoa khach hang "${customer.full_name}"`
    });

    res.json({ message: 'Xoa khach hang thanh cong', ...result });
  } catch (err) {
    if (err.message === 'Khong tim thay khach hang') {
      return res.status(404).json({ message: err.message });
    }

    res.status(500).json({ message: err.message });
  }
}

module.exports = { getAll, exportExcel, importExcel, getById, create, update, remove };
