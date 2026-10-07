import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { Card } from '../../components/common';
import { Loader2, MapPin, Navigation, Bike, Car, CheckCircle, XCircle, Clock, Zap } from 'lucide-react';
import { cn } from '../../utils/cn';

const STATUS_CONFIG = {
  completed: { label: 'Completed',  icon: CheckCircle, color: 'text-green-600 dark:text-green-400',  bg: 'bg-green-100 dark:bg-green-500/15' },
  cancelled:  { label: 'Cancelled',  icon: XCircle,     color: 'text-red-500 dark:text-red-400',       bg: 'bg-red-100 dark:bg-red-500/15'    },
  ongoing:    { label: 'Ongoing',    icon: Zap,          color: 'text-brand-indigo dark:text-brand-lime', bg: 'bg-brand-indigo/10 dark:bg-brand-lime/10' },
  requested:  { label: 'Requested', icon: Clock,        color: 'text-orange-500',                      bg: 'bg-orange-100 dark:bg-orange-500/15' },
  accepted:   { label: 'Accepted',  icon: Clock,        color: 'text-blue-500',                        bg: 'bg-blue-100 dark:bg-blue-500/15'   },
};

const VEHICLE_ICON = { bike: Bike, auto: Car, cab: Car };

const formatDate = (iso) => new Date(iso).toLocaleDateString('en-IN', {
  day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
});

export const RideHistoryPage = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const LIMIT = 8;

  const loadRides = async (offset = 0) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/rides', { params: { limit: LIMIT, offset } });
      setRides(res.data.items);
      setTotal(res.data.total);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadRides(page * LIMIT); }, [page]);

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Ride History</h1>
        <p className="text-brand-gray-500 mt-1">{total} trips total</p>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-indigo dark:text-brand-lime" />
        </div>
      ) : rides.length === 0 ? (
        <Card className="py-20 text-center flex flex-col items-center gap-4">
          <Navigation className="w-12 h-12 text-brand-gray-300 dark:text-brand-gray-700" />
          <p className="font-bold text-lg text-brand-gray-500">No rides yet</p>
          <p className="text-sm text-brand-gray-400">Your completed trips will show up here.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {rides.map((ride) => {
            const cfg = STATUS_CONFIG[ride.status] || STATUS_CONFIG.requested;
            const StatusIcon = cfg.icon;
            const VIcon = VEHICLE_ICON[ride.vehicle_type] || Car;
            return (
              <Card key={ride.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-5 hover:shadow-premium transition-shadow">
                {/* Vehicle icon */}
                <div className="p-4 bg-brand-indigo/5 dark:bg-brand-lime/5 rounded-2xl shrink-0">
                  <VIcon className="w-7 h-7 text-brand-indigo dark:text-brand-lime" />
                </div>

                {/* Route info */}
                <div className="flex-1 min-w-0 flex flex-col gap-2">
                  <div className="flex flex-col gap-1.5 relative pl-4">
                    <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-brand-gray-200 dark:bg-brand-gray-700"></div>
                    <div className="flex items-center gap-2 relative z-10">
                      <div className="w-2.5 h-2.5 rounded-full bg-white ring-2 ring-brand-indigo dark:ring-brand-lime shrink-0"></div>
                      <p className="text-xs font-semibold text-brand-gray-500 truncate">
                        {ride.pickup_lat.toFixed(4)}, {ride.pickup_lng.toFixed(4)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 relative z-10">
                      <div className="w-2.5 h-2.5 rounded-sm bg-brand-indigo dark:bg-brand-lime shrink-0"></div>
                      <p className="text-xs font-semibold text-brand-gray-500 truncate">
                        {ride.drop_lat.toFixed(4)}, {ride.drop_lng.toFixed(4)}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-brand-gray-400">{formatDate(ride.requested_at)}</p>
                </div>

                {/* Right: status + fare */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={cn('flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full uppercase', cfg.bg, cfg.color)}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {cfg.label}
                  </span>
                  <p className="font-heading text-2xl font-bold text-brand-indigo dark:text-brand-lime">
                    ₹{ride.fare_estimate}
                  </p>
                  <p className="text-xs text-brand-gray-400">{ride.distance_km} km · {ride.vehicle_type}</p>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {total > LIMIT && (
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-5 py-2.5 rounded-xl border-2 border-brand-gray-200 dark:border-brand-gray-700 font-semibold text-sm disabled:opacity-40 hover:border-brand-indigo dark:hover:border-brand-lime transition-colors"
          >
            ← Previous
          </button>
          <span className="text-sm text-brand-gray-500 font-semibold">
            Page {page + 1} of {Math.ceil(total / LIMIT)}
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={(page + 1) * LIMIT >= total}
            className="px-5 py-2.5 rounded-xl border-2 border-brand-gray-200 dark:border-brand-gray-700 font-semibold text-sm disabled:opacity-40 hover:border-brand-indigo dark:hover:border-brand-lime transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default RideHistoryPage;
