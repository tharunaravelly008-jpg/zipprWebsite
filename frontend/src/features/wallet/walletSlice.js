import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { walletApi } from '../../api/walletApi';

const initialState = {
  balance: 0.00,
  currency: 'INR',
  transactions: [],
  loading: false,
  addMoneyLoading: false,
  error: null,
};

export const fetchWallet = createAsyncThunk(
  'wallet/fetchWallet',
  async (_, { rejectWithValue }) => {
    try {
      return await walletApi.getWallet();
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Wallet not found');
    }
  }
);

export const fetchTransactions = createAsyncThunk(
  'wallet/fetchTransactions',
  async (_, { rejectWithValue }) => {
    try {
      return await walletApi.getTransactions();
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to load transactions');
    }
  }
);

export const addMoneyToWallet = createAsyncThunk(
  'wallet/addMoney',
  async ({ amount, method }, { rejectWithValue }) => {
    try {
      return await walletApi.addMoney({ amount, method });
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to add money');
    }
  }
);

export const processRidePayment = createAsyncThunk(
  'wallet/processPayment',
  async ({ ride_id, method }, { rejectWithValue }) => {
    try {
      return await walletApi.processPayment({ ride_id, method });
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Payment failed');
    }
  }
);

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    clearWalletError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch wallet
      .addCase(fetchWallet.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchWallet.fulfilled, (state, action) => {
        state.loading = false;
        state.balance = action.payload.balance;
        state.currency = action.payload.currency || 'INR';
      })
      .addCase(fetchWallet.rejected, (state, action) => {
        state.loading = false;
        // Wallet may not exist yet — treat as zero balance, not an error
        state.balance = 0;
        state.error = null;
      })
      // Fetch transactions
      .addCase(fetchTransactions.pending, (state) => { state.loading = true; })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add money
      .addCase(addMoneyToWallet.pending, (state) => { state.addMoneyLoading = true; state.error = null; })
      .addCase(addMoneyToWallet.fulfilled, (state, action) => {
        state.addMoneyLoading = false;
        state.balance = action.payload.balance;
      })
      .addCase(addMoneyToWallet.rejected, (state, action) => {
        state.addMoneyLoading = false;
        state.error = action.payload;
      })
      // Process payment
      .addCase(processRidePayment.pending, (state) => { state.loading = true; })
      .addCase(processRidePayment.fulfilled, (state) => { state.loading = false; })
      .addCase(processRidePayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearWalletError } = walletSlice.actions;
export default walletSlice.reducer;
