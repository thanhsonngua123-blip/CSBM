function Toast({ message }) {
  if (!message) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50">
      <div className="rounded-2xl border border-emerald-200 bg-white/95 px-4 py-3 shadow-lg ring-1 ring-emerald-100 backdrop-blur">
        <p className="text-sm font-semibold text-emerald-700">{message}</p>
      </div>
    </div>
  );
}

export default Toast;
