const ExcelJS = require('exceljs');
const customerService = require('../services/customer.service');
const auditService = require('../services/audit.service');

function isBlank(value) {
  return value === undefined || value === null || String(value).trim() === '';
}

function hasMaskCharacter(value) {
  return typeof value === 'string' && value.includes('*');
}

function isValidCitizenId(value, allowMaskedValue) {
  const normalized = String(value || '').trim();

  if (allowMaskedValue && hasMaskCharacter(normalized)) {
    return true;
  }

  return /^0\d{11}$/.test(normalized);
}

function validateRequiredCustomerFields(data) {
  const requiredFields = ['full_name', 'email', 'phone', 'id_number', 'address'];
  const missing = [];

  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (isBlank(data[field])) {
      missing.push(field);
    }
  }

  return missing;
}

function validateCustomerFormats(data, options = {}) {
  const errors = {};

  if (!isValidCitizenId(data.id_number, options.allowMaskedCitizenId)) {
    errors.id_number = 'CCCD phải gồm 12 số và bắt đầu bằng số 0';
  }

  return errors;
}

async function getAll(req, res) {
  try {
    const search = req.query.search || '';
    const role = req.user.role;
    const rawMode = req.query.raw === 'true';

    if (rawMode && role !== 'admin') {
      return res.status(403).json({ message: 'Chi admin moi duoc xem du lieu raw tu CSDL' });
    }

    const customers = await customerService.getAll(search, role, { rawMode });
    res.json(customers);
  } catch (err) {
    if (err.message === 'Email đã tồn tại' || err.message === 'CCCD/CMND đã tồn tại') {
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
    const customers = await customerService.getAll(search, role);

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

async function getById(req, res) {
  try {
    const role = req.user.role;
    const customer = await customerService.getById(req.params.id, role);
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
        message: 'Vui lòng nhập đầy đủ thông tin bắt buộc (*)',
        missing_fields: missing
      });
    }

    const formatErrors = validateCustomerFormats(req.body, { allowMaskedCitizenId: false });
    if (Object.keys(formatErrors).length > 0) {
      return res.status(400).json({
        message: formatErrors.id_number,
        field_errors: formatErrors
      });
    }

    const result = await customerService.create(req.body, req.user.id);
    await auditService.createLog({
      userId: req.user.id,
      action: 'CREATE_CUSTOMER',
      entityType: 'customer',
      entityId: result.id,
      description: `${req.user.username} đã thêm khách hàng "${req.body.full_name}"`
    });

    res.status(201).json({ message: 'Thêm khách hàng thành công', ...result });
  } catch (err) {
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

    const formatErrors = validateCustomerFormats(req.body, {
      allowMaskedCitizenId: req.user.role === 'staff'
    });
    if (Object.keys(formatErrors).length > 0) {
      return res.status(400).json({
        message: formatErrors.id_number,
        field_errors: formatErrors
      });
    }

    const result = await customerService.update(req.params.id, req.body);
    await auditService.createLog({
      userId: req.user.id,
      action: 'UPDATE_CUSTOMER',
      entityType: 'customer',
      entityId: Number(req.params.id),
      description: `${req.user.username} đã cập nhật khách hàng "${req.body.full_name}"`
    });

    res.json({ message: 'Cap nhat thanh cong', ...result });
  } catch (err) {
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
      description: `${req.user.username} đã xóa khách hàng "${customer.full_name}"`
    });

    res.json({ message: 'Xoa khach hang thanh cong', ...result });
  } catch (err) {
    if (err.message === 'Khong tim thay khach hang') {
      return res.status(404).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
}

module.exports = { getAll, exportExcel, getById, create, update, remove };
