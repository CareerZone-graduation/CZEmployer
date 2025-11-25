import apiClient from './apiClient';
// Import instance mới
import apiRefreshClient from './apiRefreshClient';

// 🚨 THAY ĐỔI Ở ĐÂY 🚨
// Hàm refreshToken bây giờ sẽ dùng apiRefreshClient để tránh vòng lặp interceptor
export const refreshToken = () =>
  apiRefreshClient.post('/auth/refresh'); // Không cần truyền null và config nữa vì đã set trong instance

export const logoutServer = () =>
  apiClient.post('/auth/logout', null, { withCredentials: true });

/**
 * Login with email and password
 * @param {{ email: string, password: string }} credentials 
 * @returns {Promise<import('axios').AxiosResponse<{
 *   success: boolean,
 *   message: string,
 *   data: {
 *     id: string,
 *     email: string,
 *     role: string,
 *     active: boolean,
 *     accessToken: string
 *   }
 * }>>}
 */
export const login = (credentials) =>
  apiClient.post('/auth/login', credentials, { withCredentials: true });

/**
 * Login with Google
 * @param {string} token 
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export const googleLogin = (token) =>
  apiClient.post('/auth/google-login', { token, role: 'recruiter' }, { withCredentials: true });



export const getMe = (axiosConfig = {}) =>
  apiClient.get('/users/me', { ...axiosConfig, withCredentials: true });

/**
 * Register a new user account
 * @param {{username: string, email: string, password: string, fullName: string, role: string}} userData
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export const register = (userData) => apiClient.post('/auth/register', userData);

/**
 * Resend verification email
 * @param {{ email: string }} payload
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export const resendVerificationEmail = (payload) =>
  apiClient.post('/auth/resend-verification', payload);

/**
 * Send forgot password email
 * @param {{ email: string }} payload
 * @returns {Promise<import('axios').AxiosResponse<{
 *   success: boolean,
 *   message: string
 * }>>}
 */
export const forgotPassword = (payload) =>
  apiClient.post('/auth/forgot-password', payload);

/**
 * Reset password with token
 * @param {{ token: string, newPassword: string }} payload
 * @returns {Promise<import('axios').AxiosResponse<{
 *   success: boolean,
 *   message: string
 * }>>}
 */
export const resetPassword = (payload) =>
  apiClient.post('/auth/reset-password', payload);
