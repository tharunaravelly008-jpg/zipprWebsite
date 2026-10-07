import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../../api/authApi';

const initialState = {
  user: null,
  accessToken: localStorage.getItem('zippr_access_token') || null,
  refreshToken: localStorage.getItem('zippr_refresh_token') || null,
  isAuthenticated: !!localStorage.getItem('zippr_access_token'),
  loading: false,
  error: null,
};

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const data = await authApi.login(credentials);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const data = await authApi.register(userData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Registration failed');
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const data = await authApi.getCurrentUser();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch user profile');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await authApi.logout();
      return true;
    } catch (error) {
      // Even if server logout fails, we clear local state
      return true; 
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    refreshSuccess(state, action) {
      const { access_token, refresh_token } = action.payload;
      state.accessToken = access_token;
      if (refresh_token) {
        state.refreshToken = refresh_token;
        localStorage.setItem('zippr_refresh_token', refresh_token);
      }
      localStorage.setItem('zippr_access_token', access_token);
    },
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      
      localStorage.removeItem('zippr_access_token');
      localStorage.removeItem('zippr_refresh_token');
    },
    // Allows Profile page to patch the cached user object after a successful PATCH /users/me
    updateUser(state, action) {
      state.user = { ...state.user, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        const { user, access_token, refresh_token } = action.payload;
        state.user = user;
        state.accessToken = access_token;
        state.refreshToken = refresh_token;
        state.isAuthenticated = true;
        state.loading = false;
        
        localStorage.setItem('zippr_access_token', access_token);
        localStorage.setItem('zippr_refresh_token', refresh_token);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        const { user, access_token, refresh_token } = action.payload;
        state.user = user;
        state.accessToken = access_token;
        state.refreshToken = refresh_token;
        state.isAuthenticated = true;
        state.loading = false;
        
        localStorage.setItem('zippr_access_token', access_token);
        localStorage.setItem('zippr_refresh_token', refresh_token);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Current User
      .addCase(fetchCurrentUser.pending, (state) => {
        // Only show loading if we don't have a user object yet
        if (!state.user) {
          state.loading = true;
        }
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // If we fail to fetch the current user, clear tokens since they are likely invalid
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        localStorage.removeItem('zippr_access_token');
        localStorage.removeItem('zippr_refresh_token');
      })
      // Logout User
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
        
        localStorage.removeItem('zippr_access_token');
        localStorage.removeItem('zippr_refresh_token');
      });
  }
});

export const { refreshSuccess, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
