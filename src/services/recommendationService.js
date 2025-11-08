import apiClient from './apiClient';

/**
 * Get candidate suggestions for a job
 * @param {string} jobId - Job ID
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 10)
 * @param {number} params.minScore - Minimum similarity score (default: 0.5)
 * @returns {Promise<Object>} Suggestion results
 */
export const getCandidateSuggestions = async (jobId, params = {}) => {
  return await apiClient.get(`/jobs/${jobId}/suggestions`, { params });
};
