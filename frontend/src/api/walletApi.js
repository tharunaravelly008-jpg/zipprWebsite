import axiosInstance from './axiosInstance';

export const walletApi = {
  getWallet: async () => {
    const response = await axiosInstance.get('/wallet');
    return response.data;
  },

  addMoney: async ({ amount, method }) => {
    const response = await axiosInstance.post('/wallet/add-money', { amount, method });
    return response.data;
  },

  getTransactions: async () => {
    const response = await axiosInstance.get('/wallet/transactions');
    return response.data;
  },

  processPayment: async ({ ride_id, method }) => {
    // method: 'wallet' | 'cash' | 'upi'
    const response = await axiosInstance.post(`/payments/process?ride_id=${ride_id}&method=${method}`);
    return response.data;
  },
};
