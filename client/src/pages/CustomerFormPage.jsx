import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { customerApi } from '../services/api';

function hasMaskCharacter(value) {
  return typeof value === 'string' && value.includes('*');
}

function shouldSkipSensitiveValidation(value, allowMaskedSensitiveValues) {
  return allowMaskedSensitiveValues && hasMaskCharacter(value.trim());
}

function isValidCitizenId(value) {
  return /^0\d{11}$/.test(value);
}

function createCustomerSchema(allowMaskedSensitiveValues) {
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

function FieldError({ message }) {
  if (!message) {
    return null;
  }

  return <p className="mt-1 text-sm text-red-600">{message}</p>;
}

function CustomerFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const isEditMode = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [submitError, setSubmitError] = useState('');
  const allowMaskedSensitiveValues = isEditMode && user?.role === 'staff';
  const customerSchema = useMemo(
    () => createCustomerSchema(allowMaskedSensitiveValues),
    [allowMaskedSensitiveValues]
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(customerSchema),
    mode: 'onChange',
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      id_number: '',
      address: ''
    }
  });

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    const fetchCustomer = async () => {
      try {
        const res = await customerApi.getById(id);
        const customer = res.data;
        reset({
          full_name: customer.full_name || '',
          email: customer.email || '',
          phone: customer.phone || '',
          id_number: customer.id_number || '',
          address: customer.address || ''
        });
      } catch (err) {
        setSubmitError(err.response?.data?.message || 'Không thể tải thông tin khách hàng');
      } finally {
        setFetching(false);
      }
    };

    fetchCustomer();
  }, [id, isEditMode, reset]);

  const onSubmit = async (formData) => {
    setSubmitError('');
    setLoading(true);

    try {
      if (isEditMode) {
        await customerApi.update(id, formData);
      } else {
        await customerApi.create(formData);
      }
      navigate('/');
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        Đang tải thông tin...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-slate-900">
          {isEditMode ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng'}
        </h2>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="cursor-pointer rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          Quay lại
        </button>
      </div>

      {submitError ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
      ) : null}

      

      <form onSubmit={handleSubmit(onSubmit)} className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-700">Họ và tên *</span>
            <input
              type="text"
              {...register('full_name')}
              className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-500"
              placeholder="Nhập họ và tên"
            />
            <FieldError message={errors.full_name?.message} />
          </label>

          <label>
            <span className="mb-2 block text-sm font-medium text-slate-700">Email *</span>
            <input
              type="email"
              {...register('email')}
              className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-500"
              placeholder="example@gmail.com"
            />
            <FieldError message={errors.email?.message} />
          </label>

          <label>
            <span className="mb-2 block text-sm font-medium text-slate-700">Số điện thoại *</span>
            <input
              type="text"
              {...register('phone')}
              className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-500"
              placeholder="Nhập số điện thoại"
            />
            <FieldError message={errors.phone?.message} />
          </label>

          <label className="md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-700">CCCD/CMND *</span>
            <input
              type="text"
              {...register('id_number')}
              className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-500"
              placeholder="Nhập CCCD/CMND"
            />
            <FieldError message={errors.id_number?.message} />
          </label>

          <label className="md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-700">Địa chỉ *</span>
            <textarea
              {...register('address')}
              rows={4}
              className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-500"
              placeholder="Nhập địa chỉ"
            />
            <FieldError message={errors.address?.message} />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="cursor-pointer rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="cursor-pointer rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Đang lưu...' : isEditMode ? 'Lưu thay đổi' : 'Tạo khách hàng'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CustomerFormPage;
