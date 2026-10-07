import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAnalyticsSummary } from '../../features/admin/adminSlice';
import { Card } from '../../components/common';
import { Users, Car, Map, DollarSign, ArrowUpRight, Loader2 } from 'lucide-react';

export const AdminOverview = () => {
  const dispatch = useDispatch();
  const { summary, loading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchAnalyticsSummary());
  }, [dispatch]);

  const stats = [
    { label: 'Total Riders', value: summary.total_riders, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Total Partners', value: summary.total_drivers, icon: Car, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { label: 'Active Rides', value: summary.active_rides, icon: Map, color: 'text-brand-lime', bg: 'bg-brand-lime/10' },
    { label: 'Total Earnings', value: `₹${summary.total_earnings.toFixed(2)}`, icon: DollarSign, color: 'text-green-500', bg: 'bg-green-500/10' },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="font-heading text-3xl font-bold">Control Board Overview</h1>
          <p className="text-brand-gray-500 mt-1">Real-time platform health and metrics.</p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-brand-indigo dark:text-brand-lime" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card key={idx} className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-brand-gray-400" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold tracking-tight">{stat.value}</h3>
                  <p className="text-sm font-semibold text-brand-gray-500 mt-1">{stat.label}</p>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Placeholder for charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        <Card className="min-h-[300px] flex items-center justify-center border-dashed border-2">
          <p className="text-brand-gray-400 font-bold">Revenue Chart Placeholder</p>
        </Card>
        <Card className="min-h-[300px] flex items-center justify-center border-dashed border-2">
          <p className="text-brand-gray-400 font-bold">Ride Demographics Placeholder</p>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverview;
