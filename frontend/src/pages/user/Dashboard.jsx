import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { MapPin, Navigation, Wallet, Clock, ArrowUpRight, Loader2 } from 'lucide-react';
import { fetchRideHistory } from '../../features/ride/rideSlice';

export const UserDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { balance } = useSelector((state) => state.wallet);
  const { history, loading } = useSelector((state) => state.ride);

  useEffect(() => {
    dispatch(fetchRideHistory({ limit: 3, offset: 0 }));
  }, [dispatch]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      {/* Welcome Card */}
      <div className="p-8 rounded-3xl bg-gradient-to-tr from-brand-indigo to-brand-indigo/80 text-brand-lime flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-premium">
        <div>
          <h2 className="font-heading text-3xl font-bold mb-2">Hello, {user?.name?.split(' ')[0] || 'Rider'}!</h2>
          <p className="text-white/80 text-sm">Where would you like to travel today?</p>
        </div>
        <Link
          to="/dashboard/book"
          className="px-6 py-4 bg-brand-lime hover:bg-brand-lime/90 text-brand-indigo rounded-2xl font-bold flex items-center gap-2 self-start transition-all hover:shadow"
        >
          <Navigation className="w-5 h-5 rotate-45" />
          Book a New Ride
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Wallet Widget */}
        <div className="p-6 rounded-2xl bg-white dark:bg-brand-gray-900 border border-brand-indigo/5 dark:border-brand-gray-800 shadow-premium flex flex-col justify-between min-h-[180px]">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-brand-gray-500">Wallet Balance</span>
            <div className="p-2 bg-brand-indigo/5 dark:bg-brand-lime/5 rounded-lg text-brand-indigo dark:text-brand-lime">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold tracking-tight mb-1">₹{balance.toFixed(2)}</h3>
            <p className="text-xs text-brand-gray-500">Available credits in your Zippr wallet</p>
          </div>
          <Link
            to="/dashboard/wallet"
            className="flex items-center gap-1.5 text-sm font-semibold text-brand-indigo dark:text-brand-lime hover:underline mt-2 self-start"
          >
            Manage Wallet
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Quick Location Shortcuts */}
        <div className="p-6 rounded-2xl bg-white dark:bg-brand-gray-900 border border-brand-indigo/5 dark:border-brand-gray-800 shadow-premium flex flex-col gap-4 md:col-span-2">
          <h3 className="text-lg font-bold">Saved Addresses</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button className="flex items-start gap-3 p-4 rounded-xl border border-brand-gray-100 dark:border-brand-gray-800 hover:bg-brand-light dark:hover:bg-brand-gray-800 transition-colors text-left group">
              <div className="p-2 bg-brand-indigo/5 dark:bg-brand-lime/5 rounded-lg text-brand-indigo dark:text-brand-lime group-hover:scale-110 transition-transform">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold">Home</p>
                <p className="text-xs text-brand-gray-500 truncate max-w-[180px]">Greenwood Apts, Sector 45</p>
              </div>
            </button>

            <button className="flex items-start gap-3 p-4 rounded-xl border border-brand-gray-100 dark:border-brand-gray-800 hover:bg-brand-light dark:hover:bg-brand-gray-800 transition-colors text-left group">
              <div className="p-2 bg-brand-indigo/5 dark:bg-brand-lime/5 rounded-lg text-brand-indigo dark:text-brand-lime group-hover:scale-110 transition-transform">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold">Office</p>
                <p className="text-xs text-brand-gray-500 truncate max-w-[180px]">Innovate Hub, Phase 3</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Rides List */}
      <div className="p-6 rounded-2xl bg-white dark:bg-brand-gray-900 border border-brand-indigo/5 dark:border-brand-gray-800 shadow-premium">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold">Recent Rides</h3>
          <Link to="/dashboard/history" className="text-sm font-semibold text-brand-indigo dark:text-brand-lime hover:underline">
            View All
          </Link>
        </div>

        {loading ? (
          <div className="py-8 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-brand-gray-400" />
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col gap-4 text-center py-8 text-brand-gray-500">
            <Clock className="w-8 h-8 mx-auto stroke-1" />
            <p className="text-sm">No recent rides found. Book your first ride to get started!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {history.map((ride) => (
              <div key={ride.id} className="flex items-center justify-between p-4 rounded-xl border border-brand-gray-100 dark:border-brand-gray-800">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl font-bold text-xs uppercase ${
                    ride.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' :
                    ride.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' :
                    'bg-brand-lime/20 text-brand-indigo dark:text-brand-lime'
                  }`}>
                    {ride.vehicle_type}
                  </div>
                  <div>
                    <p className="text-sm font-bold capitalize">{ride.status}</p>
                    <p className="text-xs text-brand-gray-500">{formatDate(ride.requested_at)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">₹{ride.fare_final || ride.fare_estimate}</p>
                  <p className="text-xs text-brand-gray-500">{ride.distance_km} km</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
