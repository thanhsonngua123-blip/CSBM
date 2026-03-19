import ResultBlock from './ResultBlock';

function AESPreviewPanel({ preview, loading, inputValue, onRefresh }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Khu vực AES</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">Mã hóa và giải mã theo hệ thống hiện tại</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Trang này đang dùng trực tiếp <code>encryptAES</code> và <code>decryptAES</code>. Với cùng dữ liệu và cùng key, ciphertext sẽ giữ nguyên giữa các lần mã hóa lại.
          </p>
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

      <div className="mt-5 grid gap-3">
        <ResultBlock label="Ciphertext" value={preview?.aes?.ciphertext} mono />
        <ResultBlock label="Giải mã lại" value={preview?.aes?.decrypted} mono />
      </div>
    </section>
  );
}

export default AESPreviewPanel;
