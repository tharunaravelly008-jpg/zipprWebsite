import React, { lazy, Suspense, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser } from '../features/auth/authSlice';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import UserDashboardLayout from '../layouts/UserDashboardLayout';
import DriverLayout from '../layouts/DriverLayout';
import AdminLayout from '../layouts/AdminLayout';

// Public Pages
const Home = lazy(() => import('../pages/public/Home'));
const Login = lazy(() => import('../pages/public/Login'));
const Register = lazy(() => import('../pages/public/Register'));
const About = lazy(() => import('../pages/public/About'));
const FAQ = lazy(() => import('../pages/public/FAQ'));
const Contact = lazy(() => import('../pages/public/Contact'));
const Blog = lazy(() => import('../pages/public/Blog'));

// Rider Pages
const UserDashboard = lazy(() => import('../pages/user/Dashboard'));
const BookRide = lazy(() => import('../pages/user/BookRide'));
const RiderActiveTrip = lazy(() => import('../pages/user/RiderActiveTrip'));
const WalletPage = lazy(() => import('../pages/user/Wallet'));
const NotificationsPage = lazy(() => import('../pages/user/Notifications'));
const ProfilePage = lazy(() => import('../pages/user/Profile'));
const SettingsPage = lazy(() => import('../pages/user/Settings'));
const RideHistoryPage = lazy(() => import('../pages/user/RideHistory'));

// Dummy components for non-scaffolded routes (now only driver-specific dummies remain)
const DummyWallet = () => <div className="text-center py-10 font-bold">Rider Digital Wallet (Phase 9 Payments)</div>;

// Partner Pages
const DriverDashboard = lazy(() => import('../pages/driver/Dashboard'));
const ActiveRide = lazy(() => import('../pages/driver/ActiveRide'));
const DummyRequests = () => <div className="text-center py-10 font-bold">Incoming Commuter Requests (Phase 6 Driver)</div>;
const DummyEarnings = () => <div className="text-center py-10 font-bold">Driver Digital Balance Ledger (Phase 6 Driver)</div>;


// Admin Pages
const AdminOverview = lazy(() => import('../pages/admin/Overview'));
const ManageUsers = lazy(() => import('../pages/admin/ManageUsers'));
const ManageDrivers = lazy(() => import('../pages/admin/ManageDrivers'));
const RidesMonitor = lazy(() => import('../pages/admin/RidesMonitor'));


// Not Found
const NotFound = lazy(() => import('../pages/NotFound'));

// Suspense Loader
const PageLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center bg-brand-light dark:bg-brand-dark">
    <div className="animate-pulse flex flex-col items-center">
      <div className="w-10 h-10 rounded-full bg-brand-indigo dark:bg-brand-lime mb-3"></div>
      <p className="text-xs text-brand-gray-500 font-semibold uppercase">Loading...</p>
    </div>
  </div>
);

export const AppRoutes = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  // Hydrate user profile if we have a token but no user object
  useEffect(() => {
    if (isAuthenticated && !user && !loading) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, isAuthenticated, user, loading]);

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          
          {/* Public marketing pages */}
          <Route path="about" element={<About />} />
          <Route path="blog" element={<Blog />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="contact" element={<Contact />} />
        </Route>

        {/* Rider Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['user']}>
                <UserDashboardLayout />
              </RoleRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<UserDashboard />} />
          <Route path="book" element={<BookRide />} />
          <Route path="trip/:rideId" element={<RiderActiveTrip />} />
          <Route path="history" element={<RideHistoryPage />} />
          <Route path="wallet" element={<WalletPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Partner Protected Routes */}
        <Route
          path="/driver"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['driver']}>
                <DriverLayout />
              </RoleRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<DriverDashboard />} />
          <Route path="active" element={<ActiveRide />} />
          <Route path="requests" element={<DummyRequests />} />
          <Route path="earnings" element={<DummyEarnings />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Admin Protected Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['admin']}>
                <AdminLayout />
              </RoleRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminOverview />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="drivers" element={<ManageDrivers />} />
          <Route path="rides" element={<RidesMonitor />} />
          <Route path="support" element={<div className="text-center py-10 font-bold">Support Queue Tickets (Phase 7 Admin)</div>} />
          <Route path="blog" element={<div className="text-center py-10 font-bold">Manage Blog Posts List (Phase 7 Admin)</div>} />
          <Route path="settings" element={<div className="text-center py-10 font-bold">Base Fare Multipliers (Phase 7 Admin)</div>} />
        </Route>

        {/* Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
