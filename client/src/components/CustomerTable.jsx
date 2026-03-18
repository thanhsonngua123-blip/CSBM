import { useNavigate } from 'react-router-dom';

function DataCell({ value, showRawDb }) {
  if (showRawDb) {
    return <span className="break-all font-mono text-xs text-slate-700">{value || '-'}</span>;
  }

  return <span className="text-slate-700">{value || '-'}</span>;
}

function CustomerTable({ customers, loading, deletingId, onDelete, showRawDb = false }) {
  const navigate = useNavigate();

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
              <th className="px-4 py-3 text-left font-medium text-slate-600">
                {showRawDb ? 'Số điện thoại (raw)' : 'Số điện thoại'}
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">
                {showRawDb ? 'CCCD / CMND (raw)' : 'CCCD / CMND'}
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">
                {showRawDb ? 'Địa chỉ (raw)' : 'Địa chỉ'}
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {customers.map((customer, index) => (
              <tr key={customer.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-500">{index + 1}</td>
                <td className="px-4 py-3 font-medium text-slate-900">{customer.full_name}</td>
                <td className="px-4 py-3 text-slate-700">{customer.email || '-'}</td>
                <td className="px-4 py-3">
                  <DataCell value={customer.phone} showRawDb={showRawDb} />
                </td>
                <td className="px-4 py-3">
                  <DataCell value={customer.id_number} showRawDb={showRawDb} />
                </td>
                <td className="px-4 py-3">
                  <DataCell value={customer.address} showRawDb={showRawDb} />
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CustomerTable;
