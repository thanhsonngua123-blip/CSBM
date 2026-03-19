import { useNavigate, useParams } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog';
import CustomerDetailHeader from '../components/customer-detail/CustomerDetailHeader';
import CustomerInfoGrid from '../components/customer-detail/CustomerInfoGrid';
import CustomerNotesSection from '../components/customer-detail/CustomerNotesSection';
import { useCustomerDetail } from '../hooks/useCustomerDetail';

function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    customer,
    notes,
    loading,
    notesLoading,
    error,
    notesError,
    noteSubmitError,
    submittingNote,
    deleteOpen,
    deleting,
    createdByLabel,
    submitNote,
    clearNoteSubmitError,
    openDeleteDialog,
    closeDeleteDialog,
    confirmDelete
  } = useCustomerDetail(id);

  const handleDelete = async () => {
    const deleted = await confirmDelete();

    if (deleted) {
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        Đang tải thông tin...
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="rounded-xl border border-red-200 bg-white p-8 text-center">
        <p className="text-red-600">{error || 'Không tìm thấy khách hàng'}</p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mt-4 cursor-pointer rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-5xl space-y-4">
        <CustomerDetailHeader
          customer={customer}
          onEdit={() => navigate(`/customers/${customer.id}/edit`)}
          onDelete={openDeleteDialog}
          onBack={() => navigate('/')}
        />

        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <CustomerInfoGrid customer={customer} createdByLabel={createdByLabel} />

        <CustomerNotesSection
          notes={notes}
          notesLoading={notesLoading}
          notesError={notesError}
          noteSubmitError={noteSubmitError}
          submittingNote={submittingNote}
          onSubmitNote={submitNote}
          onChangeNote={clearNoteSubmitError}
        />
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title="Xóa khách hàng?"
        description={`Bạn sắp xóa khách hàng ${customer.full_name}. Hành động này không thể hoàn tác.`}
        confirmLabel="Xác nhận xóa"
        loading={deleting}
        onCancel={closeDeleteDialog}
        onConfirm={handleDelete}
      />
    </>
  );
}

export default CustomerDetailPage;
