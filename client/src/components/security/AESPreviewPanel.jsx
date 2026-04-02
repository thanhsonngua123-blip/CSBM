import ResultBlock from './ResultBlock';

function MetaBadge({ label, value }) {
  return (
    <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700">
      <span className="font-semibold text-slate-900">{label}:</span> {value}
    </div>
  );
}

function AESPreviewPanel({ preview, loading, inputValue, onRefresh }) {
  const format = 'v2$salt$iv$cipher$mac';

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Khu vực AES</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">Mã hóa và giải mã theo hệ thống hiện tại</h2>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={!inputValue.trim() || loading}
          className="cursor-pointer rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Đang mã hóa...' : 'Mã hóa lại'}
        </button>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <MetaBadge label="Mode" value={preview?.aes?.mode || 'AES-CBC'} />
        <MetaBadge label="Padding" value={preview?.aes?.padding || 'PKCS#7'} />
        <MetaBadge label="Integrity" value={preview?.aes?.integrity || 'HMAC-SHA256'} />
        <MetaBadge label="Format" value={format} />
      </div>

      <div className="mt-5 grid gap-3">
        <ResultBlock label="Salt" value={preview?.aes?.salt} mono />
        <ResultBlock label="IV" value={preview?.aes?.iv} mono />
        <ResultBlock label="Cipher (khối mã hóa)" value={preview?.aes?.cipher} mono />
        <ResultBlock label="HMAC" value={preview?.aes?.mac} mono />
        <ResultBlock label="Ciphertext đầy đủ" value={preview?.aes?.ciphertext} mono />
        <ResultBlock label="Giải mã lại" value={preview?.aes?.decrypted} mono />
      </div>
    </section>
  );
}

export default AESPreviewPanel;
