import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  toggleOnlineStatus, fetchAvailableRequests, acceptRideRequest 
} from '../../features/driver/driverSlice';
import { Card, Button } from '../../components/common';
import { Loader2, DollarSign, Clock, CheckCircle } from 'lucide-react';

export const DriverDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { isOnline, availableRequests, loading, activeRide } = useSelector((state) => state.driver);

  useEffect(() => {
    if (activeRide) {
      navigate('/driver/active');
    }
  }, [activeRide, navigate]);

  useEffect(() => {
    let interval;
    if (isOnline && !activeRide) {
      dispatch(fetchAvailableRequests({ limit: 10, offset: 0 }));
      interval = setInterval(() => {
        dispatch(fetchAvailableRequests({ limit: 10, offset: 0 }));
      }, 5000); 
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOnline, activeRide, dispatch]);

  const handleAccept = async (id) => {
    await dispatch(acceptRideRequest(id)).unwrap();
    navigate('/driver/active');
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8">
      
      {/* Online Toggle Header */}
      <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-white dark:bg-brand-gray-900 rounded-3xl border border-brand-indigo/5 dark:border-brand-gray-800 shadow-premium gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold">Driver Portal</h2>
          <p className="text-brand-gray-500 text-sm">
            {isOnline ? 'You are online and receiving requests.' : 'Go online to start earning.'}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {isOnline && (
            <div className="flex items-center gap-2 text-green-600 dark:text-brand-lime font-bold text-sm bg-green-50 dark:bg-brand-lime/10 px-4 py-2 rounded-full">
              <span className="w-2.5 h-2.5 bg-green-500 dark:bg-brand-lime rounded-full animate-pulse"></span>
              ONLINE
            </div>
          )}
          <button 
            onClick={() => dispatch(toggleOnlineStatus())}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
              isOnline ? 'bg-brand-indigo dark:bg-brand-lime' : 'bg-brand-gray-300 dark:bg-brand-gray-700'
            }`}
          >
            <span 
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                isOnline ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between text-brand-gray-500 mb-4">
            <span className="text-sm font-semibold">Today's Earnings</span>
            <DollarSign className="w-5 h-5 text-brand-indigo dark:text-brand-lime" />
          </div>
          <h3 className="text-3xl font-bold tracking-tight">₹0.00</h3>
        </Card>
        <Card className="flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between text-brand-gray-500 mb-4">
            <span className="text-sm font-semibold">Trips Completed</span>
            <CheckCircle className="w-5 h-5 text-brand-indigo dark:text-brand-lime" />
          </div>
          <h3 className="text-3xl font-bold tracking-tight">0</h3>
        </Card>
        <Card className="flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between text-brand-gray-500 mb-4">
            <span className="text-sm font-semibold">Online Time</span>
            <Clock className="w-5 h-5 text-brand-indigo dark:text-brand-lime" />
          </div>
          <h3 className="text-3xl font-bold tracking-tight">0h 0m</h3>
        </Card>
      </div>

      {/* Available Requests Queue */}
      <div className="flex flex-col gap-4">
        <h3 className="font-heading text-xl font-bold flex items-center gap-2">
          Incoming Requests
          {loading && isOnline && <Loader2 className="w-4 h-4 animate-spin text-brand-gray-400" />}
        </h3>

        {!isOnline ? (
          <div className="p-12 text-center bg-brand-gray-50 dark:bg-brand-gray-900 rounded-3xl border border-dashed border-brand-gray-300 dark:border-brand-gray-800">
            <p className="text-brand-gray-500 font-semibold">You are currently offline.</p>
            <p className="text-sm text-brand-gray-400 mt-2">Toggle the switch above to start receiving ride requests.</p>
          </div>
        ) : availableRequests.length === 0 ? (
          <div className="p-12 text-center bg-brand-gray-50 dark:bg-brand-gray-900 rounded-3xl border border-dashed border-brand-indigo/20 dark:border-brand-lime/20 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-40 h-40 bg-brand-indigo/5 dark:bg-brand-lime/5 rounded-full animate-ping"></div>
            </div>
            <p className="text-brand-indigo dark:text-brand-lime font-bold relative z-10">Scanning for nearby riders...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {availableRequests.map((req) => (
              <Card key={req.id} className="flex flex-col md:flex-row justify-between items-center gap-6 hover:border-brand-indigo/30 transition-colors">
                
                <div className="flex-1 w-full space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-3 py-1 bg-brand-indigo/10 dark:bg-brand-lime/10 text-brand-indigo dark:text-brand-lime rounded-md uppercase tracking-wider">
                      {req.vehicle_type} Request
                    </span>
                    <span className="text-brand-gray-500 text-xs font-semibold">
                      {new Date(req.requested_at).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <div className="flex flex-col gap-2 relative">
                    <div className="absolute left-[7px] top-4 bottom-4 w-0.5 bg-brand-gray-200 dark:bg-brand-gray-700 z-0"></div>
                    
                    <div className="flex items-center gap-3 relative z-10">
                      <div className="w-4 h-4 rounded-full bg-white ring-4 ring-brand-gray-100 flex items-center justify-center shrink-0">
                        <div className="w-2 h-2 rounded-full bg-brand-indigo dark:bg-brand-lime"></div>
                      </div>
                      <p className="text-sm font-semibold truncate text-brand-gray-600 dark:text-brand-gray-300">
                        Lat: {req.pickup_lat.toFixed(4)}, Lng: {req.pickup_lng.toFixed(4)}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3 relative z-10">
                      <div className="w-4 h-4 rounded-sm bg-white ring-4 ring-brand-gray-100 flex items-center justify-center shrink-0">
                        <div className="w-2 h-2 bg-brand-lime dark:bg-brand-indigo"></div>
                      </div>
                      <p className="text-sm font-semibold truncate text-brand-gray-600 dark:text-brand-gray-300">
                        Lat: {req.drop_lat.toFixed(4)}, Lng: {req.drop_lng.toFixed(4)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-auto flex flex-col items-center md:items-end gap-3 min-w-[150px]">
                  <div className="text-center md:text-right">
                    <p className="text-sm text-brand-gray-500 font-semibold mb-1">Est. Payout</p>
                    <p className="font-heading text-3xl font-bold text-brand-indigo dark:text-brand-lime">
                      ₹{(req.fare_estimate * 0.8).toFixed(2)}
                    </p>
                    <p className="text-xs text-brand-gray-400 mt-1">{req.distance_km} km distance</p>
                  </div>
                  <Button 
                    fullWidth 
                    onClick={() => handleAccept(req.id)}
                    disabled={loading}
                  >
                    Accept Ride
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverDashboard;
