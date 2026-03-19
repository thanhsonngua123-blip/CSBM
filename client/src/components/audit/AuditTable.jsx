import { getAuditActionLabel } from '../../constants/audit.constants';
import { formatDateTime } from '../../utils/date-time';

function AuditTable({ logs, loading }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Thời gian</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Người dùng</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Vai trò</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Hành động</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Mô tả</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-slate-500">
                  Đang tải nhật ký...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-slate-500">
                  Chưa có dữ liệu nhật ký.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-700">{formatDateTime(log.created_at)}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{log.username}</td>
                  <td className="px-4 py-3 text-slate-700">{log.role}</td>
                  <td className="px-4 py-3 text-slate-700">{getAuditActionLabel(log.action)}</td>
                  <td className="px-4 py-3 text-slate-700">{log.description}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AuditTable;
