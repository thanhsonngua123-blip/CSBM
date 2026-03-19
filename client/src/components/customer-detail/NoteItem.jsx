import { formatDateTime } from '../../utils/date-time';

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

export default NoteItem;
