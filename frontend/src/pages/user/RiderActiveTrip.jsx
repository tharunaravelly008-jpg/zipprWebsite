import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { submitRideRating } from '../../features/ride/rideSlice';
import { RatingModal } from '../../components/domain/RatingModal';
import { Navigation, Loader2, CheckCircle } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { getTrackingWsUrl } from '../../utils/ws';

/**
 * RiderActiveTrip — shown when a ride is accepted and a driver is en route.
 * Subscribes to the WebSocket room for this ride and renders the driver
 * car marker moving in real-time on the Leaflet map.
 */
export const RiderActiveTrip = () => {
  const navigate = useNavigate();
  const { rideId } = useParams();

  const dispatch = useDispatch();
  const [ride, setRide] = useState(null);
  const [driverCoords, setDriverCoords] = useState(null);
  const [statusMsg, setStatusMsg] = useState('Driver is on the way...');
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const wsRef = useRef(null);
  const pollRef = useRef(null);

  // Fetch ride details
  useEffect(() => {
    const loadRide = async () => {
      try {
        const res = await axiosInstance.get(`/rides/${rideId}`);
        setRide(res.data);
      } catch (err) {
        console.error('Failed to load ride', err);
        navigate('/dashboard');
      }
    };
    if (rideId) loadRide();
  }, [rideId]);

  // Poll for ride status updates (so UI reflects driver-driven changes)
  useEffect(() => {
    if (!ride) return;

    const poll = async () => {
      try {
        const res = await axiosInstance.get(`/rides/${rideId}`);
        setRide(res.data);
        const s = res.data.status;
        if (s === 'accepted') setStatusMsg('Driver is on the way...');
        if (s === 'arrived')  setStatusMsg('Driver has arrived at pickup!');
        if (s === 'ongoing')  setStatusMsg('You\'re on your way! 🚗');
        if (s === 'completed') {
          setStatusMsg('Trip complete! Enjoy your day.');
          setIsRatingModalOpen(true);
          clearInterval(pollRef.current);
        }
      } catch {}
    };

    pollRef.current = setInterval(poll, 4000);
    return () => clearInterval(pollRef.current);
  }, [ride?.id]);

  // Connect to WebSocket to receive driver location
  useEffect(() => {
    if (!rideId) return;

    const ws = new WebSocket(getTrackingWsUrl(rideId));
    wsRef.current = ws;

    ws.onopen = () => console.log('[Tracking] Rider WS connected for ride:', rideId);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.lat !== undefined && data.lng !== undefined) {
          setDriverCoords([data.lat, data.lng]);
        }
      } catch (e) {
        console.error('[Tracking] Bad message:', e);
      }
    };

    ws.onerror = (e) => console.error('[Tracking] Rider WS error', e);

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [rideId]);

  if (!ride) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-light dark:bg-brand-dark">
        <Loader2 className="w-10 h-10 animate-spin text-brand-indigo dark:text-brand-lime" />
      </div>
    );
  }

  const isCompleted = ride.status === 'completed';

  return (
    <div className="relative h-[calc(100vh-80px)] -m-6 flex overflow-hidden bg-brand-light dark:bg-brand-dark text-brand-indigo dark:text-brand-light">

      {/* Background Map */}
      <div className="absolute inset-0 z-0">
        <RideMap
          pickupCoords={[ride.pickup_lat, ride.pickup_lng]}
          dropCoords={[ride.drop_lat, ride.drop_lng]}
          driverCoords={driverCoords}
        />
      </div>

      {/* Floating Status Panel */}
      <div className="relative z-10 w-full md:w-[380px] mt-auto md:mt-0 md:h-full flex flex-col pointer-events-none p-4 sm:p-6">
        <div className="pointer-events-auto flex flex-col max-h-[85vh] overflow-hidden rounded-3xl shadow-2xl backdrop-blur-xl bg-white/85 dark:bg-brand-dark/85 border border-white/20 dark:border-brand-light/10">

          {/* Header */}
          <div className="p-5 bg-brand-indigo text-brand-lime dark:bg-brand-lime dark:text-brand-indigo rounded-t-3xl">
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-2 h-2 rounded-full ${isCompleted ? 'bg-green-400' : 'bg-brand-lime dark:bg-brand-indigo animate-pulse'}`}></span>
              <span className="text-xs font-bold uppercase tracking-widest">{ride.status}</span>
            </div>
            <h2 className="font-heading text-xl font-bold flex items-center gap-2">
              <Navigation className="w-5 h-5 rotate-45" /> Your Ride
            </h2>
          </div>

          <div className="p-5 flex flex-col gap-5">
            {/* Status message */}
            <div className={`flex items-center gap-3 p-4 rounded-2xl ${
              isCompleted
                ? 'bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30'
                : 'bg-brand-indigo/5 dark:bg-brand-lime/5 border border-brand-indigo/10 dark:border-brand-lime/10'
            }`}>
              {isCompleted
                ? <CheckCircle className="w-6 h-6 text-green-500 shrink-0" />
                : <Loader2 className="w-6 h-6 text-brand-indigo dark:text-brand-lime animate-spin shrink-0" />
              }
              <p className="font-semibold text-sm">{statusMsg}</p>
            </div>

            {/* Fare & Distance */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-brand-gray-50 dark:bg-brand-gray-900 rounded-2xl text-center">
                <p className="text-xs text-brand-gray-500 font-semibold uppercase tracking-wider mb-1">Est. Fare</p>
                <p className="font-bold text-xl text-brand-indigo dark:text-brand-lime">₹{ride.fare_estimate}</p>
              </div>
              <div className="p-4 bg-brand-gray-50 dark:bg-brand-gray-900 rounded-2xl text-center">
                <p className="text-xs text-brand-gray-500 font-semibold uppercase tracking-wider mb-1">Distance</p>
                <p className="font-bold text-xl text-brand-indigo dark:text-brand-lime">{ride.distance_km} km</p>
              </div>
            </div>

            {/* Route summary */}
            <div className="flex flex-col gap-2 relative pl-4">
              <div className="absolute left-[7px] top-3 bottom-3 w-0.5 bg-brand-gray-200 dark:bg-brand-gray-700"></div>
              <div className="flex items-start gap-3 relative z-10">
                <div className="w-3.5 h-3.5 rounded-full bg-white ring-4 ring-brand-gray-200 shrink-0 mt-0.5 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-indigo dark:bg-brand-lime"></div>
                </div>
                <p className="text-sm font-semibold">{ride.pickup_lat.toFixed(4)}, {ride.pickup_lng.toFixed(4)}</p>
              </div>
              <div className="flex items-start gap-3 relative z-10">
                <div className="w-3.5 h-3.5 rounded-sm bg-white ring-4 ring-brand-gray-200 shrink-0 mt-0.5 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-brand-lime dark:bg-brand-indigo"></div>
                </div>
                <p className="text-sm font-semibold">{ride.drop_lat.toFixed(4)}, {ride.drop_lng.toFixed(4)}</p>
              </div>
            </div>

            {isCompleted && (
              <button
                onClick={() => setIsRatingModalOpen(true)}
                className="w-full py-3 mt-4 bg-brand-indigo dark:bg-brand-lime text-brand-lime dark:text-brand-indigo font-bold rounded-2xl hover:opacity-90 transition-opacity"
              >
                Rate Driver
              </button>
            )}
          </div>
        </div>
      </div>

      <RatingModal
        isOpen={isRatingModalOpen}
        driverName={ride?.driver_id?.substring(0, 4) || 'Partner'}
        onClose={() => {
          setIsRatingModalOpen(false);
          navigate('/dashboard');
        }}
        onSubmit={async (payload) => {
          await dispatch(submitRideRating({ rideId: ride.id, payload })).unwrap();
          setIsRatingModalOpen(false);
          navigate('/dashboard');
        }}
      />
    </div>
  );
};

export default RiderActiveTrip;
