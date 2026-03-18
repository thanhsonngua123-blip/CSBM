function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Xóa',
  cancelLabel = 'Hủy',
  tone = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!open) {
    return null;
  }

  const confirmClasses = tone === 'danger'
    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-200'
    : 'bg-slate-900 hover:bg-slate-700 focus:ring-slate-200';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-white/70 bg-white p-6 shadow-2xl">
        <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          !
        </div>
        <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="cursor-pointer rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`cursor-pointer rounded-2xl px-4 py-2.5 text-sm font-semibold text-white transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${confirmClasses}`}
          >
            {loading ? 'Đang xử lý...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
