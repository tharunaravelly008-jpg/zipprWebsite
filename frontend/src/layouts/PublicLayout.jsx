import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../features/ui/uiSlice';
import { logout } from '../features/auth/authSlice';
import { Sun, Moon, Navigation, LogOut } from 'lucide-react';

export const PublicLayout = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.ui.theme);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen flex flex-col bg-brand-light text-brand-indigo dark:bg-brand-dark dark:text-brand-light">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 glass-panel shadow-premium dark:shadow-premium-dark border-b border-brand-indigo/5 dark:border-brand-light/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-brand-indigo dark:bg-brand-lime flex items-center justify-center transition-transform group-hover:scale-105">
              <Navigation className="w-6 h-6 text-brand-lime dark:text-brand-indigo rotate-45" />
            </div>
            <span className="font-heading text-2xl font-bold tracking-tight text-brand-indigo dark:text-brand-light">
              Zippr
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 font-medium">
            <Link to="/" className="hover:text-brand-lime transition-colors">Home</Link>
            <Link to="/about" className="hover:text-brand-lime transition-colors">About</Link>
            <Link to="/blog" className="hover:text-brand-lime transition-colors">Blog</Link>
            <Link to="/faq" className="hover:text-brand-lime transition-colors">FAQ</Link>
            <Link to="/contact" className="hover:text-brand-lime transition-colors">Contact</Link>
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={() => dispatch(toggleTheme())}
              className="p-3 rounded-xl bg-brand-gray-100 hover:bg-brand-gray-200 dark:bg-brand-gray-900 dark:hover:bg-brand-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to={user?.role === 'admin' ? '/admin' : user?.role === 'driver' ? '/driver' : '/dashboard'}
                  className="px-5 py-2.5 rounded-xl bg-brand-indigo hover:bg-brand-indigo/90 text-brand-lime dark:bg-brand-lime dark:hover:bg-brand-lime/90 dark:text-brand-indigo font-semibold text-sm transition-all hover:shadow-premium"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => dispatch(logout())}
                  className="p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2.5 text-sm font-semibold hover:text-brand-lime transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 rounded-xl bg-brand-indigo hover:bg-brand-indigo/90 text-brand-lime dark:bg-brand-lime dark:hover:bg-brand-lime/90 dark:text-brand-indigo font-semibold text-sm transition-all hover:shadow-premium"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-brand-dark text-brand-gray-400 border-t border-brand-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-lime flex items-center justify-center">
                  <Navigation className="w-5 h-5 text-brand-indigo rotate-45" />
                </div>
                <span className="font-heading text-xl font-bold tracking-tight text-brand-light">
                  Zippr
                </span>
              </div>
              <p className="text-sm">Premium ride booking, your way. Quick bike, auto, and cab services in your city.</p>
            </div>
            <div>
              <h4 className="font-heading text-brand-light font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about" className="hover:text-brand-lime transition-colors">About Us</Link></li>
                <li><Link to="/blog" className="hover:text-brand-lime transition-colors">Blog</Link></li>
                <li><a href="#" className="hover:text-brand-lime transition-colors">Safety First</a></li>
                <li><a href="#" className="hover:text-brand-lime transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-heading text-brand-light font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/faq" className="hover:text-brand-lime transition-colors">FAQs</Link></li>
                <li><Link to="/contact" className="hover:text-brand-lime transition-colors">Contact Support</Link></li>
                <li><a href="#" className="hover:text-brand-lime transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-brand-lime transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-heading text-brand-light font-bold mb-4">Download</h4>
              <p className="text-sm mb-4">Get the latest mobile experience for riders and partners.</p>
              <div className="flex gap-2">
                <a href="#" className="px-4 py-2 bg-brand-gray-900 hover:bg-brand-gray-800 rounded-lg text-xs font-semibold text-brand-light text-center flex-grow transition-colors">App Store</a>
                <a href="#" className="px-4 py-2 bg-brand-gray-900 hover:bg-brand-gray-800 rounded-lg text-xs font-semibold text-brand-light text-center flex-grow transition-colors">Play Store</a>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-brand-gray-900 text-center text-xs">
            &copy; {new Date().getFullYear()} Zippr Inc. All rights reserved. Made with &hearts;
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
