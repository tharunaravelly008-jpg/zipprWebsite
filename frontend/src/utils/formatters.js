/**
 * Formats a numeric value into INR Currency format.
 * @param {number} value 
 * @returns {string}
 */
export const formatCurrency = (value) => {
  if (value === undefined || value === null) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(value);
};

/**
 * Formats distance in KM.
 * @param {number} value - Distance in kilometers
 * @returns {string}
 */
export const formatDistance = (value) => {
  if (!value) return '0.0 km';
  return `${value.toFixed(1)} km`;
};

/**
 * Formats duration in minutes.
 * @param {number} mins - Duration in minutes
 * @returns {string}
 */
export const formatDuration = (mins) => {
  if (!mins) return '0 mins';
  if (mins < 60) return `${Math.round(mins)} mins`;
  const hrs = Math.floor(mins / 60);
  const remainingMins = Math.round(mins % 60);
  return `${hrs} hr ${remainingMins} mins`;
};

/**
 * Formats date to a local string representation.
 * @param {string|Date} dateVal 
 * @returns {string}
 */
export const formatDate = (dateVal) => {
  if (!dateVal) return '';
  const date = typeof dateVal === 'string' ? new Date(dateVal) : dateVal;
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};
