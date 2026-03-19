function RawModeToggle({ checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
      <div>
        <p className="text-sm font-semibold text-slate-900">Chế độ Developer (Hiển thị Raw DB)</p>
        <p className="mt-1 text-xs text-slate-600">
          Bật để xem ciphertext gốc đang lưu trong MySQL cho các trường đã mã hóa.
        </p>
      </div>
      <span className="ml-auto">
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={() => onChange(!checked)}
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
            checked ? 'bg-slate-900' : 'bg-slate-300'
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
              checked ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </span>
    </label>
  );
}

export default RawModeToggle;
