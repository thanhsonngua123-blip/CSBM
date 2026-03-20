export const AUDIT_PAGE_SIZE = 10;

export const AUDIT_ACTION_OPTIONS = [
  { value: '', label: 'Tất cả hành động' },
  { value: 'CREATE_CUSTOMER', label: 'Thêm khách hàng' },
  { value: 'IMPORT_CUSTOMERS', label: 'Nhập khách hàng từ Excel' },
  { value: 'IMPORT_CUSTOMERS_ERROR', label: 'Lỗi nhập khách hàng từ Excel' },
  { value: 'UPDATE_CUSTOMER', label: 'Cập nhật khách hàng' },
  { value: 'DELETE_CUSTOMER', label: 'Xóa khách hàng' },
  { value: 'ADD_CUSTOMER_NOTE', label: 'Thêm ghi chú chăm sóc' },
  { value: 'DETECT_TAMPERED_CUSTOMER_DATA', label: 'Phát hiện dữ liệu bị sửa' }
];

export const AUDIT_ROLE_OPTIONS = [
  { value: '', label: 'Tất cả vai trò' },
  { value: 'admin', label: 'Admin' },
  { value: 'staff', label: 'Staff' }
];

export const AUDIT_SORT_OPTIONS = [
  { value: 'desc', label: 'Mới nhất đến cũ nhất' },
  { value: 'asc', label: 'Cũ nhất đến mới nhất' }
];

export function getAuditActionLabel(action) {
  const matchedOption = AUDIT_ACTION_OPTIONS.find((option) => option.value === action);
  return matchedOption ? matchedOption.label : action;
}
