import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

function MainLayout() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#e0f2fe_0,#f8fafc_30%,#f8fafc_100%)]">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6 md:py-8">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
