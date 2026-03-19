import { useCallback, useEffect, useState } from 'react';
import { customerApi } from '../services/api';
import { downloadBlobResponse } from '../utils/file-download';

export function useCustomerList() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [showRawDb, setShowRawDb] = useState(false);

  const fetchCustomers = useCallback(async ({ search = '', rawDb = false } = {}) => {
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
  }, []);

  useEffect(() => {
    void fetchCustomers({ search: '', rawDb: false });
  }, [fetchCustomers]);

  const handleSearch = async (search) => {
    await fetchCustomers({ search, rawDb: showRawDb });
  };

  const handleRawModeChange = async (nextValue) => {
    setShowRawDb(nextValue);
    await fetchCustomers({ search: searchValue, rawDb: nextValue });
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    setDeletingId(deleteTarget.id);
    try {
      await customerApi.remove(deleteTarget.id);
      setDeleteTarget(null);
      await fetchCustomers({ search: searchValue, rawDb: showRawDb });
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
      downloadBlobResponse(response, 'danh-sach-khach-hang.xlsx');
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xuất file Excel');
    } finally {
      setExporting(false);
    }
  };

  return {
    customers,
    loading,
    error,
    deleteTarget,
    deletingId,
    exporting,
    showRawDb,
    setDeleteTarget,
    handleSearch,
    handleDelete,
    handleExportExcel,
    handleRawModeChange
  };
}
