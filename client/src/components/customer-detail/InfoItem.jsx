function InfoItem({ label, value, mono = false, highlighted = false, hint = '' }) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        highlighted ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-white'
      }`}
    >
      <p className={`text-sm ${highlighted ? 'text-red-600' : 'text-slate-500'}`}>{label}</p>
      <p
        className={`mt-2 text-base ${mono ? 'font-mono' : ''} ${
          highlighted ? 'font-medium text-red-700' : 'text-slate-900'
        }`}
      >
        {value || '-'}
      </p>
      {hint ? <p className="mt-2 text-xs text-red-600">{hint}</p> : null}
    </div>
  );
}

export default InfoItem;
