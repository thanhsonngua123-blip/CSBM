const ExcelJS = require('exceljs');
const customerService = require('./customer.service');
const { validateRequiredCustomerFields, validateCustomerFormats } = require('../validators/customer.validator');
const { REQUIRED_CUSTOMER_FIELDS } = require('../constants/customer.constants');

function isBlank(value) {
  return value === undefined || value === null || String(value).trim() === '';
}

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}
// Loại bỏ dấu tiếng Việt và ký tự đặc biệt để chuẩn hóa header
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

  if (!normalized) return '';

  if (['ho ten', 'ten khach hang', 'full name', 'full_name'].includes(normalized)) {
    return 'full_name';
  }

  if (normalized === 'email') return 'email';

  if (['so dien thoai', 'dien thoai', 'phone', 'phone number'].includes(normalized)) {
    return 'phone';
  }

  if (['cccd / cmnd', 'cccd/cmnd', 'cccd', 'cmnd', 'id number', 'id_number'].includes(normalized)) {
    return 'id_number';
  }

  if (['dia chi', 'address'].includes(normalized)) return 'address';

  return '';
}

function extractWorksheetHeaders(worksheet) {
  const headerRow = worksheet.getRow(1);
  const headerIndexes = {};

  for (let col = 1; col <= headerRow.cellCount; col = col + 1) {
    const fieldName = mapImportField(headerRow.getCell(col).text);
    if (fieldName && !headerIndexes[fieldName]) {
      headerIndexes[fieldName] = col;
    }
  }

  return headerIndexes;
}

function getImportedCellText(row, columnIndex) {
  if (!columnIndex) return '';
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
  return REQUIRED_CUSTOMER_FIELDS.every(function (f) {
    return !normalizeText(data[f]);
  });
}

function decodeExcelBase64(fileBase64) {
  const normalized = normalizeText(fileBase64);

  if (!normalized) {
    throw new Error('Vui lòng chọn file Excel hợp lệ');
  }

  const matched = normalized.match(/^data:.+;base64,(.+)$/);
  const base64Content = matched ? matched[1] : normalized;

  return Buffer.from(base64Content, 'base64');
}

async function parseExcelFile(fileBase64, fileName) {
  const normalizedName = normalizeText(fileName).toLowerCase();

  if (normalizedName && !normalizedName.endsWith('.xlsx')) {
    const err = new Error('Chỉ hỗ trợ file Excel .xlsx');
    err.code = 'INVALID_EXTENSION';
    throw err;
  }

  const buffer = decodeExcelBase64(fileBase64);
  const workbook = new ExcelJS.Workbook();

  try {
    await workbook.xlsx.load(buffer);
  } catch (_loadError) {
    const err = new Error('Không thể đọc file Excel');
    err.code = 'UNREADABLE_FILE';
    throw err;
  }

  const worksheet = workbook.worksheets[0];

  if (!worksheet) {
    const err = new Error('File Excel không có dữ liệu hợp lệ');
    err.code = 'NO_SHEET';
    throw err;
  }

  const headerIndexes = extractWorksheetHeaders(worksheet);
  const missingHeaders = REQUIRED_CUSTOMER_FIELDS.filter(function (f) {
    return !headerIndexes[f];
  });

  if (missingHeaders.length > 0) {
    const err = new Error('File Excel thiếu cột bắt buộc');
    err.code = 'MISSING_HEADERS';
    err.missingHeaders = missingHeaders;
    throw err;
  }

  return { worksheet, headerIndexes };
}

async function importRowsFromWorksheet(worksheet, headerIndexes, userId) {
  let totalRows = 0;
  let importedCount = 0;
  const importedIds = [];
  const errors = [];

  for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber = rowNumber + 1) {
    const row = worksheet.getRow(rowNumber);
    const customerData = buildImportedCustomer(row, headerIndexes);

    if (isEmptyImportedCustomer(customerData)) continue;

    totalRows = totalRows + 1;

    const missingFields = validateRequiredCustomerFields(customerData);

    if (missingFields.length > 0) {
      errors.push({
        row: rowNumber,
        message: 'Vui lòng nhập đầy đủ thông tin bắt buộc (*)',
        missing_fields: missingFields
      });
      continue;
    }

    const formatErrors = validateCustomerFormats(customerData, { preserveSensitiveFields: [] });

    if (Object.keys(formatErrors).length > 0) {
      errors.push({
        row: rowNumber,
        message: formatErrors.email || formatErrors.phone || formatErrors.id_number || formatErrors.address,
        field_errors: formatErrors
      });
      continue;
    }

    try {
      const result = await customerService.create(customerData, userId);
      importedCount = importedCount + 1;
      importedIds.push(result.id);
    } catch (err) {
      errors.push({
        row: rowNumber,
        message: err.message || 'Không thể nhập dòng dữ liệu này'
      });
    }
  }

  return { totalRows, importedCount, importedIds, errors };
}

function formatCreatedBy(customer) {
  if (customer.created_by_username && customer.created_by_role) {
    return `${customer.created_by_username} (${customer.created_by_role})`;
  }

  if (customer.created_by_username) return customer.created_by_username;

  return customer.created_by ? `User ID ${customer.created_by}` : '';
}

function formatDateTime(value) {
  if (!value) return '';

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(new Date(value));
}

function buildCustomerExportWorkbook(customers, role) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Danh sách khách hàng');

  worksheet.columns = [
    { header: 'STT', key: 'index', width: 8 },
    { header: 'Họ tên', key: 'full_name', width: 28 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Số điện thoại', key: 'phone', width: 18 },
    { header: 'CCCD / CMND', key: 'id_number', width: 22 },
    { header: 'Địa chỉ', key: 'address', width: 40 },
    { header: 'Tạo bởi', key: 'created_by_label', width: 24 },
    { header: 'Ngày tạo', key: 'created_at_label', width: 24 }
  ];

  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

  customers.forEach(function (customer, index) {
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

  worksheet.eachRow(function (row, rowNumber) {
    row.alignment = { vertical: 'middle', wrapText: true };
    if (rowNumber > 1) {
      row.getCell('D').numFmt = '@';
      row.getCell('E').numFmt = '@';
    }
  });

  return workbook;
}

module.exports = {
  parseExcelFile,
  importRowsFromWorksheet,
  buildCustomerExportWorkbook
};
