import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const avatarLabel = (user?.username || 'U').trim().charAt(0).toUpperCase();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
        <div>
          <Link to="/" className="text-lg font-semibold tracking-tight text-slate-900">
            Quản lý khách hàng
          </Link>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex cursor-pointer items-center gap-3 rounded-full py-1.5 pl-1.5 pr-3 text-left transition hover:bg-slate-100"
            title="Tài khoản"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-semibold text-slate-700 shadow-sm">
              {avatarLabel}
            </span>
            <span className="max-w-[120px] truncate text-sm font-medium text-slate-800">
              {user?.username || 'Unknown'}
            </span>
          </button>

          {menuOpen ? (
            <div className="absolute right-0 mt-3 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
              <div className="border-b border-slate-100 px-4 py-4">
                <p className="text-sm font-semibold text-slate-900">
                  {user?.username || 'Không xác định'}
                </p>
                <p className="mt-1 text-sm text-slate-500">Vai trò: {user?.role || 'khách'}</p>
              </div>

              {user?.role === 'admin' ? (
                <div className="grid gap-2 px-3 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate('/security-tools');
                    }}
                    className="w-full cursor-pointer rounded-xl px-4 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Công cụ Test
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate('/audit-logs');
                    }}
                    className="w-full cursor-pointer rounded-xl px-4 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Nhật ký hệ thống
                  </button>
                </div>
              ) : null}

              <div className="border-t border-slate-100 p-3">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full cursor-pointer rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
