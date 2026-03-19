import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { customerApi } from '../services/api';
import { createCustomerSchema } from '../validations/customer.schema';

const defaultValues = {
  full_name: '',
  email: '',
  phone: '',
  id_number: '',
  address: ''
};

export function useCustomerForm({ customerId, userRole, onSuccess }) {
  const isEditMode = Boolean(customerId);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [submitError, setSubmitError] = useState('');
  const allowMaskedSensitiveValues = isEditMode && userRole === 'staff';
  const customerSchema = useMemo(
    () => createCustomerSchema(allowMaskedSensitiveValues),
    [allowMaskedSensitiveValues]
  );

  const form = useForm({
    resolver: zodResolver(customerSchema),
    mode: 'onChange',
    defaultValues
  });

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    const fetchCustomer = async () => {
      try {
        const res = await customerApi.getById(customerId);
        const customer = res.data;

        form.reset({
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

    void fetchCustomer();
  }, [customerId, form, isEditMode]);

  const handleFormSubmit = form.handleSubmit(async (formData) => {
    setSubmitError('');
    setLoading(true);

    try {
      if (isEditMode) {
        await customerApi.update(customerId, formData);
      } else {
        await customerApi.create(formData);
      }

      onSuccess?.();
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu dữ liệu');
    } finally {
      setLoading(false);
    }
  });

  return {
    form,
    fetching,
    loading,
    submitError,
    isEditMode,
    allowMaskedSensitiveValues,
    handleFormSubmit
  };
}
