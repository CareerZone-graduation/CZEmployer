import apiClient from './apiClient';

/**
 * Enhance job content with AI
 * @param {Object} jobData - Job data to enhance
 * @returns {Promise} Enhanced job data
 */
export const enhanceJobContent = async (jobData) => {
  const response = await apiClient.post('/ai/enhance-job', jobData, {
    timeout: 60000 // 60 seconds timeout for AI processing
  });
  return response;
};


