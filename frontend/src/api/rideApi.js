import axiosInstance from './axiosInstance';

export const rideApi = {
  getEstimates: async (payload) => {
    // payload: { pickup_lat, pickup_lng, drop_lat, drop_lng }
    const response = await axiosInstance.post('/rides/estimate', payload);
    return response.data;
  },
  
  createBooking: async (payload) => {
    // payload: { pickup_lat, pickup_lng, drop_lat, drop_lng, vehicle_type, fare_estimate }
    const response = await axiosInstance.post('/rides', payload);
    return response.data;
  },
  
  getRide: async (rideId) => {
    const response = await axiosInstance.get(`/rides/${rideId}`);
    return response.data;
  },
  
  getRideHistory: async (params = { limit: 10, offset: 0 }) => {
    const response = await axiosInstance.get('/rides', { params });
    return response.data;
  },
  
  rateRide: async (rideId, payload) => {
    // payload: { stars, comment }
    const response = await axiosInstance.post(`/rides/${rideId}/rate`, payload);
    return response.data;
  }
};
