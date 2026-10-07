import axiosInstance from './axiosInstance';

export const driverApi = {
  getAvailableRides: async (params = { limit: 10, offset: 0 }) => {
    const response = await axiosInstance.get('/rides/available', { params });
    return response.data;
  },
  
  acceptRide: async (rideId) => {
    const response = await axiosInstance.patch(`/rides/${rideId}/status`, { status: 'accepted' });
    return response.data;
  },
  
  updateRideStatus: async (rideId, status) => {
    // status: 'arrived', 'ongoing', 'completed'
    const response = await axiosInstance.patch(`/rides/${rideId}/status`, { status });
    return response.data;
  },
  
  getEarnings: async (params = { limit: 10, offset: 0 }) => {
    // We can use the generic ride history for driver, the backend filters it by driver_id
    const response = await axiosInstance.get('/rides', { params });
    return response.data;
  }
};
