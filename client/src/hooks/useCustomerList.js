import { useCallback, useEffect, useState } from 'react';
import { customerApi } from '../services/api';
import { downloadBlobResponse } from '../utils/file-download';
import { readFileAsBase64 } from '../utils/file-upload';

const CUSTOMER_PAGE_SIZE = 10;

const initialPagination = {
  page: 1,
  limit: CUSTOMER_PAGE_SIZE,
  total: 0,
  total_pages: 1
};

export function useCustomerList() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importSummary, setImportSummary] = useState(null);
  const [pagination, setPagination] = useState(initialPagination);

  const fetchCustomers = useCallback(async ({ search = '', page = 1 } = {}) => {
    setLoading(true);
    setError('');

    try {
      const res = await customerApi.getAll(search, {
        page,
        limit: CUSTOMER_PAGE_SIZE
      });
      setCustomers(res.data.data);
      setPagination(res.data.pagination);
      setSearchValue(search);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách khách hàng');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCustomers({ search: '', page: 1 });
  }, [fetchCustomers]);

  const handleSearch = async (search) => {
    await fetchCustomers({ search, page: 1 });
  };

  const goToPreviousPage = async () => {
    if (pagination.page <= 1 || loading) {
      return;
    }

    await fetchCustomers({ search: searchValue, page: pagination.page - 1 });
  };

  const goToNextPage = async () => {
    if (pagination.page >= pagination.total_pages || loading) {
      return;
    }

    await fetchCustomers({ search: searchValue, page: pagination.page + 1 });
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    setDeletingId(deleteTarget.id);
    try {
      await customerApi.remove(deleteTarget.id);
      setDeleteTarget(null);
      await fetchCustomers({ search: searchValue, page: pagination.page });
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

  const handleImportExcel = async (file) => {
    if (!file) {
      return;
    }

    setImporting(true);
    setError('');
    setImportSummary(null);

    try {
      const fileBase64 = await readFileAsBase64(file);
      const response = await customerApi.importExcel({
        file_name: file.name,
        file_base64: fileBase64
      });

      setImportSummary(response.data);
      await fetchCustomers({ search: searchValue, page: pagination.page });
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể nhập file Excel');
    } finally {
      setImporting(false);
    }
  };

  return {
    customers,
    loading,
    error,
    deleteTarget,
    deletingId,
    exporting,
    importing,
    importSummary,
    pagination,
    setDeleteTarget,
    setImportSummary,
    handleSearch,
    goToPreviousPage,
    goToNextPage,
    handleDelete,
    handleExportExcel,
    handleImportExcel
  };
}
