import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRidesList } from '../../features/admin/adminSlice';
import { Card } from '../../components/common';
import { Loader2 } from 'lucide-react';

export const RidesMonitor = () => {
  const dispatch = useDispatch();
  const { ridesList, loading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchRidesList({ limit: 50, offset: 0 }));
  }, [dispatch]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-500/20';
      case 'cancelled': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-500/20';
      case 'ongoing': return 'text-brand-lime bg-brand-indigo dark:text-brand-indigo dark:bg-brand-lime';
      default: return 'text-brand-indigo bg-brand-indigo/10 dark:text-brand-lime dark:bg-brand-lime/10';
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <div>
        <h1 className="font-heading text-3xl font-bold">Rides Monitor</h1>
        <p className="text-brand-gray-500 mt-1">Global feed of all active and past rides on the network.</p>
      </div>

      <Card padding="none" className="overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-brand-indigo dark:text-brand-lime" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-gray-50 dark:bg-brand-gray-900/50 border-b border-brand-indigo/5 dark:border-brand-gray-800">
                  <th className="p-4 font-semibold text-xs text-brand-gray-500 uppercase tracking-wider">Ride ID</th>
                  <th className="p-4 font-semibold text-xs text-brand-gray-500 uppercase tracking-wider">Type</th>
                  <th className="p-4 font-semibold text-xs text-brand-gray-500 uppercase tracking-wider">Status</th>
                  <th className="p-4 font-semibold text-xs text-brand-gray-500 uppercase tracking-wider">Distance</th>
                  <th className="p-4 font-semibold text-xs text-brand-gray-500 uppercase tracking-wider text-right">Fare / Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-indigo/5 dark:divide-brand-gray-800">
                {ridesList.map((ride) => (
                  <tr key={ride.id} className="hover:bg-brand-gray-50 dark:hover:bg-brand-gray-900/50 transition-colors">
                    <td className="p-4 text-sm font-mono text-brand-gray-500">
                      {ride.id.substring(0, 8)}
                    </td>
                    <td className="p-4 text-sm">
                      <span className="font-bold uppercase tracking-wider text-xs">{ride.vehicle_type}</span>
                    </td>
                    <td className="p-4 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${getStatusColor(ride.status)}`}>
                        {ride.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-semibold">
                      {ride.distance_km} km
                    </td>
                    <td className="p-4 text-sm text-right">
                      <div className="font-bold">₹{ride.fare_estimate}</div>
                      <div className="text-brand-gray-500 text-xs">{new Date(ride.requested_at).toLocaleTimeString()}</div>
                    </td>
                  </tr>
                ))}
                {ridesList.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-brand-gray-500">No rides logged yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default RidesMonitor;
