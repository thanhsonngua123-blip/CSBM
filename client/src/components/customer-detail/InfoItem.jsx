function InfoItem({ label, value, mono = false }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-2 text-base text-slate-900 ${mono ? 'font-mono' : ''}`}>
        {value || '-'}
      </p>
    </div>
  );
}

export default InfoItem;
