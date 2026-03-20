function ImportSummary({ summary, onClose }) {
  if (!summary) {
    return null;
  }

  const hasFailures = summary.failed_count > 0;
  const previewErrors = hasFailures ? summary.errors.slice(0, 10) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-3xl border border-white/70 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Kết quả nhập Excel
            </p>
            <h3
              className={`mt-2 text-xl font-semibold ${
                hasFailures ? 'text-amber-900' : 'text-emerald-900'
              }`}
            >
              {summary.message}
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Tổng dòng xử lý: {summary.total_rows} | Thành công: {summary.imported_count} | Lỗi:{' '}
              {summary.failed_count}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Đóng
          </button>
        </div>

        {previewErrors.length > 0 ? (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-900">Chi tiết lỗi</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-amber-900">
              {previewErrors.map((item) => (
                <li key={`${item.row}-${item.message}`}>
                  Dòng {item.row}: {item.message}
                </li>
              ))}
              {summary.errors.length > previewErrors.length ? (
                <li>Còn {summary.errors.length - previewErrors.length} lỗi khác trong file.</li>
              ) : null}
            </ul>
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            Tất cả dòng hợp lệ đã được nhập và mã hóa thành công.
          </div>
        )}
      </div>
    </div>
  );
}

export default ImportSummary;
