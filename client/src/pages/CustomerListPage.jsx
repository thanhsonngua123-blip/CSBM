import { useNavigate } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog';
import CustomerTable from '../components/CustomerTable';
import SearchBar from '../components/SearchBar';
import CustomerListHeader from '../components/customer-list/CustomerListHeader';
import RawModeToggle from '../components/customer-list/RawModeToggle';
import { useAuth } from '../hooks/useAuth';
import { useCustomerList } from '../hooks/useCustomerList';

function CustomerListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
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
  } = useCustomerList();

  const isAdmin = user?.role === 'admin';

  return (
    <>
      <div className="space-y-4">
        <CustomerListHeader
          customerCount={customers.length}
          canViewAuditLogs={isAdmin}
          onOpenAuditLogs={() => navigate('/audit-logs')}
          onExportExcel={handleExportExcel}
          exporting={exporting}
          loading={loading}
          onAddCustomer={() => navigate('/customers/new')}
        />

        {isAdmin ? (
          <RawModeToggle checked={showRawDb} onChange={handleRawModeChange} />
        ) : null}

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <SearchBar onSearch={handleSearch} />
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

