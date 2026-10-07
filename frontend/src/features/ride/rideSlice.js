import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { rideApi } from '../../api/rideApi';

const initialState = {
  currentRide: null,          
  searchPickup: '',
  searchDrop: '',
  pickupCoords: null,         // [lat, lng]
  dropCoords: null,           // [lat, lng]
  estimates: [],              
  selectedVehicle: null,      
  bookingStep: 'idle',        // idle, estimate, matching, assigned, ongoing, completed
  driverLocation: null,       
  history: [],
  historyTotal: 0,
  loading: false,
  error: null,
};

export const fetchEstimates = createAsyncThunk(
  'ride/fetchEstimates',
  async (payload, { rejectWithValue }) => {
    try {
      const data = await rideApi.getEstimates(payload);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to get estimates');
    }
  }
);

export const requestNewRide = createAsyncThunk(
  'ride/requestNewRide',
  async (payload, { rejectWithValue }) => {
    try {
      const data = await rideApi.createBooking(payload);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to book ride');
    }
  }
);

export const fetchRideHistory = createAsyncThunk(
  'ride/fetchRideHistory',
  async (params, { rejectWithValue }) => {
    try {
      const data = await rideApi.getRideHistory(params);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch history');
    }
  }
);

export const submitRideRating = createAsyncThunk(
  'ride/submitRideRating',
  async ({ rideId, payload }, { rejectWithValue }) => {
    try {
      const data = await rideApi.rateRide(rideId, payload);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to submit rating');
    }
  }
);

const rideSlice = createSlice({
  name: 'ride',
  initialState,
  reducers: {
    setSearchLocations(state, action) {
      const { pickup, drop, pickupCoords, dropCoords } = action.payload;
      state.searchPickup = pickup;
      state.searchDrop = drop;
      state.pickupCoords = pickupCoords;
      state.dropCoords = dropCoords;
      if (pickupCoords && dropCoords) {
        state.bookingStep = 'estimate';
      }
    },
    setSelectedVehicle(state, action) {
      state.selectedVehicle = action.payload;
    },
    setBookingStep(state, action) {
      state.bookingStep = action.payload;
    },
    setCurrentRide(state, action) {
      state.currentRide = action.payload;
      if (action.payload) {
        state.bookingStep = action.payload.status;
      }
    },
    clearRideState(state) {
      state.currentRide = null;
      state.searchPickup = '';
      state.searchDrop = '';
      state.pickupCoords = null;
      state.dropCoords = null;
      state.estimates = [];
      state.selectedVehicle = null;
      state.bookingStep = 'idle';
      state.driverLocation = null;
      state.error = null;
    },
    setRideError(state, action) {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Estimates
      .addCase(fetchEstimates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEstimates.fulfilled, (state, action) => {
        state.loading = false;
        state.estimates = action.payload;
      })
      .addCase(fetchEstimates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Request New Ride
      .addCase(requestNewRide.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.bookingStep = 'matching';
      })
      .addCase(requestNewRide.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRide = action.payload;
        // The backend sets initial status to "requested"
        state.bookingStep = action.payload.status; 
      })
      .addCase(requestNewRide.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.bookingStep = 'estimate'; // Revert back to estimate view on error
      })
      // Fetch History
      .addCase(fetchRideHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRideHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload.items;
        state.historyTotal = action.payload.total;
      })
      .addCase(fetchRideHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Submit Rating
      .addCase(submitRideRating.pending, (state) => {
        state.loading = true;
      })
      .addCase(submitRideRating.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(submitRideRating.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  setSearchLocations,
  setSelectedVehicle,
  setBookingStep,
  setCurrentRide,
  clearRideState,
  setRideError,
} = rideSlice.actions;

export default rideSlice.reducer;
