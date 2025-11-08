import apiClient from './apiClient';

/**
 * Get candidate profile by user ID
 * @param {string} userId - User ID
 * @returns {Promise} API response
 */
export const getCandidateProfile = async (userId) => {
  const response = await apiClient.get(`/recruiters/candidates/${userId}`);
  return response;
};

/**
 * Unlock candidate profile (purchase access)
 * @param {string} userId - User ID
 * @returns {Promise} API response
 */
export const unlockCandidateProfile = async (userId) => {
  const response = await apiClient.post(`/recruiters/candidates/${userId}/unlock`);
  return response.data;
};
