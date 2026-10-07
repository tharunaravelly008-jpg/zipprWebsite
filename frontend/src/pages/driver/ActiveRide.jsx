import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateActiveRideStatus } from '../../features/driver/driverSlice';
import { RideMap } from '../../components/map/RideMap';
import { Button } from '../../components/common';
import { Navigation, Phone, MessageSquare } from 'lucide-react';
import { getTrackingWsUrl } from '../../utils/ws';

// Linearly interpolates between two values by factor t
const lerp = (a, b, t) => a + (b - a) * t;

export const ActiveRide = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { activeRide, loading } = useSelector((state) => state.driver);

  const [driverCoords, setDriverCoords] = useState(null);
  const wsRef = useRef(null);
  const intervalRef = useRef(null);
  // Mutable ref for driver position (avoids stale closures in setInterval)
  const posRef = useRef(null);

  useEffect(() => {
    if (!activeRide) {
      navigate('/driver');
    }
  }, [activeRide, navigate]);

  // WebSocket + GPS simulation effect
  useEffect(() => {
    if (!activeRide) return;

    const pickup = [activeRide.pickup_lat, activeRide.pickup_lng];
    const drop = [activeRide.drop_lat, activeRide.drop_lng];

    // Start near pickup
    posRef.current = { lat: pickup[0], lng: pickup[1] };
    setDriverCoords([posRef.current.lat, posRef.current.lng]);

    // Connect to WebSocket room for this ride
    const ws = new WebSocket(getTrackingWsUrl(activeRide.id));
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[Tracking] Driver WS connected for ride:', activeRide.id);

      // Determine target based on ride status
      const target = (activeRide.status === 'accepted' || activeRide.status === 'arrived')
        ? pickup : drop;

      let t = 0;
      // Broadcast simulated position every 2 seconds
      intervalRef.current = setInterval(() => {
        t = Math.min(t + 0.04, 1); // advance ~4% each tick → ~25s to complete
        const newLat = lerp(posRef.current.lat, target[0], t);
        const newLng = lerp(posRef.current.lng, target[1], t);
        posRef.current = { lat: newLat, lng: newLng };
        setDriverCoords([newLat, newLng]);

        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ lat: newLat, lng: newLng }));
        }
      }, 2000);
    };

    ws.onerror = (e) => console.error('[Tracking] WS error', e);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [activeRide?.id, activeRide?.status]);

  if (!activeRide) return null;

  const getActionConfig = () => {
    switch (activeRide.status) {
      case 'accepted': return { text: 'Mark as Arrived', next: 'arrived' };
      case 'arrived':  return { text: 'Start Trip',      next: 'ongoing' };
      case 'ongoing':  return { text: 'Complete Trip',   next: 'completed', success: true };
      default:         return { text: 'Processing...',   next: null };
    }
  };

  const action = getActionConfig();

  const handleStatusUpdate = async (newStatus) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (wsRef.current) wsRef.current.close();
    await dispatch(updateActiveRideStatus({ rideId: activeRide.id, status: newStatus })).unwrap();
    // If completed, navigate back to driver home
    if (newStatus === 'completed') navigate('/driver');
  };

  return (
    <div className="relative h-[calc(100vh-80px)] -m-6 flex overflow-hidden bg-brand-light dark:bg-brand-dark text-brand-indigo dark:text-brand-light">

      {/* Background Map */}
      <div className="absolute inset-0 z-0">
        <RideMap
          pickupCoords={[activeRide.pickup_lat, activeRide.pickup_lng]}
          dropCoords={[activeRide.drop_lat, activeRide.drop_lng]}
          driverCoords={driverCoords}
        />
      </div>

      {/* Floating Control Panel */}
      <div className="relative z-10 w-full md:w-[380px] mt-auto md:mt-0 md:h-full flex flex-col pointer-events-none p-4 sm:p-6">
        <div className="pointer-events-auto flex flex-col max-h-[85vh] md:max-h-full overflow-hidden rounded-3xl shadow-2xl backdrop-blur-xl bg-white/85 dark:bg-brand-dark/85 border border-white/20 dark:border-brand-light/10">

          {/* Header */}
          <div className="p-5 bg-brand-indigo text-brand-lime dark:bg-brand-lime dark:text-brand-indigo rounded-t-3xl">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold uppercase tracking-widest bg-black/15 px-2 py-1 rounded-md">
                {activeRide.status}
              </span>
              <span className="font-bold text-lg">₹{(activeRide.fare_estimate * 0.8).toFixed(2)}</span>
            </div>
            <h2 className="font-heading text-xl font-bold flex items-center gap-2">
              <Navigation className="w-5 h-5 rotate-45" /> Active Trip
            </h2>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
            {/* Rider info */}
            <div className="flex items-center justify-between border-b border-brand-indigo/5 dark:border-brand-light/5 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-brand-indigo/10 dark:bg-brand-lime/10 rounded-full flex items-center justify-center font-bold text-brand-indigo dark:text-brand-lime">
                  R
                </div>
                <div>
                  <p className="font-bold">Rider #{activeRide.rider_id.substring(0, 6)}</p>
                  <p className="text-xs text-brand-gray-500">{activeRide.distance_km} km trip</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 rounded-xl bg-brand-indigo/5 text-brand-indigo dark:bg-brand-lime/10 dark:text-brand-lime">
                  <Phone className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-xl bg-brand-indigo/5 text-brand-indigo dark:bg-brand-lime/10 dark:text-brand-lime">
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Route */}
            <div className="flex flex-col gap-3 relative pl-4">
              <div className="absolute left-[7px] top-3 bottom-3 w-0.5 bg-brand-gray-200 dark:bg-brand-gray-700"></div>
              <div className="flex items-start gap-3 relative z-10 p-3 rounded-xl bg-brand-gray-50 dark:bg-brand-gray-900">
                <div className="w-3.5 h-3.5 rounded-full bg-white ring-4 ring-brand-gray-200 shrink-0 mt-0.5 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-indigo dark:bg-brand-lime"></div>
                </div>
                <div>
                  <p className="text-xs text-brand-gray-500 font-semibold uppercase tracking-wider mb-0.5">Pickup</p>
                  <p className="text-sm font-semibold">{activeRide.pickup_lat.toFixed(4)}, {activeRide.pickup_lng.toFixed(4)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 relative z-10 p-3 rounded-xl bg-brand-gray-50 dark:bg-brand-gray-900">
                <div className="w-3.5 h-3.5 rounded-sm bg-white ring-4 ring-brand-gray-200 shrink-0 mt-0.5 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-brand-lime dark:bg-brand-indigo"></div>
                </div>
                <div>
                  <p className="text-xs text-brand-gray-500 font-semibold uppercase tracking-wider mb-0.5">Drop-off</p>
                  <p className="text-sm font-semibold">{activeRide.drop_lat.toFixed(4)}, {activeRide.drop_lng.toFixed(4)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="p-5 border-t border-brand-indigo/5 dark:border-brand-light/5">
            <Button
              id="driver-action-btn"
              fullWidth
              size="lg"
              onClick={() => handleStatusUpdate(action.next)}
              disabled={loading || !action.next}
              isLoading={loading}
              className={action.success ? 'bg-green-500 hover:bg-green-600 text-white dark:bg-green-500 dark:hover:bg-green-600 dark:text-white border-none' : ''}
            >
              {action.text}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveRide;
