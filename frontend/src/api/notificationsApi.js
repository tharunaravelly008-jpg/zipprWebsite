import axiosInstance from './axiosInstance';

export const notificationsApi = {
  getAll: async () => {
    const response = await axiosInstance.get('/notifications');
    return response.data;
  },
  markRead: async (id) => {
    const response = await axiosInstance.patch(`/notifications/${id}/read`);
    return response.data;
  },
  markAllRead: async () => {
    const response = await axiosInstance.post('/notifications/read-all');
    return response.data;
  },
};

export const userApi = {
  getMe: async () => {
    const response = await axiosInstance.get('/users/me');
    return response.data;
  },
  updateMe: async (data) => {
    const response = await axiosInstance.patch('/users/me', data);
    return response.data;
  },
};
