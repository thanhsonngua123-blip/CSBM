import ConfirmDialog from '../components/ConfirmDialog';
import AuditFilters from '../components/audit/AuditFilters';
import AuditPagination from '../components/audit/AuditPagination';
import AuditTable from '../components/audit/AuditTable';
import { useAuditLogs } from '../hooks/useAuditLogs';

function AuditLogsPage() {
  const {
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
  } = useAuditLogs();

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
            onClick={openClearDialog}
            className="cursor-pointer rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
          >
            Xóa toàn bộ log
          </button>
        </div>

        <AuditFilters
          filters={filters}
          total={pagination.total}
          onFilterChange={handleFilterChange}
        />

        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <AuditTable logs={logs} loading={loading} />

        <AuditPagination
          pagination={pagination}
          loading={loading}
          onPrevious={goToPreviousPage}
          onNext={goToNextPage}
        />
      </div>

      <ConfirmDialog
        open={clearOpen}
        title="Xóa toàn bộ nhật ký?"
        description="Bạn sắp xóa toàn bộ audit logs trong hệ thống. Hành động này không thể hoàn tác."
        confirmLabel="Xác nhận xóa"
        loading={clearing}
        onCancel={closeClearDialog}
        onConfirm={clearAllLogs}
      />
    </>
  );
}

export default AuditLogsPage;
