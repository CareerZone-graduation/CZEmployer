import axios from 'axios';
import { getAccessToken, saveAccessToken } from '@/utils/token';
import { refreshToken } from './authService';
import { logoutSuccess } from '@/redux/authSlice';

// 1. Create a variable to hold the store.
let store;

// 2. Create an exported function to allow the store to be injected.
export const setupApiClient = (appStore) => {
  store = appStore;
};

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + '/api', 
  timeout: 15000,
  withCredentials: false, // KHÔNG gửi cookie mặc định
});

// ----- gắn Authorization -----
apiClient.interceptors.request.use((config) => {
  config.metadata = { startTime: new Date() };
  const token = getAccessToken();
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});

// ----- Refresh Token Flow -----
let isRefreshing = false;
let queue = [];

function subscribeRefresh(cb) {
  queue.push(cb);
}
function publishRefresh(token) {
  queue.forEach((cb) => cb(token));
  queue = [];
}

// forcedLogout được import từ utils/auth.js

apiClient.interceptors.response.use(
  (res) => {
    // Nếu responseType là arraybuffer, trả về response gốc
    if (res.config.responseType === 'arraybuffer') {
      return res.data;
    }
    const { data } = res;
    return data;
  },
  async (error) => {
    const { response, config } = error;

    // ----- Logic Refresh Token cho lỗi 401 -----
    // Thêm điều kiện kiểm tra URL tại đây
    if (
      response?.status === 401 &&
      !config._retry &&
      !config.url.includes('/auth/login')
    ) {
      config._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeRefresh((token) => {
            if (!token) return reject(error);
            config.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(config));
          });
        });
      }

      isRefreshing = true;
      try {
        // Break the circular dependency by calling the refresh endpoint directly
        const refreshResponse = await refreshToken();
        console.log("Refresh response:", refreshResponse);

        // 🚨 THAY ĐỔI Ở ĐÂY 🚨
        // refreshResponse bây giờ là data, không phải là response object đầy đủ
        const { accessToken } = refreshResponse.data;
        console.log("Refreshed access token:", accessToken);

        saveAccessToken(accessToken);

        publishRefresh(accessToken);

        config.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(config);
      } catch (refreshErr) {
        publishRefresh(null);
        // 3. Use the injected store.
        if (store) {
          // Disconnect socket before logout
          import('@/services/socketService').then(({ default: socketService }) => {
            socketService.disconnect();
          });
          store.dispatch(logoutSuccess());
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
