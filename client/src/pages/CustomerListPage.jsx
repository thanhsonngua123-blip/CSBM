import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog';
import CustomerTable from '../components/CustomerTable';
import SearchBar from '../components/SearchBar';
import Toast from '../components/Toast';
import CustomerListHeader from '../components/customer-list/CustomerListHeader';
import CustomerPagination from '../components/customer-list/CustomerPagination';
import ImportSummary from '../components/customer-list/ImportSummary';
import { useAuth } from '../hooks/useAuth';
import { useCustomerList } from '../hooks/useCustomerList';
import { clearFlashToast, getFlashToast } from '../utils/flash-toast';

function CustomerListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [flashToast, setFlashToast] = useState(() => getFlashToast());
  const {
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
  } = useCustomerList();

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!flashToast) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      setFlashToast(null);
      clearFlashToast();
    }, Math.max(0, flashToast.expiresAt - Date.now()));

    return () => clearTimeout(timeoutId);
  }, [flashToast]);

  return (
    <>
      <Toast message={flashToast?.message} />

      <div className="space-y-4">
        <CustomerListHeader
          customerCount={pagination.total}
          canViewAuditLogs={isAdmin}
          onOpenAuditLogs={() => navigate('/audit-logs')}
          onImportExcel={handleImportExcel}
          onExportExcel={handleExportExcel}
          importing={importing}
          exporting={exporting}
          loading={loading}
          onAddCustomer={() => navigate('/customers/new')}
        />

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <SearchBar onSearch={handleSearch} />
        </div>

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
          pagination={pagination}
        />

        <CustomerPagination
          pagination={pagination}
          loading={loading}
          onPrevious={goToPreviousPage}
          onNext={goToNextPage}
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

      <ImportSummary summary={importSummary} onClose={() => setImportSummary(null)} />
    </>
  );
}

export default CustomerListPage;
