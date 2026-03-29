import { useNavigate } from 'react-router-dom';

function buildIssueMap(customer) {
  const map = {};
  const issues = Array.isArray(customer.integrity_issues) ? customer.integrity_issues : [];

  for (let i = 0; i < issues.length; i = i + 1) {
    map[issues[i].field] = issues[i];
  }

  return map;
}

function DataCell({ value, issue }) {
  if (issue) {
    return (
      <div>
        <span className="text-sm font-medium text-red-700">{value || '-'}</span>
        <p className="mt-1 text-xs text-red-600">{issue.label} bị thay đổi</p>
      </div>
    );
  }

  return <span className="text-slate-700">{value || '-'}</span>;
}

function CustomerTable({ customers, loading, deletingId, onDelete, pagination }) {
  const navigate = useNavigate();
  const rowOffset = Math.max((pagination?.page || 1) - 1, 0) * (pagination?.limit || 10);

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        Đang tải dữ liệu...
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-base font-medium text-slate-700">Chưa có khách hàng nào</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1180px] text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-600">STT</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Họ tên</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Email</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Số điện thoại</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">CCCD / CMND</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Địa chỉ</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {customers.map((customer, index) => {
              const issueMap = buildIssueMap(customer);
              const issueLabels = Array.isArray(customer.integrity_issues)
                ? customer.integrity_issues.map((issue) => issue.label)
                : [];

              return (
                <tr
                  key={customer.id}
                  className={
                    customer.has_integrity_issue ? 'bg-red-50 hover:bg-red-50' : 'hover:bg-slate-50'
                  }
                >
                  <td className="px-4 py-3 text-slate-500">{rowOffset + index + 1}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{customer.full_name}</p>
                    {customer.has_integrity_issue ? (
                      <p className="mt-1 text-xs text-red-600">
                        Trường bị thay đổi: {issueLabels.join(', ')}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <DataCell value={customer.email} issue={issueMap.email || null} />
                  </td>
                  <td className="px-4 py-3">
                    <DataCell value={customer.phone} issue={issueMap.phone || null} />
                  </td>
                  <td className="px-4 py-3">
                    <DataCell value={customer.id_number} issue={issueMap.id_number || null} />
                  </td>
                  <td className="px-4 py-3">
                    <DataCell value={customer.address} issue={issueMap.address || null} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/customers/${customer.id}`)}
                        className="cursor-pointer rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        Chi tiết
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/customers/${customer.id}/edit`)}
                        className="cursor-pointer rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(customer)}
                        disabled={deletingId === customer.id}
                        className="cursor-pointer rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingId === customer.id ? 'Đang xóa...' : 'Xóa'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CustomerTable;
