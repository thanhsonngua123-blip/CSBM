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

const protectedFieldNames = ['email', 'phone', 'id_number', 'address'];

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function createInitialSensitiveValues(customer = null) {
  return {
    email: customer?.email || '',
    phone: customer?.phone || '',
    id_number: customer?.id_number || '',
    address: customer?.address || ''
  };
}

function buildPreserveSensitiveFields(formData, initialSensitiveValues) {
  const fields = [];

  for (let i = 0; i < protectedFieldNames.length; i = i + 1) {
    const fieldName = protectedFieldNames[i];
    if (normalizeText(formData[fieldName]) === normalizeText(initialSensitiveValues[fieldName])) {
      fields.push(fieldName);
    }
  }

  return fields;
}

export function useCustomerForm({ customerId, userRole, onSuccess }) {
  const isEditMode = Boolean(customerId);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [submitError, setSubmitError] = useState('');
  const [initialSensitiveValues, setInitialSensitiveValues] = useState(createInitialSensitiveValues());
  const allowMaskedSensitiveValues = isEditMode && userRole === 'staff';
  const customerSchema = useMemo(
    () =>
      createCustomerSchema({
        allowMaskedSensitiveValues,
        initialSensitiveValues
      }),
    [allowMaskedSensitiveValues, initialSensitiveValues]
  );

  const form = useForm({
    resolver: zodResolver(customerSchema),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    defaultValues
  });

  useEffect(() => {
    if (!isEditMode) {
      setInitialSensitiveValues(createInitialSensitiveValues());
      return;
    }

    const fetchCustomer = async () => {
      try {
        const res = await customerApi.getById(customerId);
        const customer = res.data;
        const nextInitialSensitiveValues = createInitialSensitiveValues(customer);

        setInitialSensitiveValues(nextInitialSensitiveValues);
        form.reset({
          full_name: customer.full_name || '',
          email: nextInitialSensitiveValues.email,
          phone: nextInitialSensitiveValues.phone,
          id_number: nextInitialSensitiveValues.id_number,
          address: nextInitialSensitiveValues.address
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
      const payload = { ...formData };

      if (allowMaskedSensitiveValues) {
        const preserveSensitiveFields = buildPreserveSensitiveFields(formData, initialSensitiveValues);
        if (preserveSensitiveFields.length > 0) {
          payload.preserve_sensitive_fields = preserveSensitiveFields;
        }
      }

      if (isEditMode) {
        await customerApi.update(customerId, payload);
      } else {
        await customerApi.create(payload);
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
