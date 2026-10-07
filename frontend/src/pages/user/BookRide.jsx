import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  setSearchLocations, fetchEstimates, setSelectedVehicle,
  requestNewRide, clearRideState
} from '../../features/ride/rideSlice';
import { RideMap } from '../../components/map/RideMap';
import { Button, Card } from '../../components/common';
import { MapPin, Navigation, Bike, Car, ArrowLeft, Loader2, Search, X, LocateFixed, Users, Clock, ShieldCheck, Sparkles } from 'lucide-react';
import { cn } from '../../utils/cn';

// Quick popular locations in Hyderabad (Rapido style quick-picks)
const POPULAR_LOCATIONS = [
  {
    title: 'Capital Park, Madhapur',
    subtitle: 'HITEC City, Hyderabad',
    lat: 17.4467425,
    lng: 78.3864176,
  },
  {
    title: 'Cyber Towers, HITEC City',
    subtitle: 'Madhapur, Hyderabad',
    lat: 17.4504,
    lng: 78.3808,
  },
  {
    title: 'Inorbit Mall, Madhapur',
    subtitle: 'Mindspace, Hyderabad',
    lat: 17.4348,
    lng: 78.3868,
  },
  {
    title: 'Durgam Cheruvu Cable Bridge',
    subtitle: 'Jubilee Hills / Madhapur, Hyderabad',
    lat: 17.4316,
    lng: 78.3900,
  },
  {
    title: 'IKEA Hyderabad',
    subtitle: 'HITEC City, Hyderabad',
    lat: 17.4419,
    lng: 78.3756,
  },
  {
    title: 'RGIA Rajiv Gandhi Airport',
    subtitle: 'Shamshabad, Hyderabad',
    lat: 17.2403,
    lng: 78.4294,
  }
];

// ─── Nominatim Geocoder (Free, prioritized by viewbox) ───────────
const searchPlaces = async (query, userLoc) => {
  if (!query || query.length < 2) return [];

  let url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=6&addressdetails=1&countrycodes=in`;
  // If user location is known, bias results to ~50km bounding box
  if (userLoc && userLoc[0] && userLoc[1]) {
    const minLat = userLoc[0] - 0.5;
    const maxLat = userLoc[0] + 0.5;
    const minLng = userLoc[1] - 0.5;
    const maxLng = userLoc[1] + 0.5;
    url += `&viewbox=${minLng},${maxLat},${maxLng},${minLat}&bounded=0`;
  }

  try {
    const res = await fetch(url, {
      headers: { 'Accept-Language': 'en', 'User-Agent': 'ZipprApp/1.0' }
    });
    const data = await res.json();
    return data.map(p => {
      const name = p.name || p.address?.commercial || p.address?.building || p.address?.amenity || p.address?.road || p.display_name.split(',')[0];
      const locality = p.address?.neighbourhood || p.address?.suburb || p.address?.city_district || p.address?.city;
      const city = p.address?.city || p.address?.town || p.address?.state || 'Hyderabad';
      const shortLabel = [name, locality && locality !== name ? locality : null, city].filter(Boolean).join(', ');

      return {
        label: p.display_name,
        shortLabel,
        title: name,
        lat: parseFloat(p.lat),
        lng: parseFloat(p.lon),
      };
    });
  } catch {
    return [];
  }
};

// ─── LocationInput with Autocomplete & Quick Suggestions ────────
const LocationInput = ({
  placeholder,
  value,
  onChange,
  onSelect,
  icon,
  disabled,
  userLocation,
  showQuickPicks = false
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    onChange(val);
    clearTimeout(debounceRef.current);

    if (val.length < 2) {
      setSuggestions([]);
      setOpen(true);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const results = await searchPlaces(val, userLocation);
      setSuggestions(results);
      setOpen(true);
      setLoading(false);
    }, 350);
  };

  const handleSelect = (place) => {
    const name = place.shortLabel || place.title || place.label;
    onChange(name);
    onSelect(place);
    setSuggestions([]);
    setOpen(false);
  };

  const handleClear = () => {
    onChange('');
    onSelect(null);
    setSuggestions([]);
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative flex items-center">
        <span className="absolute left-3 z-10 pointer-events-none">{icon}</span>

        <input
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "w-full pl-9 pr-10 py-3 rounded-xl border text-sm font-body transition-all outline-none",
            "bg-white dark:bg-brand-gray-900",
            "border-brand-gray-200 dark:border-brand-gray-700",
            "text-brand-indigo dark:text-brand-light",
            "placeholder:text-brand-gray-400",
            "focus:border-brand-indigo dark:focus:border-brand-lime focus:ring-2 focus:ring-brand-indigo/20 dark:focus:ring-brand-lime/20",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        />

        <span className="absolute right-3">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-brand-gray-400" />
          ) : value ? (
            <button
              type="button"
              onClick={handleClear}
              className="text-brand-gray-400 hover:text-brand-gray-600 dark:hover:text-brand-light transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
        </span>
      </div>

      {/* Autocomplete / Quick Suggestions Dropdown */}
      {open && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white dark:bg-brand-gray-900 border border-brand-gray-200 dark:border-brand-gray-700 rounded-xl shadow-2xl overflow-hidden max-h-72 overflow-y-auto">
          {suggestions.length > 0 ? (
            <ul>
              {suggestions.map((place, i) => (
                <li key={i}>
                  <button
                    type="button"
                    onMouseDown={() => handleSelect(place)}
                    className="w-full flex items-start gap-3 px-4 py-3 hover:bg-brand-indigo/5 dark:hover:bg-brand-lime/5 text-left transition-colors border-b border-brand-gray-100 dark:border-brand-gray-800 last:border-0"
                  >
                    <div className="p-1.5 rounded-lg bg-brand-gray-100 dark:bg-brand-gray-800 text-brand-indigo dark:text-brand-lime shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-brand-indigo dark:text-brand-light truncate">
                        {place.title || place.shortLabel || place.label.split(',')[0]}
                      </p>
                      <p className="text-xs text-brand-gray-400 truncate">{place.shortLabel || place.label}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div>
              <div className="px-4 py-2 bg-brand-gray-50 dark:bg-brand-gray-800/50 border-b border-brand-gray-100 dark:border-brand-gray-800 text-[11px] font-semibold uppercase tracking-wider text-brand-gray-400">
                Popular Recommendations (Hyderabad)
              </div>
              <ul>
                {POPULAR_LOCATIONS.map((loc, idx) => (
                  <li key={idx}>
                    <button
                      type="button"
                      onMouseDown={() => handleSelect({ ...loc, shortLabel: `${loc.title}, ${loc.subtitle}` })}
                      className="w-full flex items-start gap-3 px-4 py-2.5 hover:bg-brand-indigo/5 dark:hover:bg-brand-lime/5 text-left transition-colors border-b border-brand-gray-50 dark:border-brand-gray-800/40 last:border-0"
                    >
                      <MapPin className="w-4 h-4 mt-1 text-brand-indigo/70 dark:text-brand-lime/70 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-brand-indigo dark:text-brand-light truncate">{loc.title}</p>
                        <p className="text-xs text-brand-gray-400 truncate">{loc.subtitle}</p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────
export const BookRide = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    bookingStep, pickupCoords, dropCoords, searchPickup, searchDrop,
    estimates, selectedVehicle, loading, error, currentRide
  } = useSelector((state) => state.ride);

  const [pickupInput, setPickupInput] = useState(searchPickup || '');
  const [dropInput, setDropInput] = useState(searchDrop || '');
  const [pickupPlace, setPickupPlace] = useState(null);
  const [dropPlace, setDropPlace] = useState(null);
  const [userLocation, setUserLocation] = useState([17.4467, 78.3864]); // Default Capital Park, Madhapur
  const [isSearching, setIsSearching] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  // Auto-detect GPS location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserLocation([lat, lng]);

          // If pickup input is not yet set, reverse geocode and set as pickup
          if (!pickupInput) {
            try {
              const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`, {
                headers: { 'Accept-Language': 'en', 'User-Agent': 'ZipprApp/1.0' }
              });
              const data = await res.json();
              const addr = data.address || {};
              const name = data.name || addr.commercial || addr.building || addr.road || 'Capital Park, Madhapur';
              const locality = addr.suburb || addr.neighbourhood || addr.city || 'Hyderabad';
              const label = `${name}, ${locality}`;

              setPickupInput(label);
              setPickupPlace({ label, lat, lng });
            } catch {
              setPickupInput('Capital Park, Madhapur');
              setPickupPlace({ label: 'Capital Park, Madhapur', lat, lng });
            }
          }
        },
        () => {
          // Fallback location: Capital Park, Madhapur
          if (!pickupInput) {
            setPickupInput('Capital Park, Madhapur');
            setPickupPlace({ label: 'Capital Park, Madhapur', lat: 17.4467, lng: 78.3864 });
          }
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      if (!pickupInput) {
        setPickupInput('Capital Park, Madhapur');
        setPickupPlace({ label: 'Capital Park, Madhapur', lat: 17.4467, lng: 78.3864 });
      }
    }
  }, []);

  // Poll ride status while matching
  useEffect(() => {
    if ((bookingStep !== 'matching' && bookingStep !== 'requested') || !currentRide?.id) return;
    const interval = setInterval(async () => {
      try {
        const res = await import('../../api/axiosInstance').then(m => m.default.get(`/rides/${currentRide.id}`));
        const status = res.data.status;
        if (status === 'accepted' || status === 'ongoing') {
          clearInterval(interval);
          navigate(`/dashboard/trip/${currentRide.id}`);
        }
      } catch {}
    }, 4000);
    return () => clearInterval(interval);
  }, [bookingStep, currentRide?.id, navigate]);

  // Use GPS for pickup
  const handleGpsPickup = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserLocation([lat, lng]);

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`, {
            headers: { 'Accept-Language': 'en', 'User-Agent': 'ZipprApp/1.0' }
          });
          const data = await res.json();
          const addr = data.address || {};
          const name = data.name || addr.commercial || addr.building || addr.office || addr.road || 'Capital Park, Madhapur';
          const locality = addr.suburb || addr.neighbourhood || addr.city || 'Hyderabad';
          const label = `${name}, ${locality}`;

          setPickupInput(label);
          setPickupPlace({ label, lat, lng });
        } catch {
          setPickupInput('Capital Park, Madhapur');
          setPickupPlace({ label: 'Capital Park, Madhapur', lat, lng });
        }
        setGpsLoading(false);
      },
      () => {
        // Fallback to Capital Park, Madhapur
        setPickupInput('Capital Park, Madhapur');
        setPickupPlace({ label: 'Capital Park, Madhapur', lat: 17.4467, lng: 78.3864 });
        setUserLocation([17.4467, 78.3864]);
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const effectivePickup = pickupPlace || (pickupInput ? { label: pickupInput, lat: userLocation[0], lng: userLocation[1] } : null);
    const effectiveDrop = dropPlace;

    if (!effectivePickup || !effectiveDrop) return;
    setIsSearching(true);

    try {
      const pCoords = [effectivePickup.lat, effectivePickup.lng];
      const dCoords = [effectiveDrop.lat, effectiveDrop.lng];

      dispatch(setSearchLocations({
        pickup: effectivePickup.label || pickupInput,
        drop: effectiveDrop.label || dropInput,
        pickupCoords: pCoords,
        dropCoords: dCoords
      }));

      await dispatch(fetchEstimates({
        pickup_lat: pCoords[0], pickup_lng: pCoords[1],
        drop_lat: dCoords[0], drop_lng: dCoords[1]
      })).unwrap();

    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleConfirmRide = () => {
    if (!selectedVehicle) return;
    const est = estimates.find(e => e.vehicle_type === selectedVehicle);
    if (!est) return;
    dispatch(requestNewRide({
      pickup_lat: activePickupCoords[0], pickup_lng: activePickupCoords[1],
      drop_lat: activeDropCoords[0], drop_lng: activeDropCoords[1],
      vehicle_type: selectedVehicle,
      fare_estimate: est.fare_estimate
    }));
  };

  // Real active coordinates passed dynamically to RideMap
  const activePickupCoords = pickupPlace
    ? [pickupPlace.lat, pickupPlace.lng]
    : pickupCoords || (userLocation ? userLocation : null);

  const activeDropCoords = dropPlace
    ? [dropPlace.lat, dropPlace.lng]
    : dropCoords;

  const canSearch = (pickupPlace || pickupInput) && dropPlace;

  // Rapido-style category information
  const categoryDetails = {
    bike: {
      title: 'Rapido Bike',
      tag: 'Fastest & Economical',
      seats: 1,
      eta: '2-3 mins away',
      icon: (
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
          <Bike className="w-6 h-6" />
        </div>
      )
    },
    auto: {
      title: 'Auto Rickshaw',
      tag: 'No Bargaining, Direct Meter',
      seats: 3,
      eta: '3-4 mins away',
      icon: (
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 11h16v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6z"/><path d="M6 11V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v5"/><circle cx="7.5" cy="17.5" r="1.5"/><circle cx="16.5" cy="17.5" r="1.5"/>
          </svg>
        </div>
      )
    },
    cab: {
      title: 'Cab Economy',
      tag: 'AC, Top Rated Drivers',
      seats: 4,
      eta: '4-5 mins away',
      icon: (
        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
          <Car className="w-6 h-6" />
        </div>
      )
    }
  };

  return (
    <div className="relative h-[calc(100vh-80px)] -m-6 flex flex-col md:flex-row overflow-hidden bg-brand-light dark:bg-brand-dark text-brand-indigo dark:text-brand-light">

      {/* Background Interactive Map */}
      <div className="absolute inset-0 z-0">
        <RideMap
          pickupCoords={activePickupCoords}
          dropCoords={activeDropCoords}
          userLocation={userLocation}
          selectedVehicleType={selectedVehicle || 'bike'}
          onLocateMe={handleGpsPickup}
        />
      </div>

      {/* Floating Rapido-style Booking Drawer / Panel */}
      <div className="relative z-10 w-full md:w-[440px] mt-auto md:mt-0 md:h-full flex flex-col pointer-events-none p-3 sm:p-6">
        <Card glass padding="none" className="pointer-events-auto flex flex-col max-h-[92vh] md:max-h-full overflow-hidden shadow-2xl backdrop-blur-2xl bg-white/95 dark:bg-brand-dark/95 border-brand-indigo/10 dark:border-brand-light/10">

          {/* Header */}
          <div className="p-4 sm:p-5 flex items-center justify-between border-b border-brand-indigo/5 dark:border-brand-light/5">
            <div className="flex items-center gap-3">
              {bookingStep !== 'idle' && (
                <button
                  onClick={() => dispatch(clearRideState())}
                  className="p-2 rounded-full hover:bg-brand-indigo/5 dark:hover:bg-brand-light/10 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div>
                <h2 className="font-heading text-lg sm:text-xl font-bold">
                  {bookingStep === 'idle' && 'Where to?'}
                  {bookingStep === 'estimate' && 'Select Your Ride'}
                  {(bookingStep === 'matching' || bookingStep === 'requested') && 'Finding Your Driver...'}
                  {bookingStep === 'accepted' && 'Driver Confirmed!'}
                </h2>
                {bookingStep === 'idle' && (
                  <p className="text-xs text-brand-gray-400">Real-time rides near Madhapur, Hyderabad</p>
                )}
              </div>
            </div>

            {bookingStep === 'idle' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Drivers Online
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-4">

            {/* Step 1: Location Input */}
            {bookingStep === 'idle' && (
              <form onSubmit={handleSearch} className="flex flex-col gap-4">
                <div className="relative flex flex-col gap-3">
                  {/* Connecting dashed line */}
                  <div className="absolute left-[1.35rem] top-10 bottom-10 w-0.5 border-l-2 border-dashed border-brand-gray-300 dark:border-brand-gray-600 z-0 pointer-events-none" />

                  {/* Pickup Row with GPS trigger */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <LocationInput
                        placeholder="Pickup location"
                        value={pickupInput}
                        onChange={setPickupInput}
                        onSelect={setPickupPlace}
                        userLocation={userLocation}
                        icon={<div className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />}
                      />
                    </div>
                    {/* GPS button */}
                    <button
                      type="button"
                      onClick={handleGpsPickup}
                      title="Use my current GPS location"
                      className="shrink-0 p-3 rounded-xl border border-brand-gray-200 dark:border-brand-gray-700 bg-white dark:bg-brand-gray-900 hover:border-brand-indigo dark:hover:border-brand-lime hover:bg-brand-indigo/5 transition-all text-brand-indigo dark:text-brand-lime"
                    >
                      {gpsLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <LocateFixed className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Drop Row */}
                  <LocationInput
                    placeholder="Where to? (e.g. Inorbit Mall, Airport)"
                    value={dropInput}
                    onChange={setDropInput}
                    onSelect={setDropPlace}
                    userLocation={userLocation}
                    icon={<div className="w-3 h-3 rounded-sm bg-rose-500 ring-4 ring-rose-500/20" />}
                  />
                </div>

                {/* Popular Quick-Destinations (Rapido Chips) */}
                {!dropInput && (
                  <div className="flex flex-col gap-2 mt-1">
                    <p className="text-xs font-semibold text-brand-gray-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Quick Destinations
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {POPULAR_LOCATIONS.slice(0, 4).map((loc, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setDropInput(loc.title);
                            setDropPlace({ ...loc, label: `${loc.title}, ${loc.subtitle}` });
                          }}
                          className="text-xs px-3 py-1.5 rounded-full border border-brand-gray-200 dark:border-brand-gray-700 hover:border-brand-indigo dark:hover:border-brand-lime bg-white dark:bg-brand-gray-800/80 text-brand-indigo dark:text-brand-light transition-all flex items-center gap-1 hover:scale-105"
                        >
                          <MapPin className="w-3 h-3 text-brand-gray-400" />
                          {loc.title.split(',')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Helper validation hint */}
                {dropInput && !dropPlace && (
                  <p className="text-xs text-amber-500 flex items-center gap-1.5">
                    <MapPin className="w-3 h-3" />
                    Please click a recommendation from the list
                  </p>
                )}

                <Button
                  type="submit"
                  isLoading={isSearching}
                  disabled={!canSearch}
                  leftIcon={!isSearching && <Search className="w-4 h-4" />}
                  fullWidth
                  size="lg"
                  className="mt-2"
                >
                  Find Available Rides
                </Button>
              </form>
            )}

            {/* Step 2: Rapido-style Vehicle Category Selection */}
            {bookingStep === 'estimate' && (
              <div className="flex flex-col gap-3">
                {/* Route Summary header */}
                <div className="bg-brand-gray-50 dark:bg-brand-gray-900/80 rounded-2xl p-3.5 text-xs flex flex-col gap-2 border border-brand-gray-200/50 dark:border-brand-gray-800">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                    <p className="font-medium text-brand-gray-700 dark:text-brand-gray-300 truncate">{searchPickup}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm bg-rose-500 shrink-0" />
                    <p className="font-semibold text-brand-indigo dark:text-brand-light truncate">{searchDrop}</p>
                  </div>
                </div>

                {loading ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-indigo dark:text-brand-lime" />
                    <p className="text-xs text-brand-gray-400">Calculating best fares & nearby partners...</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    {estimates.map((est) => {
                      const meta = categoryDetails[est.vehicle_type] || {
                        title: est.vehicle_type,
                        tag: 'Quick Ride',
                        seats: 2,
                        eta: `${est.duration_mins || 3} mins away`,
                        icon: <Car className="w-6 h-6" />
                      };
                      const isSelected = selectedVehicle === est.vehicle_type;

                      return (
                        <button
                          key={est.vehicle_type}
                          type="button"
                          onClick={() => dispatch(setSelectedVehicle(est.vehicle_type))}
                          className={cn(
                            "flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all text-left group",
                            isSelected
                              ? "border-brand-indigo bg-brand-indigo/5 dark:border-brand-lime dark:bg-brand-lime/10 shadow-md ring-1 ring-brand-indigo/20 dark:ring-brand-lime/30"
                              : "border-brand-gray-100 dark:border-brand-gray-800 hover:border-brand-indigo/30 dark:hover:border-brand-lime/30 bg-white dark:bg-brand-gray-900/60"
                          )}
                        >
                          <div className="flex items-center gap-3.5">
                            {meta.icon}
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-heading font-bold text-base text-brand-indigo dark:text-brand-light">
                                  {meta.title}
                                </h4>
                                <span className="text-[11px] px-1.5 py-0.5 rounded bg-brand-gray-100 dark:bg-brand-gray-800 text-brand-gray-500 flex items-center gap-0.5">
                                  <Users className="w-3 h-3" /> {meta.seats}
                                </span>
                              </div>
                              <p className="text-[11px] text-brand-gray-400 flex items-center gap-1 mt-0.5">
                                <Clock className="w-3 h-3 text-emerald-500" />
                                {meta.eta} • <span className="text-brand-indigo/70 dark:text-brand-lime/70 font-medium">{meta.tag}</span>
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="font-heading font-extrabold text-xl text-brand-indigo dark:text-brand-light">
                              ₹{est.fare_estimate}
                            </p>
                            <p className="text-[11px] text-brand-gray-400">{est.distance_km} km</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Rapido Matching Radar Screen */}
            {(bookingStep === 'matching' || bookingStep === 'requested' || bookingStep === 'accepted') && (
              <div className="flex flex-col items-center justify-center py-8 text-center gap-4">
                <div className="relative">
                  <div className="w-24 h-24 bg-brand-indigo/10 dark:bg-brand-lime/10 rounded-full animate-ping absolute inset-0" />
                  <div className="w-24 h-24 bg-brand-indigo dark:bg-brand-lime rounded-full flex items-center justify-center relative z-10 text-brand-lime dark:text-brand-indigo shadow-2xl">
                    <Search className="w-9 h-9 animate-pulse" />
                  </div>
                </div>
                <div>
                  <h3 className="font-heading text-xl font-bold mt-2">Connecting With Drivers...</h3>
                  <p className="text-xs text-brand-gray-400 mt-1 max-w-xs mx-auto">
                    Sending ride request to nearby {selectedVehicle || 'ride'} partners in Madhapur area.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-brand-gray-500 bg-brand-gray-100 dark:bg-brand-gray-800 px-3 py-1.5 rounded-full mt-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Verified Drivers & Safety Insured
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs">{error}</div>
            )}
          </div>

          {/* Footer Action Bar */}
          {bookingStep === 'estimate' && (
            <div className="p-4 sm:p-5 border-t border-brand-indigo/5 dark:border-brand-light/5 bg-white/70 dark:bg-brand-dark/70">
              <Button
                fullWidth
                size="lg"
                onClick={handleConfirmRide}
                disabled={!selectedVehicle || loading}
                isLoading={loading}
              >
                Book {selectedVehicle ? categoryDetails[selectedVehicle]?.title || selectedVehicle : 'Ride'} Now
              </Button>
            </div>
          )}

          {(bookingStep === 'matching' || bookingStep === 'requested') && (
            <div className="p-4 sm:p-5 border-t border-brand-indigo/5 dark:border-brand-light/5">
              <Button variant="danger" fullWidth onClick={() => dispatch(clearRideState())}>
                Cancel Ride Request
              </Button>
            </div>
          )}

        </Card>
      </div>
    </div>
  );
};

export default BookRide;
