import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as notificationService from '@/services/notificationService';

// Async thunk để fetch notifications
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await notificationService.getNotifications({
        page: params.page || 1,
        limit: params.limit || 10,
        ...params
      });
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

// Async thunk để fetch unread count
export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const count = await notificationService.getUnreadCount();
      return count;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch unread count');
    }
  }
);

// Async thunk để fetch recent notifications
export const fetchRecentNotifications = createAsyncThunk(
  'notifications/fetchRecentNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const notifications = await notificationService.getRecentNotifications();
      console.log('Fetched recent notifications:', notifications);
      return notifications;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch recent notifications');
    }
  }
);

// Async thunk để mark as read
export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      await notificationService.markNotificationAsRead(notificationId);
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark as read');
    }
  }
);

// Async thunk để mark all as read
export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await notificationService.markAllAsRead();
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark all as read');
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    notifications: [],
    recentNotifications: [],
    unreadCount: 0,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      pages: 0
    },
    loading: false,
    error: null,
    initialized: false // Track if notifications have been loaded
  },
  reducers: {
    // Action để thêm notification mới (khi nhận từ Firebase push)
    addNewNotification: (state, action) => {
      const newNotification = action.payload;
      
      // Thêm vào recent notifications nếu chưa có
      const existsInRecent = state.recentNotifications.some(n => n._id === newNotification._id);
      if (!existsInRecent) {
        state.recentNotifications.unshift(newNotification);
        // Giữ tối đa 5 notifications
        if (state.recentNotifications.length > 5) {
          state.recentNotifications.pop();
        }
      }
      
      // Thêm vào list notifications nếu đang ở trang 1
      if (state.pagination.page === 1) {
        const existsInList = state.notifications.some(n => n._id === newNotification._id);
        if (!existsInList) {
          state.notifications.unshift(newNotification);
        }
      }
      
      // Tăng unread count nếu notification chưa đọc
      if (!newNotification.isRead) {
        state.unreadCount += 1;
      }
    },

    incrementUnreadCount: (state) => {
      state.unreadCount += 1;
    },
    
    // Action để clear notifications khi logout
    clearNotifications: (state) => {
      state.notifications = [];
      state.recentNotifications = [];
      state.unreadCount = 0;
      state.pagination = {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
      };
      state.loading = false;
      state.error = null;
      state.initialized = false;
    },
    
    // Action để update notification locally
    updateNotification: (state, action) => {
      const { id, updates } = action.payload;
      
      // Update in notifications list
      const notifIndex = state.notifications.findIndex(n => n._id === id);
      if (notifIndex !== -1) {
        state.notifications[notifIndex] = {
          ...state.notifications[notifIndex],
          ...updates
        };
      }
      
      // Update in recent notifications
      const recentIndex = state.recentNotifications.findIndex(n => n._id === id);
      if (recentIndex !== -1) {
        state.recentNotifications[recentIndex] = {
          ...state.recentNotifications[recentIndex],
          ...updates
        };
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload?.data || [];
        if (action.payload?.meta) {
          state.pagination = {
            page: action.payload.meta.currentPage || 1,
            limit: action.payload.meta.limit || 10,
            total: action.payload.meta.totalItems || 0,
            pages: action.payload.meta.totalPages || 0
          };
        }
        state.initialized = true;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch unread count
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      
      // Fetch recent notifications
      .addCase(fetchRecentNotifications.fulfilled, (state, action) => {
        state.recentNotifications = action.payload;
      })
      
      // Mark as read
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notificationId = action.payload;
        
        // Update in notifications list
        const notifIndex = state.notifications.findIndex(n => n._id === notificationId);
        if (notifIndex !== -1 && !state.notifications[notifIndex].isRead) {
          state.notifications[notifIndex].isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        
        // Update in recent notifications
        const recentIndex = state.recentNotifications.findIndex(n => n._id === notificationId);
        if (recentIndex !== -1 && !state.recentNotifications[recentIndex].isRead) {
          state.recentNotifications[recentIndex].isRead = true;
        }
      })
      
      // Mark all as read
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map(n => ({ ...n, isRead: true }));
        state.recentNotifications = state.recentNotifications.map(n => ({ ...n, isRead: true }));
        state.unreadCount = 0;
      });
  }
});

export const { addNewNotification, clearNotifications, updateNotification, incrementUnreadCount } = notificationSlice.actions;
export default notificationSlice.reducer;
