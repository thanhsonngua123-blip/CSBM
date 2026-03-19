import { useState } from 'react';
import NoteItem from './NoteItem';

function CustomerNotesSection({
  notes,
  notesLoading,
  notesError,
  noteSubmitError,
  submittingNote,
  onSubmitNote,
  onChangeNote
}) {
  const [noteContent, setNoteContent] = useState('');

  const handleChange = (event) => {
    setNoteContent(event.target.value);
    onChangeNote?.();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await onSubmitNote(noteContent);

    if (result?.success) {
      setNoteContent('');
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold text-slate-900">Lịch sử chăm sóc</h3>
        <p className="text-sm text-slate-500">
          Ghi lại các lần liên hệ, nhắc hẹn và cập nhật phát sinh với khách hàng.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div>
          <label htmlFor="customer-note" className="mb-2 block text-sm font-medium text-slate-700">
            Thêm ghi chú mới
          </label>
          <textarea
            id="customer-note"
            rows="4"
            value={noteContent}
            onChange={handleChange}
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
  );
}

export default CustomerNotesSection;
