const PROTECTED_CUSTOMER_FIELDS = ['email', 'phone', 'id_number', 'address'];

const PROTECTED_FIELD_LABELS = {
  email: 'Email',
  phone: 'Số điện thoại',
  id_number: 'CCCD / CMND',
  address: 'Địa chỉ'
};

const INTEGRITY_PLACEHOLDER = 'DỮ LIỆU BỊ SỬA';

const REQUIRED_CUSTOMER_FIELDS = ['full_name', 'email', 'phone', 'id_number', 'address'];

module.exports = {
  PROTECTED_CUSTOMER_FIELDS,
  PROTECTED_FIELD_LABELS,
  INTEGRITY_PLACEHOLDER,
  REQUIRED_CUSTOMER_FIELDS
};
