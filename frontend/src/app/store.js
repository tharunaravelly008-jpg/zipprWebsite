import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import rideReducer from '../features/ride/rideSlice';
import walletReducer from '../features/wallet/walletSlice';
import notificationsReducer from '../features/notifications/notificationsSlice';
import uiReducer from '../features/ui/uiSlice';
import driverReducer from '../features/driver/driverSlice';
import adminReducer from '../features/admin/adminSlice';



export const store = configureStore({
  reducer: {
    auth: authReducer,
    ride: rideReducer,
    wallet: walletReducer,
    notifications: notificationsReducer,
    ui: uiReducer,
    driver: driverReducer,
    admin: adminReducer,
  },


});

export default store;
