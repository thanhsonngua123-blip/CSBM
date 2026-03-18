import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog';
import CustomerTable from '../components/CustomerTable';
import SearchBar from '../components/SearchBar';
import { useAuth } from '../context/AuthContext';
import { customerApi } from '../services/api';

function RawModeToggle({ checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
      <div>
        <p className="text-sm font-semibold text-slate-900">Chế độ Developer (Hiển thị Raw DB)</p>
        <p className="mt-1 text-xs text-slate-600">
          Bật để xem ciphertext gốc đang lưu trong MySQL cho các trường đã mã hóa.
        </p>
      </div>
      <span className="ml-auto">
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={() => onChange(!checked)}
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
            checked ? 'bg-slate-900' : 'bg-slate-300'
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
              checked ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </span>
    </label>
  );
}

function CustomerListPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [showRawDb, setShowRawDb] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchCustomers = async (search = '', rawDb = showRawDb) => {
    setLoading(true);
    setError('');

    try {
      const res = await customerApi.getAll(search, { rawDb });
      setCustomers(res.data);
      setSearchValue(search);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách khách hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(searchValue, showRawDb);
  }, [showRawDb]);

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    setDeletingId(deleteTarget.id);
    try {
      await customerApi.remove(deleteTarget.id);
      setDeleteTarget(null);
      await fetchCustomers(searchValue, showRawDb);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xóa khách hàng');
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportExcel = async () => {
    setExporting(true);
    setError('');

    try {
      const response = await customerApi.exportExcel(searchValue);
      const contentDisposition = response.headers['content-disposition'] || '';
      const matchedFileName = contentDisposition.match(/filename="(.+)"/i);
      const fileName = matchedFileName?.[1] || 'danh-sach-khach-hang.xlsx';
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xuất file Excel');
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Danh sách khách hàng</h2>
            <p className="mt-1 text-sm text-slate-500">
              Tổng số: {customers.length} khách hàng
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {user?.role === 'admin' ? (
              <button
                type="button"
                onClick={() => navigate('/audit-logs')}
                className="cursor-pointer rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Nhật ký hệ thống
              </button>
            ) : null}
            <button
              type="button"
              onClick={handleExportExcel}
              disabled={exporting || loading}
              className="cursor-pointer rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {exporting ? 'Đang xuất Excel...' : 'Xuất Excel'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/customers/new')}
              className="cursor-pointer rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Thêm khách hàng
            </button>
          </div>
        </div>

        {user?.role === 'admin' ? (
          <RawModeToggle checked={showRawDb} onChange={setShowRawDb} />
        ) : null}

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <SearchBar onSearch={(search) => fetchCustomers(search, showRawDb)} />
        </div>

        {showRawDb ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            X-Ray Mode đang bật. Bảng hiện hiển thị ciphertext gốc của các trường mã hóa từ CSDL.
          </div>
        ) : null}

        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <CustomerTable
          customers={customers}
          loading={loading}
          deletingId={deletingId}
          onDelete={setDeleteTarget}
          showRawDb={showRawDb}
        />
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Xóa khách hàng?"
        description={
          deleteTarget
            ? `Bạn sắp xóa hồ sơ của ${deleteTarget.full_name}. Hành động này không thể hoàn tác.`
            : ''
        }
        confirmLabel="Xác nhận xóa"
        loading={Boolean(deleteTarget && deletingId === deleteTarget.id)}
        onCancel={() => {
          if (!deletingId) {
            setDeleteTarget(null);
          }
        }}
        onConfirm={handleDelete}
      />
    </>
  );
}

export default CustomerListPage;
