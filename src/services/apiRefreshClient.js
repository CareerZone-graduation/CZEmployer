// src/services/apiRefreshClient.js
import axios from 'axios';

// Instance này CHỈ dùng để refresh token
// Nó không có request interceptor để gắn Authorization header
const apiRefreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + '/api',
  timeout: 10000,
  // Rất quan trọng: để gửi httpOnly cookie chứa refresh token
  withCredentials: true, 
});

// Chúng ta có thể thêm response interceptor để xử lý data trả về nếu cần,
// nhưng không cần request interceptor.
apiRefreshClient.interceptors.response.use(
  (res) => res.data, // Trả về thẳng `data` cho tiện
  (error) => Promise.reject(error) // Ném lỗi ra ngoài
);

export default apiRefreshClient;
