const { REQUIRED_CUSTOMER_FIELDS } = require('../constants/customer.constants');

function isBlank(value) {
  return value === undefined || value === null || String(value).trim() === '';
}

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeText(value));
}

function isValidPhone(value) {
  return /^0\d{9}$/.test(normalizeText(value));
}

function isValidCitizenId(value) {
  return /^0\d{11}$/.test(normalizeText(value));
}

function validateRequiredCustomerFields(data) {
  const missing = [];

  for (let i = 0; i < REQUIRED_CUSTOMER_FIELDS.length; i = i + 1) {
    if (isBlank(data[REQUIRED_CUSTOMER_FIELDS[i]])) {
      missing.push(REQUIRED_CUSTOMER_FIELDS[i]);
    }
  }

  return missing;
}

function validateCustomerFormats(data, options = {}) {
  const preserveFields = options.preserveSensitiveFields || [];
  const errors = {};

  if (!preserveFields.includes('email') && !isValidEmail(data.email)) {
    errors.email = 'Email không hợp lệ';
  }

  if (!preserveFields.includes('phone') && !isValidPhone(data.phone)) {
    errors.phone = 'Số điện thoại phải gồm 10 số và bắt đầu bằng số 0';
  }

  if (!preserveFields.includes('id_number') && !isValidCitizenId(data.id_number)) {
    errors.id_number = 'CCCD phải gồm 12 số và bắt đầu bằng số 0';
  }

  if (!preserveFields.includes('address') && normalizeText(data.address).length < 5) {
    errors.address = 'Địa chỉ phải có ít nhất 5 ký tự';
  }

  return errors;
}

module.exports = {
  validateRequiredCustomerFields,
  validateCustomerFormats
};
