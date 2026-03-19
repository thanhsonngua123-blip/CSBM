import FieldError from '../form/FieldError';

function CustomerEditorForm({
  form,
  onSubmit,
  isEditMode,
  loading,
  onCancel,
  showMaskedSensitiveHint
}) {
  const {
    register,
    formState: { errors }
  } = form;

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-slate-200 bg-white p-6">
      {showMaskedSensitiveHint ? (
        <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Với các trường đang hiển thị dấu <code>*</code>, nếu giữ nguyên rồi bấm lưu thì hệ thống sẽ giữ nguyên dữ liệu cũ. Chỉ khi bạn xóa và nhập giá trị mới thì dữ liệu mới mới được lưu.
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="md:col-span-2">
          <span className="mb-2 block text-sm font-medium text-slate-700">Họ và tên *</span>
          <input
            type="text"
            {...register('full_name')}
            className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-500"
            placeholder="Nhập họ và tên"
          />
          <FieldError message={errors.full_name?.message} />
        </label>

        <label>
          <span className="mb-2 block text-sm font-medium text-slate-700">Email *</span>
          <input
            type="email"
            {...register('email')}
            className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-500"
            placeholder="example@gmail.com"
          />
          <FieldError message={errors.email?.message} />
        </label>

        <label>
          <span className="mb-2 block text-sm font-medium text-slate-700">Số điện thoại *</span>
          <input
            type="text"
            {...register('phone')}
            className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-500"
            placeholder="Nhập số điện thoại"
          />
          <FieldError message={errors.phone?.message} />
        </label>

        <label className="md:col-span-2">
          <span className="mb-2 block text-sm font-medium text-slate-700">CCCD/CMND *</span>
          <input
            type="text"
            {...register('id_number')}
            className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-500"
            placeholder="Nhập CCCD/CMND"
          />
          <FieldError message={errors.id_number?.message} />
        </label>

        <label className="md:col-span-2">
          <span className="mb-2 block text-sm font-medium text-slate-700">Địa chỉ *</span>
          <textarea
            {...register('address')}
            rows={4}
            className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-500"
            placeholder="Nhập địa chỉ"
          />
          <FieldError message={errors.address?.message} />
        </label>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="cursor-pointer rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={loading}
          className="cursor-pointer rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Đang lưu...' : isEditMode ? 'Lưu thay đổi' : 'Tạo khách hàng'}
        </button>
      </div>
    </form>
  );
}

export default CustomerEditorForm;
