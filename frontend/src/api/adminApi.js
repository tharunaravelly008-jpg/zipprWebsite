import axiosInstance from './axiosInstance';

export const adminApi = {
  getAnalyticsSummary: async () => {
    const response = await axiosInstance.get('/admin/analytics/summary');
    return response.data;
  },
  
  getUsers: async (params = { limit: 20, offset: 0 }) => {
    const response = await axiosInstance.get('/admin/users', { params });
    return response.data;
  },
  
  getDrivers: async (params = { limit: 20, offset: 0 }) => {
    const response = await axiosInstance.get('/admin/drivers', { params });
    return response.data;
  },
  
  getRides: async (params = { limit: 20, offset: 0 }) => {
    const response = await axiosInstance.get('/admin/rides', { params });
    return response.data;
  }
};
