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
 * Get candidate CV (masked or original based on unlock status)
 * @param {string} userId - User ID
 * @param {string} cvId - CV ID
 * @returns {Promise<ArrayBuffer>} PDF file as ArrayBuffer
 */
export const getCandidateCv = async (userId, cvId) => {
  const response = await apiClient.get(`/recruiters/candidates/${userId}/cv/${cvId}`, {
    responseType: 'arraybuffer'
  });
  return response;
};
