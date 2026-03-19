import AESPreviewPanel from '../components/security/AESPreviewPanel';
import { useSecuritySandbox } from '../hooks/useSecuritySandbox';

function SecuritySandboxPage() {
  const { inputValue, preview, loading, error, setInputValue, refreshPreview } = useSecuritySandbox();

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

      <AESPreviewPanel
        preview={preview}
        loading={loading}
        inputValue={inputValue}
        onRefresh={refreshPreview}
      />
    </div>
  );
}

export default SecuritySandboxPage;
