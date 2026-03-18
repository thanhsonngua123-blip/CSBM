import { useEffect, useState } from 'react';
import ConfirmDialog from '../components/ConfirmDialog';
import { auditApi } from '../services/api';

const PAGE_SIZE = 10;
const ACTION_OPTIONS = [
  { value: '', label: 'Tất cả hành động' },
  { value: 'CREATE_CUSTOMER', label: 'Thêm khách hàng' },
  { value: 'UPDATE_CUSTOMER', label: 'Cập nhật khách hàng' },
  { value: 'DELETE_CUSTOMER', label: 'Xóa khách hàng' },
  { value: 'ADD_CUSTOMER_NOTE', label: 'Thêm ghi chú chăm sóc' }
];

const ROLE_OPTIONS = [
  { value: '', label: 'Tất cả vai trò' },
  { value: 'admin', label: 'Admin' },
  { value: 'staff', label: 'Staff' }
];

function formatDateTime(value) {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'medium'
  }).format(new Date(value));
}

function getActionLabel(action) {
  const matchedOption = ACTION_OPTIONS.find((option) => option.value === action);
  return matchedOption ? matchedOption.label : action;
}

function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    total_pages: 1
  });
  const [filters, setFilters] = useState({
    role: '',
    action: '',
    sort: 'desc'
  });
  const [clearOpen, setClearOpen] = useState(false);
  const [clearing, setClearing] = useState(false);

  const fetchLogs = async (page = pagination.page, nextFilters = filters) => {
    setLoading(true);
    setError('');

    try {
      const res = await auditApi.getAll({
        page,
        limit: PAGE_SIZE,
        role: nextFilters.role,
        action: nextFilters.action,
        sort: nextFilters.sort
      });
      setLogs(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải nhật ký hệ thống');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1, filters);
  }, []);

  const handleFilterChange = (field, value) => {
    const nextFilters = { ...filters, [field]: value };
    setFilters(nextFilters);
    fetchLogs(1, nextFilters);
  };

  const handleClearAll = async () => {
    setClearing(true);
    setError('');

    try {
      await auditApi.clearAll();
      setClearOpen(false);
      fetchLogs(1, filters);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xóa nhật ký hệ thống');
    } finally {
      setClearing(false);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Nhật ký hệ thống</h2>
            <p className="mt-1 text-sm text-slate-500">
              Theo dõi các hành động tạo, cập nhật, xóa dữ liệu và thêm ghi chú chăm sóc.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setClearOpen(true)}
            className="cursor-pointer rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
          >
            Xóa toàn bộ log
          </button>
        </div>

        <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-4">
          <select
            value={filters.role}
            onChange={(e) => handleFilterChange('role', e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500"
          >
            {ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={filters.action}
            onChange={(e) => handleFilterChange('action', e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500"
          >
            {ACTION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={filters.sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500"
          >
            <option value="desc">Mới nhất đến cũ nhất</option>
            <option value="asc">Cũ nhất đến mới nhất</option>
          </select>

          <div className="flex items-center text-sm text-slate-500">
            Tổng số: {pagination.total} bản ghi
          </div>
        </div>

        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Thời gian</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Người dùng</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Vai trò</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Hành động</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Mô tả</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-slate-500">
                      Đang tải nhật ký...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-slate-500">
                      Chưa có dữ liệu nhật ký.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-700">{formatDateTime(log.created_at)}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{log.username}</td>
                      <td className="px-4 py-3 text-slate-700">{log.role}</td>
                      <td className="px-4 py-3 text-slate-700">{getActionLabel(log.action)}</td>
                      <td className="px-4 py-3 text-slate-700">{log.description}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
          <p className="text-sm text-slate-500">
            Trang {pagination.page} / {pagination.total_pages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fetchLogs(pagination.page - 1, filters)}
              disabled={pagination.page <= 1 || loading}
              className="cursor-pointer rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Trang trước
            </button>
            <button
              type="button"
              onClick={() => fetchLogs(pagination.page + 1, filters)}
              disabled={pagination.page >= pagination.total_pages || loading}
              className="cursor-pointer rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Trang sau
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={clearOpen}
        title="Xóa toàn bộ nhật ký?"
        description="Bạn sắp xóa toàn bộ audit logs trong hệ thống. Hành động này không thể hoàn tác."
        confirmLabel="Xác nhận xóa"
        loading={clearing}
        onCancel={() => {
          if (!clearing) {
            setClearOpen(false);
          }
        }}
        onConfirm={handleClearAll}
      />
    </>
  );
}

export default AuditLogsPage;
