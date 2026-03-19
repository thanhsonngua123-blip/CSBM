import { useNavigate, useParams } from 'react-router-dom';
import CustomerEditorForm from '../components/customer-form/CustomerEditorForm';
import { useAuth } from '../hooks/useAuth';
import { useCustomerForm } from '../hooks/useCustomerForm';

function CustomerFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const {
    form,
    fetching,
    loading,
    submitError,
    isEditMode,
    allowMaskedSensitiveValues,
    handleFormSubmit
  } = useCustomerForm({
    customerId: id,
    userRole: user?.role,
    onSuccess: () => navigate('/')
  });

  if (fetching) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        Đang tải thông tin...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-slate-900">
          {isEditMode ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng'}
        </h2>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="cursor-pointer rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          Quay lại
        </button>
      </div>

      {submitError ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
      ) : null}

      <CustomerEditorForm
        form={form}
        onSubmit={handleFormSubmit}
        isEditMode={isEditMode}
        loading={loading}
        onCancel={() => navigate('/')}
        showMaskedSensitiveHint={allowMaskedSensitiveValues}
      />
    </div>
  );
}

export default CustomerFormPage;

