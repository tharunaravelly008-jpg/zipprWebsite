import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminApi } from '../../api/adminApi';

const initialState = {
  summary: {
    total_riders: 0,
    total_drivers: 0,
    active_rides: 0,
    total_earnings: 0,
  },
  usersList: [],
  driversList: [],
  ridesList: [],
  loading: false,
  error: null,
};

export const fetchAnalyticsSummary = createAsyncThunk(
  'admin/fetchAnalyticsSummary',
  async (_, { rejectWithValue }) => {
    try {
      const data = await adminApi.getAnalyticsSummary();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch summary');
    }
  }
);

export const fetchUsersList = createAsyncThunk(
  'admin/fetchUsersList',
  async (params, { rejectWithValue }) => {
    try {
      const data = await adminApi.getUsers(params);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch users');
    }
  }
);

export const fetchDriversList = createAsyncThunk(
  'admin/fetchDriversList',
  async (params, { rejectWithValue }) => {
    try {
      const data = await adminApi.getDrivers(params);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch drivers');
    }
  }
);

export const fetchRidesList = createAsyncThunk(
  'admin/fetchRidesList',
  async (params, { rejectWithValue }) => {
    try {
      const data = await adminApi.getRides(params);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch rides');
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Summary
      .addCase(fetchAnalyticsSummary.pending, (state) => { state.loading = true; })
      .addCase(fetchAnalyticsSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload;
      })
      .addCase(fetchAnalyticsSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Users
      .addCase(fetchUsersList.pending, (state) => { state.loading = true; })
      .addCase(fetchUsersList.fulfilled, (state, action) => {
        state.loading = false;
        state.usersList = action.payload;
      })
      .addCase(fetchUsersList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Drivers
      .addCase(fetchDriversList.pending, (state) => { state.loading = true; })
      .addCase(fetchDriversList.fulfilled, (state, action) => {
        state.loading = false;
        state.driversList = action.payload;
      })
      .addCase(fetchDriversList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Rides
      .addCase(fetchRidesList.pending, (state) => { state.loading = true; })
      .addCase(fetchRidesList.fulfilled, (state, action) => {
        state.loading = false;
        state.ridesList = action.payload;
      })
      .addCase(fetchRidesList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default adminSlice.reducer;
