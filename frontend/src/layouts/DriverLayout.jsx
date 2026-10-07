import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme, toggleSidebar } from '../features/ui/uiSlice';
import { logout } from '../features/auth/authSlice';
import { fetchNotifications } from '../features/notifications/notificationsSlice';
import { 
  Sun, Moon, Menu, LogOut, LayoutDashboard,
  CheckSquare, Landmark, Bell, User, Settings, Navigation
} from 'lucide-react';

export const DriverLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useSelector((state) => state.ui.theme);
  const sidebarOpen = useSelector((state) => state.ui.sidebarOpen);
  const { user } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notifications);

  React.useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const menuItems = [
    { name: 'Partner Dashboard', path: '/driver', icon: LayoutDashboard },
    { name: 'Ride Requests', path: '/driver/requests', icon: CheckSquare },
    { name: 'Earnings', path: '/driver/earnings', icon: Landmark },
    { name: 'Profile & Vehicle', path: '/driver/profile', icon: User },
    { name: 'Settings', path: '/driver/settings', icon: Settings },
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
              <span className="font-heading text-xl font-bold tracking-tight">Zippr</span>
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
              <div className="w-10 h-10 rounded-full bg-brand-indigo/10 dark:bg-brand-lime/10 flex items-center justify-center font-bold text-brand-indigo dark:text-brand-lime">
                {user?.name?.[0]?.toUpperCase() || 'P'}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold truncate">{user?.name || 'Partner'}</p>
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

          <div className="hidden lg:block text-sm font-semibold text-brand-gray-500">
            Role: <span className="text-brand-indigo dark:text-brand-lime uppercase">{user?.role} Partner</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Notification Bell */}
            <button
              className="relative p-3 rounded-xl bg-brand-gray-100 hover:bg-brand-gray-200 dark:bg-brand-gray-900 dark:hover:bg-brand-gray-800 transition-colors cursor-not-allowed opacity-70"
              aria-label="Notifications"
              title="Phase 10 Settings - Comming Soon for Drivers"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-brand-gray-100 dark:border-brand-gray-900" />
              )}
            </button>

            {/* Theme Toggle */}
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

export default DriverLayout;
