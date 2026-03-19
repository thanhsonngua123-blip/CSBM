function CustomerListHeader({
  customerCount,
  canViewAuditLogs,
  onOpenAuditLogs,
  onExportExcel,
  exporting,
  loading,
  onAddCustomer
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Danh sách khách hàng</h2>
        <p className="mt-1 text-sm text-slate-500">Tổng số: {customerCount} khách hàng</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {canViewAuditLogs ? (
          <button
            type="button"
            onClick={onOpenAuditLogs}
            className="cursor-pointer rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Nhật ký hệ thống
          </button>
        ) : null}
        <button
          type="button"
          onClick={onExportExcel}
          disabled={exporting || loading}
          className="cursor-pointer rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {exporting ? 'Đang xuất Excel...' : 'Xuất Excel'}
        </button>
        <button
          type="button"
          onClick={onAddCustomer}
          className="cursor-pointer rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Thêm khách hàng
        </button>
      </div>
    </div>
  );
}

export default CustomerListHeader;
