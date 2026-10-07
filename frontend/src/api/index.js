import axiosInstance from './axiosInstance';

export const authApi = {
  login: (credentials) => axiosInstance.post('/auth/login', credentials),
  register: (userData) => axiosInstance.post('/auth/register', userData),
  logout: () => axiosInstance.post('/auth/logout'),
  me: () => axiosInstance.get('/users/me'),
};

export const ridesApi = {
  getEstimate: (data) => axiosInstance.post('/rides/estimate', data),
  createRide: (rideData) => axiosInstance.post('/rides', rideData),
  getRideDetails: (rideId) => axiosInstance.get(`/rides/${rideId}`),
  updateRideStatus: (rideId, status) => axiosInstance.patch(`/rides/${rideId}/status`, { status }),
  getHistory: (params) => axiosInstance.get('/rides', { params }),
};

export const walletApi = {
  getWallet: () => axiosInstance.get('/wallet'),
  addMoney: (amount, method) => axiosInstance.post('/wallet/add-money', { amount, method }),
  getTransactions: () => axiosInstance.get('/wallet/transactions'),
};

export const notificationsApi = {
  getNotifications: () => axiosInstance.get('/notifications'),
  markRead: (id) => axiosInstance.patch(`/notifications/${id}/read`),
  markAllRead: () => axiosInstance.post('/notifications/read-all'),
};

export const adminApi = {
  getAnalytics: () => axiosInstance.get('/admin/analytics/summary'),
  getUsers: (params) => axiosInstance.get('/admin/users', { params }),
  getDrivers: (params) => axiosInstance.get('/admin/drivers', { params }),
  getRides: (params) => axiosInstance.get('/admin/rides', { params }),
};

export default axiosInstance;
