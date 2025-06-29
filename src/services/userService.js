import apiClient from './apiClient';

/**
 * Get current user profile
 * @returns {Promise<import('axios').AxiosResponse<{
 *   success: boolean,
 *   message: string,
 *   data: {
 *     id: string,
 *     email: string,
 *     role: string,
 *     name: string,
 *     company: string,
 *     active: boolean
 *   }
 * }>>}
 */

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Promise<import('axios').AxiosResponse<{
 *   success: boolean,
 *   message: string,
 *   data: {
 *     id: string,
 *     email: string,
 *     role: string,
 *     name: string,
 *     company: string,
 *     active: boolean
 *   }
 * }>>}
 */
export const getUserById = (userId) => apiClient.get(`/users/${userId}`);

/**
 * Update user profile
 * @param {Object} userData - User data to update
 * @returns {Promise<import('axios').AxiosResponse<any>>}
 */
export const updateProfile = (userData) => apiClient.put('/users/profile', userData);

/**
 * Change password
 * @param {{ currentPassword: string, newPassword: string }} passwords 
 * @returns {Promise<import('axios').AxiosResponse<any>>}
 */
export const changePassword = (passwords) => apiClient.post('/users/change-password', passwords);
