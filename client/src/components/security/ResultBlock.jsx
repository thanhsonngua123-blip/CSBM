function ResultBlock({ label, value, mono = false }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <div className={`mt-3 break-all text-sm text-slate-800 ${mono ? 'font-mono' : ''}`}>
        {value || '-'}
      </div>
    </div>
  );
}

export default ResultBlock;
