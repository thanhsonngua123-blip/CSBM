import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog';
import { customerApi } from '../services/api';

function formatDateTime(value) {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'medium'
  }).format(new Date(value));
}

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

function NoteItem({ note }) {
  const authorLabel = note.username
    ? `${note.username}${note.role ? ` (${note.role})` : ''}`
    : 'Không rõ người tạo';

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-slate-900">{authorLabel}</p>
        <p className="text-xs text-slate-500">{formatDateTime(note.created_at)}</p>
      </div>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{note.content}</p>
    </div>
  );
}

function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notesLoading, setNotesLoading] = useState(true);
  const [error, setError] = useState('');
  const [notesError, setNotesError] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteSubmitError, setNoteSubmitError] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const createdByLabel = customer?.created_by_username
    ? `${customer.created_by_username}${customer.created_by_role ? ` (${customer.created_by_role})` : ''}`
    : customer?.created_by
      ? `User ID ${customer.created_by}`
      : '-';

  useEffect(() => {
    const fetchCustomer = async () => {
      setLoading(true);
      setError('');

      try {
        const res = await customerApi.getById(id);
        setCustomer(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Không tìm thấy thông tin khách hàng');
      } finally {
        setLoading(false);
      }
    };

    const fetchNotes = async () => {
      setNotesLoading(true);
      setNotesError('');

      try {
        const res = await customerApi.getNotes(id);
        setNotes(res.data);
      } catch (err) {
        setNotesError(err.response?.data?.message || 'Không thể tải lịch sử chăm sóc');
      } finally {
        setNotesLoading(false);
      }
    };

    fetchCustomer();
    fetchNotes();
  }, [id]);

  const handleDelete = async () => {
    if (!customer) {
      return;
    }

    setDeleting(true);
    try {
      await customerApi.remove(customer.id);
      navigate('/');
    } catch (err) {
      setDeleteOpen(false);
      setError(err.response?.data?.message || 'Không thể xóa khách hàng');
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmitNote = async (event) => {
    event.preventDefault();

    const trimmedContent = noteContent.trim();
    if (!trimmedContent) {
      setNoteSubmitError('Vui lòng nhập nội dung ghi chú');
      return;
    }

    setSubmittingNote(true);
    setNoteSubmitError('');
    setNotesError('');

    try {
      const res = await customerApi.createNote(id, { content: trimmedContent });
      setNotes((currentNotes) => [res.data.note, ...currentNotes]);
      setNoteContent('');
    } catch (err) {
      setNoteSubmitError(err.response?.data?.message || 'Không thể thêm ghi chú');
    } finally {
      setSubmittingNote(false);
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
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">{customer.full_name}</h2>
            <p className="mt-1 text-sm text-slate-500">Mã khách hàng #{customer.id}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => navigate(`/customers/${customer.id}/edit`)}
              className="cursor-pointer rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Sửa
            </button>
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className="cursor-pointer rounded-md border border-red-300 px-4 py-2 text-sm text-red-700 hover:bg-red-50"
            >
              Xóa
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="cursor-pointer rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Quay lại
            </button>
          </div>
        </div>

        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <InfoItem label="Email" value={customer.email} />
          <InfoItem label="Số điện thoại" value={customer.phone} mono />
          <InfoItem label="CCCD / CMND" value={customer.id_number} mono />
          <InfoItem label="Địa chỉ" value={customer.address} />
          <InfoItem label="Tạo bởi" value={createdByLabel} />
          <InfoItem label="Cập nhật lần cuối" value={formatDateTime(customer.updated_at)} />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold text-slate-900">Lịch sử chăm sóc</h3>
            <p className="text-sm text-slate-500">
              Ghi lại các lần liên hệ, nhắc hẹn và cập nhật phát sinh với khách hàng.
            </p>
          </div>

          <form onSubmit={handleSubmitNote} className="mt-4 space-y-3">
            <div>
              <label htmlFor="customer-note" className="mb-2 block text-sm font-medium text-slate-700">
                Thêm ghi chú mới
              </label>
              <textarea
                id="customer-note"
                rows="4"
                value={noteContent}
                onChange={(event) => {
                  setNoteContent(event.target.value);
                  if (noteSubmitError) {
                    setNoteSubmitError('');
                  }
                }}
                placeholder="Ví dụ: Khách hẹn gọi lại vào tuần sau..."
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500"
              />
              {noteSubmitError ? (
                <p className="mt-2 text-sm text-red-600">{noteSubmitError}</p>
              ) : null}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submittingNote}
                className="cursor-pointer rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submittingNote ? 'Đang lưu ghi chú...' : 'Lưu ghi chú'}
              </button>
            </div>
          </form>

          <div className="mt-6 space-y-3">
            {notesError ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {notesError}
              </div>
            ) : null}

            {notesLoading ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                Đang tải lịch sử chăm sóc...
              </div>
            ) : notes.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                Chưa có ghi chú nào cho khách hàng này.
              </div>
            ) : (
              notes.map((note) => <NoteItem key={note.id} note={note} />)
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title="Xóa khách hàng?"
        description={`Bạn sắp xóa khách hàng ${customer.full_name}. Hành động này không thể hoàn tác.`}
        confirmLabel="Xác nhận xóa"
        loading={deleting}
        onCancel={() => {
          if (!deleting) {
            setDeleteOpen(false);
          }
        }}
        onConfirm={handleDelete}
      />
    </>
  );
}

export default CustomerDetailPage;
