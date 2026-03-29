function CustomerDetailHeader({ customer, onEdit, onDelete, onBack }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">{customer.full_name}</h2>
        <p className="mt-1 text-sm text-slate-500">
          Mã khách hàng #{customer.display_order || customer.id}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onEdit}
          className="cursor-pointer rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          Sửa
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="cursor-pointer rounded-md border border-red-300 px-4 py-2 text-sm text-red-700 hover:bg-red-50"
        >
          Xóa
        </button>
        <button
          type="button"
          onClick={onBack}
          className="cursor-pointer rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          Quay lại
        </button>
      </div>
    </div>
  );
}

export default CustomerDetailHeader;
