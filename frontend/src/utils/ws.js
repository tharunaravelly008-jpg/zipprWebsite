/**
 * Constructs a robust WebSocket URL for real-time ride tracking.
 * Automatically handles:
 * - http(s) -> ws(s) conversion
 * - Hostnames provided without protocol (e.g., "zippr-backend.onrender.com")
 * - Missing or present /api/v1/tracking path segment
 * - Trailing slashes
 */
export const getTrackingWsUrl = (rideId) => {
  let wsBase = (import.meta.env.VITE_WS_URL || '').trim();

  if (!wsBase) {
    let apiBase = (import.meta.env.VITE_API_URL || '').trim();
    if (apiBase) {
      if (!apiBase.startsWith('http://') && !apiBase.startsWith('https://')) {
        apiBase = `https://${apiBase}`;
      }
      wsBase = apiBase.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:');
    } else if (typeof window !== 'undefined') {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      wsBase = `${protocol}//${window.location.host}`;
    } else {
      wsBase = 'ws://localhost:8000';
    }
  }

  // Ensure ws:// or wss:// protocol prefix
  if (!wsBase.startsWith('ws://') && !wsBase.startsWith('wss://')) {
    wsBase = wsBase.startsWith('https://')
      ? wsBase.replace(/^https:\/\//, 'wss://')
      : wsBase.startsWith('http://')
      ? wsBase.replace(/^http:\/\//, 'ws://')
      : `wss://${wsBase}`;
  }

  // Remove trailing slashes
  wsBase = wsBase.replace(/\/+$/, '');

  // If already ends with /api/v1/tracking
  if (wsBase.endsWith('/api/v1/tracking')) {
    return `${wsBase}/ws/${rideId}`;
  }

  // If ends with /api/v1
  if (wsBase.endsWith('/api/v1')) {
    return `${wsBase}/tracking/ws/${rideId}`;
  }

  // Default base domain
  return `${wsBase}/api/v1/tracking/ws/${rideId}`;
};
