import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LocateFixed } from 'lucide-react';

// Fix Leaflet's default icon path issues in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom styled markers
const createPickupMarkerIcon = () => L.divIcon({
  html: `<div style="
    display: flex; align-items: center; justify-content: center;
    width: 32px; height: 32px; border-radius: 50%;
    background: #00C853; border: 3px solid #ffffff;
    box-shadow: 0 4px 14px rgba(0, 200, 83, 0.5);
  ">
    <div style="width: 10px; height: 10px; border-radius: 50%; background: #ffffff;"></div>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -18],
  className: 'zippr-pickup-marker'
});

const createDropMarkerIcon = () => L.divIcon({
  html: `<div style="
    display: flex; align-items: center; justify-content: center;
    width: 32px; height: 32px; border-radius: 50%;
    background: #FF3D71; border: 3px solid #ffffff;
    box-shadow: 0 4px 14px rgba(255, 61, 113, 0.5);
  ">
    <div style="width: 8px; height: 8px; background: #ffffff; border-radius: 2px;"></div>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -18],
  className: 'zippr-drop-marker'
});

// GPS Current location pulsing marker
const createGpsDotIcon = () => L.divIcon({
  html: `<div style="position: relative; width: 24px; height: 24px;">
    <div style="
      position: absolute; inset: -8px; border-radius: 50%;
      background: rgba(36, 20, 104, 0.25);
      animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
    "></div>
    <div style="
      position: absolute; inset: 0; border-radius: 50%;
      background: #241468; border: 3px solid #ffffff;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    "></div>
  </div>
  <style>
    @keyframes pulse-ring {
      0% { transform: scale(0.6); opacity: 0.9; }
      100% { transform: scale(2.2); opacity: 0; }
    }
  </style>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  className: 'zippr-gps-marker'
});

// Rapido-style Vehicle Marker generator (Bike, Auto, Cab)
const createVehicleIcon = (type, isSelected) => {
  let bg = '#1E1B4B';
  let border = isSelected ? '#C6FF3D' : '#ffffff';
  let scale = isSelected ? 'scale(1.2)' : 'scale(1)';
  let glow = isSelected ? 'box-shadow: 0 0 16px rgba(198, 255, 61, 0.8);' : 'box-shadow: 0 4px 10px rgba(0,0,0,0.35);';

  let svg = '';
  if (type === 'bike') {
    bg = '#F59E0B'; // Rapido yellow
    svg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5L9 9l4.5-2 2.5 4 3.5 1"/>
    </svg>`;
  } else if (type === 'auto') {
    bg = '#10B981'; // Auto green/yellow
    svg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 11h16v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6z"/><path d="M6 11V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v5"/><circle cx="7.5" cy="17.5" r="1.5"/><circle cx="16.5" cy="17.5" r="1.5"/>
    </svg>`;
  } else {
    bg = '#241468'; // Cab indigo
    svg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C6FF3D" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M19 17H5V12L7 5h10l2 7v5z"/><circle cx="7.5" cy="17.5" r="1.5"/><circle cx="16.5" cy="17.5" r="1.5"/>
    </svg>`;
  }

  return L.divIcon({
    html: `<div style="
      width: 32px; height: 32px; border-radius: 50%;
      background: ${bg}; border: 2.5px solid ${border};
      display: flex; align-items: center; justify-content: center;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      transform: ${scale};
      ${glow}
    ">
      ${svg}
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    className: ''
  });
};

/**
 * RideMap
 * Interactive Rapido-style Leaflet map with real-time pickup/drop routing,
 * pulsing user GPS location, simulated live roaming vehicles, and quick recenter.
 */
export const RideMap = ({
  pickupCoords,
  dropCoords,
  driverCoords,
  userLocation,
  selectedVehicleType = 'bike',
  onLocateMe
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const pickupMarkerRef = useRef(null);
  const dropMarkerRef = useRef(null);
  const polylineRef = useRef(null);
  const driverMarkerRef = useRef(null);
  const userGpsMarkerRef = useRef(null);
  const nearbyMarkersRef = useRef([]);

  // Default center: Capital Park, Madhapur, Hyderabad
  const defaultCenter = [17.4467, 78.3864];

  // Initialize Map
  useEffect(() => {
    if (!mapInstanceRef.current && mapRef.current) {
      const initialCenter = userLocation || pickupCoords || defaultCenter;
      const map = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView(initialCenter, 15);

      mapInstanceRef.current = map;

      // Free OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        subdomains: 'abc',
        maxZoom: 19
      }).addTo(map);

      // Add zoom control top-right
      L.control.zoom({ position: 'topright' }).addTo(map);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update User GPS Marker
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (userLocation && userLocation[0] && userLocation[1]) {
      if (!userGpsMarkerRef.current) {
        userGpsMarkerRef.current = L.marker(userLocation, {
          icon: createGpsDotIcon(),
          zIndexOffset: 500
        }).addTo(map).bindPopup('You are here (GPS)');
      } else {
        userGpsMarkerRef.current.setLatLng(userLocation);
      }
    } else if (userGpsMarkerRef.current) {
      map.removeLayer(userGpsMarkerRef.current);
      userGpsMarkerRef.current = null;
    }
  }, [userLocation]);

  // Update Pickup & Drop Markers & Route Polyline
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (pickupMarkerRef.current) map.removeLayer(pickupMarkerRef.current);
    if (dropMarkerRef.current) map.removeLayer(dropMarkerRef.current);
    if (polylineRef.current) map.removeLayer(polylineRef.current);

    const hasPickup = pickupCoords && pickupCoords[0] && pickupCoords[1];
    const hasDrop = dropCoords && dropCoords[0] && dropCoords[1];

    if (hasPickup) {
      pickupMarkerRef.current = L.marker(pickupCoords, {
        icon: createPickupMarkerIcon(),
        zIndexOffset: 800
      }).addTo(map).bindPopup('<b>Pickup Location</b>');
    }

    if (hasDrop) {
      dropMarkerRef.current = L.marker(dropCoords, {
        icon: createDropMarkerIcon(),
        zIndexOffset: 800
      }).addTo(map).bindPopup('<b>Drop-off Location</b>');
    }

    if (hasPickup && hasDrop) {
      // Connect with stylish polyline
      polylineRef.current = L.polyline([pickupCoords, dropCoords], {
        color: '#241468',
        weight: 5,
        opacity: 0.85,
        dashArray: '8, 8',
        lineCap: 'round'
      }).addTo(map);

      const bounds = L.latLngBounds([pickupCoords, dropCoords]);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
    } else if (hasPickup) {
      map.flyTo(pickupCoords, 16, { duration: 1.2 });
    } else if (hasDrop) {
      map.flyTo(dropCoords, 16, { duration: 1.2 });
    }
  }, [pickupCoords, dropCoords]);

  // Generate & animate realistic Rapido nearby vehicles around pickup or center
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Clear existing nearby markers
    nearbyMarkersRef.current.forEach(m => map.removeLayer(m));
    nearbyMarkersRef.current = [];

    // Anchor center for nearby vehicles
    const anchor = pickupCoords || userLocation || defaultCenter;
    if (!anchor || !anchor[0]) return;

    // Simulate 7 nearby drivers (Bikes, Autos, Cabs) near Capital Park/Madhapur
    const offsets = [
      { dLat: 0.0022, dLng: 0.0018, type: 'bike' },
      { dLat: -0.0018, dLng: 0.0024, type: 'bike' },
      { dLat: 0.0015, dLng: -0.0021, type: 'bike' },
      { dLat: -0.0025, dLng: -0.0015, type: 'auto' },
      { dLat: 0.0031, dLng: -0.0008, type: 'auto' },
      { dLat: 0.0009, dLng: 0.0032, type: 'cab' },
      { dLat: -0.0034, dLng: 0.0019, type: 'cab' },
    ];

    const markers = offsets.map((o) => {
      const pos = [anchor[0] + o.dLat, anchor[1] + o.dLng];
      const isSelected = o.type === selectedVehicleType;
      const marker = L.marker(pos, {
        icon: createVehicleIcon(o.type, isSelected),
        zIndexOffset: isSelected ? 400 : 200
      }).addTo(map);

      marker.bindPopup(`<b>${o.type.toUpperCase()}</b><br/>Available nearby (~2-4 mins)`);
      return marker;
    });

    nearbyMarkersRef.current = markers;

    // Micro-jitter animation every 4s to simulate live vehicle movement
    const jitterInterval = setInterval(() => {
      markers.forEach((marker) => {
        const cur = marker.getLatLng();
        const randLat = (Math.random() - 0.5) * 0.0004;
        const randLng = (Math.random() - 0.5) * 0.0004;
        marker.setLatLng([cur.lat + randLat, cur.lng + randLng]);
      });
    }, 4000);

    return () => {
      clearInterval(jitterInterval);
      markers.forEach(m => map.removeLayer(m));
    };
  }, [pickupCoords, userLocation, selectedVehicleType]);

  // Update assigned Driver marker (for active ongoing trip tracking)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (!driverCoords) {
      if (driverMarkerRef.current) {
        map.removeLayer(driverMarkerRef.current);
        driverMarkerRef.current = null;
      }
      return;
    }

    if (!driverMarkerRef.current) {
      driverMarkerRef.current = L.marker(driverCoords, {
        icon: createVehicleIcon(selectedVehicleType || 'bike', true),
        zIndexOffset: 1000
      }).addTo(map).bindPopup('<b>Your Driver</b> is here');
    } else {
      driverMarkerRef.current.setLatLng(driverCoords);
    }
  }, [driverCoords, selectedVehicleType]);

  // Recenter map on user location
  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    const target = userLocation || pickupCoords || defaultCenter;
    mapInstanceRef.current.flyTo(target, 16, { duration: 1 });
    if (onLocateMe) onLocateMe();
  };

  return (
    <div className="absolute inset-0 z-0">
      <div ref={mapRef} className="w-full h-full" />

      {/* Floating Recenter GPS button on Map */}
      <div className="absolute bottom-6 right-6 z-20">
        <button
          type="button"
          onClick={handleRecenter}
          title="Recenter on My Location"
          className="p-3 bg-white dark:bg-brand-gray-900 text-brand-indigo dark:text-brand-lime rounded-full shadow-2xl border border-brand-gray-200 dark:border-brand-gray-700 hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center group"
        >
          <LocateFixed className="w-5 h-5 group-hover:rotate-45 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default RideMap;
