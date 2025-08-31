import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getMe } from '@/services/authService';
import * as tokenUtil from '@/utils/token';

// Async thunk to fetch user data
// gọi cái này để lấy thông tin người dùng đầu đủ, để lưu vào state, còn login k đủ
export const fetchUser = createAsyncThunk('auth/fetchUser', async (_, { rejectWithValue }) => {
  const token = tokenUtil.getAccessToken();
  if (!token) {
    return rejectWithValue('No token found');
  }
  try {
    const response = await getMe();
    return response.data; // This should contain { user, profile }
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Failed to fetch user');
  }
});

const initialState = {
  user: null, // Will hold { user, profile }
  isAuthenticated: false,
  isEmailVerified: false, // NEW: Track email verification status
  isInitializing: true, // To track the initial user fetch
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      const {  accessToken } = action.payload;
      tokenUtil.saveAccessToken(accessToken);
      state.isAuthenticated = true;
    },
    logoutSuccess: (state) => {
      tokenUtil.clearAccessToken();
      state.user = null;
      state.isAuthenticated = false;
      state.isEmailVerified = false;
    },
    updateCoinBalance: (state, action) => {
      if (state.user && state.user.user) {
        state.user.user.coinBalance = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, () => {
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isEmailVerified = action.payload.user?.isEmailVerified || false;
        state.isInitializing = false; // Chỉ set về false
        state.error = null;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isEmailVerified = false;
        state.isInitializing = false;
        state.error = action.payload;
      });
  },
});

export const { loginSuccess, logoutSuccess, updateCoinBalance } = authSlice.actions;

export default authSlice.reducer;