import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { driverApi } from '../../api/driverApi';

const initialState = {
  isOnline: false,
  availableRequests: [],
  activeRide: null,          // If driver is currently servicing a trip
  earningsHistory: [],
  loading: false,
  error: null,
};

export const fetchAvailableRequests = createAsyncThunk(
  'driver/fetchAvailableRequests',
  async (params, { rejectWithValue }) => {
    try {
      const data = await driverApi.getAvailableRides(params);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch requests');
    }
  }
);

export const acceptRideRequest = createAsyncThunk(
  'driver/acceptRideRequest',
  async (rideId, { rejectWithValue }) => {
    try {
      const data = await driverApi.acceptRide(rideId);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to accept ride');
    }
  }
);

export const updateActiveRideStatus = createAsyncThunk(
  'driver/updateActiveRideStatus',
  async ({ rideId, status }, { rejectWithValue }) => {
    try {
      const data = await driverApi.updateRideStatus(rideId, status);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update ride status');
    }
  }
);

const driverSlice = createSlice({
  name: 'driver',
  initialState,
  reducers: {
    toggleOnlineStatus(state) {
      state.isOnline = !state.isOnline;
      if (!state.isOnline) {
        state.availableRequests = []; // Clear queue when going offline
      }
    },
    setActiveRide(state, action) {
      state.activeRide = action.payload;
    },
    clearDriverError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Available
      .addCase(fetchAvailableRequests.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAvailableRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.availableRequests = action.payload.items;
      })
      .addCase(fetchAvailableRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Accept Ride
      .addCase(acceptRideRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(acceptRideRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.activeRide = action.payload;
        // Remove from available pool
        state.availableRequests = state.availableRequests.filter(r => r.id !== action.payload.id);
      })
      .addCase(acceptRideRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Status
      .addCase(updateActiveRideStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateActiveRideStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.activeRide = action.payload;
        if (action.payload.status === 'completed' || action.payload.status === 'cancelled') {
          state.activeRide = null; // Clear it out so they can take next ride
        }
      })
      .addCase(updateActiveRideStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { toggleOnlineStatus, setActiveRide, clearDriverError } = driverSlice.actions;
export default driverSlice.reducer;
