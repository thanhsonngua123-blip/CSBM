import { Link, useLocation } from 'react-router-dom';

function ForbiddenPage() {
  const location = useLocation();
  const requestedPath = location.state?.from;

  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
      <div className="w-full max-w-2xl rounded-3xl border border-red-200 bg-white/95 p-8 shadow-sm backdrop-blur">
        <div className="inline-flex rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-red-700">
          Error 403
        </div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
          Không có quyền truy cập
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Tài khoản của bạn không được phép truy cập trang này. Nếu bạn cần quyền cao hơn,
          hãy liên hệ quản trị viên hệ thống.
        </p>
        {requestedPath ? (
          <p className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Trang bị từ chối: <span className="font-medium text-slate-900">{requestedPath}</span>
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/"
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Quay về trang chủ
          </Link>
          <Link
            to="/customers"
            className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Xem danh sách khách hàng
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForbiddenPage;
