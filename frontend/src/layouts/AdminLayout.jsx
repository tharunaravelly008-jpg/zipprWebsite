import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme, toggleSidebar } from '../features/ui/uiSlice';
import { logout } from '../features/auth/authSlice';
import { 
  Sun, Moon, Menu, LogOut, LayoutDashboard, Users,
  Car, Map, Shield, HelpCircle, FileText, Settings, Navigation
} from 'lucide-react';

export const AdminLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useSelector((state) => state.ui.theme);
  const sidebarOpen = useSelector((state) => state.ui.sidebarOpen);
  const { user } = useSelector((state) => state.auth);

  const menuItems = [
    { name: 'Admin Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Manage Users', path: '/admin/users', icon: Users },
    { name: 'Manage Partners', path: '/admin/drivers', icon: Car },
    { name: 'Rides Monitor', path: '/admin/rides', icon: Map },
    { name: 'Support Inbox', path: '/admin/support', icon: HelpCircle },
    { name: 'Blog CMS', path: '/admin/blog', icon: FileText },
    { name: 'Platform Settings', path: '/admin/settings', icon: Settings },
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <div className="min-h-screen flex bg-brand-light dark:bg-brand-dark text-brand-indigo dark:text-brand-light">
      {/* Sidebar Drawer */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-brand-dark border-r border-brand-indigo/5 dark:border-brand-light/5 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col justify-between p-6">
          <div>
            <Link to="/" className="flex items-center gap-3 mb-10 group">
              <div className="w-9 h-9 rounded-xl bg-brand-indigo dark:bg-brand-lime flex items-center justify-center">
                <Navigation className="w-5 h-5 text-brand-lime dark:text-brand-indigo rotate-45" />
              </div>
              <span className="font-heading text-xl font-bold tracking-tight">Zippr Control</span>
            </Link>

            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${isActive ? 'bg-brand-indigo text-brand-lime dark:bg-brand-lime dark:text-brand-indigo' : 'hover:bg-brand-gray-100 dark:hover:bg-brand-gray-900'}`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 px-4 py-3 border-t border-brand-indigo/5 dark:border-brand-light/5 pt-6">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center font-bold text-red-600">
                A
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold truncate">{user?.name || 'Administrator'}</p>
                <p className="text-xs text-brand-gray-500 truncate">{user?.email}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Topbar */}
        <header className="h-20 flex items-center justify-between px-6 bg-white dark:bg-brand-dark border-b border-brand-indigo/5 dark:border-brand-light/5">
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="p-2 rounded-xl bg-brand-gray-100 dark:bg-brand-gray-900 hover:bg-brand-gray-200 lg:hidden"
            aria-label="Toggle navigation"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="hidden lg:block text-sm font-semibold text-red-500 uppercase flex items-center gap-1.5">
            <Shield className="w-4 h-4" />
            Superuser Control Panel
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => dispatch(toggleTheme())}
              className="p-3 rounded-xl bg-brand-gray-100 hover:bg-brand-gray-200 dark:bg-brand-gray-900 dark:hover:bg-brand-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-grow p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
