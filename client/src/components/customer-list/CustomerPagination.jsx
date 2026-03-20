function CustomerPagination({ pagination, loading, onPrevious, onNext }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-sm text-slate-500">
        Trang {pagination.page} / {pagination.total_pages} | Tổng số: {pagination.total} bản ghi
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onPrevious}
          disabled={pagination.page <= 1 || loading}
          className="cursor-pointer rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Trang trước
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={pagination.page >= pagination.total_pages || loading}
          className="cursor-pointer rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Trang sau
        </button>
      </div>
    </div>
  );
}

export default CustomerPagination;
