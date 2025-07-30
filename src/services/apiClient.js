import axios from 'axios';
import { getAccessToken, saveAccessToken } from '@/utils/token';
import { forcedLogout } from '@/utils/auth';
import { refreshToken } from './authService';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Lấy URL từ biến môi trường
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
    // ----- Toast cho request thành công -----
    const { data } = res;
    return data;
  },
  async (error) => {
    const { response, config } = error;

    // ----- Logic Refresh Token cho lỗi 401 -----
    if (response?.status === 401 && !config._retry) {
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
        await forcedLogout();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
