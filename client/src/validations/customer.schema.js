import { z } from 'zod';

function hasMaskCharacter(value) {
  return typeof value === 'string' && value.includes('*');
}

function shouldSkipSensitiveValidation(value, allowMaskedSensitiveValues) {
  return allowMaskedSensitiveValues && hasMaskCharacter(value.trim());
}

function isValidCitizenId(value) {
  return /^0\d{11}$/.test(value);
}

export function createCustomerSchema(allowMaskedSensitiveValues) {
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
        .min(1, 'Email không được để trống')
        .email('Email không hợp lệ'),
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
      const phone = data.phone.trim();
      if (
        !shouldSkipSensitiveValidation(phone, allowMaskedSensitiveValues) &&
        !/^[0-9+\s.-]{8,20}$/.test(phone)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['phone'],
          message: 'Số điện thoại không hợp lệ'
        });
      }

      const idNumber = data.id_number.trim();
      if (
        !shouldSkipSensitiveValidation(idNumber, allowMaskedSensitiveValues) &&
        !isValidCitizenId(idNumber)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['id_number'],
          message: 'CCCD phải gồm 12 số và bắt đầu bằng số 0'
        });
      }

      const address = data.address.trim();
      if (
        !shouldSkipSensitiveValidation(address, allowMaskedSensitiveValues) &&
        address.length < 5
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['address'],
          message: 'Địa chỉ phải có ít nhất 5 ký tự'
        });
      }
    });
}
