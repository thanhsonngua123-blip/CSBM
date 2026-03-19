import { useEffect, useState } from 'react';
import { AUDIT_PAGE_SIZE } from '../constants/audit.constants';
import { auditApi } from '../services/api';

const initialFilters = {
  role: '',
  action: '',
  sort: 'desc'
};

const initialPagination = {
  page: 1,
  limit: AUDIT_PAGE_SIZE,
  total: 0,
  total_pages: 1
};

export function useAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState(initialPagination);
  const [filters, setFilters] = useState(initialFilters);
  const [clearOpen, setClearOpen] = useState(false);
  const [clearing, setClearing] = useState(false);

  const loadLogs = async (page = 1, nextFilters = initialFilters) => {
    setLoading(true);
    setError('');

    try {
      const res = await auditApi.getAll({
        page,
        limit: AUDIT_PAGE_SIZE,
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
    void loadLogs(1, initialFilters);
  }, []);

  const handleFilterChange = async (field, value) => {
    const nextFilters = { ...filters, [field]: value };
    setFilters(nextFilters);
    await loadLogs(1, nextFilters);
  };

  const goToPreviousPage = async () => {
    if (pagination.page <= 1 || loading) {
      return;
    }

    await loadLogs(pagination.page - 1, filters);
  };

  const goToNextPage = async () => {
    if (pagination.page >= pagination.total_pages || loading) {
      return;
    }

    await loadLogs(pagination.page + 1, filters);
  };

  const openClearDialog = () => setClearOpen(true);

  const closeClearDialog = () => {
    if (!clearing) {
      setClearOpen(false);
    }
  };

  const clearAllLogs = async () => {
    setClearing(true);
    setError('');

    try {
      await auditApi.clearAll();
      setClearOpen(false);
      await loadLogs(1, filters);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xóa nhật ký hệ thống');
    } finally {
      setClearing(false);
    }
  };

  return {
    logs,
    loading,
    error,
    pagination,
    filters,
    clearOpen,
    clearing,
    handleFilterChange,
    goToPreviousPage,
    goToNextPage,
    openClearDialog,
    closeClearDialog,
    clearAllLogs
  };
}
