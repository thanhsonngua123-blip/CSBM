import { z } from 'zod';

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function isUnchangedProtectedValue(fieldName, value, options) {
  const { allowMaskedSensitiveValues, initialSensitiveValues } = options;

  if (!allowMaskedSensitiveValues) {
    return false;
  }

  return normalizeText(value) !== '' && normalizeText(value) === normalizeText(initialSensitiveValues[fieldName]);
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value) {
  return /^0\d{9}$/.test(value);
}

function isValidCitizenId(value) {
  return /^0\d{11}$/.test(value);
}

export function createCustomerSchema(options = {}) {
  const allowMaskedSensitiveValues = options.allowMaskedSensitiveValues === true;
  const initialSensitiveValues = options.initialSensitiveValues || {};

  return z
    .object({
      full_name: z
        .string()
        .trim()
        .min(1, 'Họ và tên không được để trống')
        .min(2, 'Họ và tên phải có ít nhất 2 ký tự'),
      email: z
        .string()
        .trim()
        .min(1, 'Email không được để trống'),
      phone: z
        .string()
        .trim()
        .min(1, 'Số điện thoại không được để trống'),
      id_number: z
        .string()
        .trim()
        .min(1, 'CCCD/CMND không được để trống'),
      address: z
        .string()
        .trim()
        .min(1, 'Địa chỉ không được để trống')
    })
    .superRefine((data, ctx) => {
      const sharedOptions = { allowMaskedSensitiveValues, initialSensitiveValues };
      const email = normalizeText(data.email);

      if (!isUnchangedProtectedValue('email', email, sharedOptions) && !isValidEmail(email)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['email'],
          message: 'Email không hợp lệ'
        });
      }

      const phone = normalizeText(data.phone);
      if (!isUnchangedProtectedValue('phone', phone, sharedOptions) && !isValidPhone(phone)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['phone'],
          message: 'Số điện thoại phải gồm 10 số và bắt đầu bằng số 0'
        });
      }

      const idNumber = normalizeText(data.id_number);
      if (!isUnchangedProtectedValue('id_number', idNumber, sharedOptions) && !isValidCitizenId(idNumber)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['id_number'],
          message: 'CCCD phải gồm 12 số và bắt đầu bằng số 0'
        });
      }

      const address = normalizeText(data.address);
      if (!isUnchangedProtectedValue('address', address, sharedOptions) && address.length < 5) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['address'],
          message: 'Địa chỉ phải có ít nhất 5 ký tự'
        });
      }
    });
}
