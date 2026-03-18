import { useEffect, useState } from 'react';
import { securityToolApi } from '../services/api';

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

function SecuritySandboxPage() {
  const [inputValue, setInputValue] = useState('');
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refreshSeed, setRefreshSeed] = useState(0);

  useEffect(() => {
    const normalizedInput = inputValue.trim();

    if (!normalizedInput) {
      setPreview(null);
      setError('');
      setLoading(false);
      return undefined;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      setError('');

      try {
        const res = await securityToolApi.preview(normalizedInput);
        setPreview(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tạo dữ liệu preview');
      } finally {
        setLoading(false);
      }
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [inputValue, refreshSeed]);

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
          Security Sandbox
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-slate-900">Công cụ Test</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Trang này không đọc hoặc ghi Database. Nó chỉ gọi trực tiếp utility mã hóa để bạn kiểm tra đúng luồng AES đang dùng trong hệ thống.
        </p>

        <div className="mt-5">
          <label htmlFor="security-sandbox-input" className="mb-2 block text-sm font-medium text-slate-700">
            Nhập dữ liệu để test
          </label>
          <input
            id="security-sandbox-input"
            type="text"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="Ví dụ: 012345678901"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-500"
          />
        </div>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

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
            onClick={() => setRefreshSeed((currentValue) => currentValue + 1)}
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
    </div>
  );
}

export default SecuritySandboxPage;
