import apiClient from './apiClient';

/**
 * Create a new support request
 * @param {Object} data - Support request data (subject, description, category)
 * @param {Array<File>} files - Array of file objects
 * @returns {Promise} API response
 */
export const createSupportRequest = async (data, files = []) => {
  const formData = new FormData();
  
  // Append text fields
  formData.append('subject', data.subject);
  formData.append('description', data.description);
  formData.append('category', data.category);
  
  // Append files
  if (files && files.length > 0) {
    files.forEach((file) => {
      formData.append('attachments', file);
    });
  }
  
  const response = await apiClient.post('/support-requests', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

/**
 * Get user's support requests with filters
 * @param {Object} filters - Filter options (status, category, page, limit)
 * @returns {Promise} API response
 */
export const getUserSupportRequests = async (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.status) params.append('status', filters.status);
  if (filters.category) params.append('category', filters.category);
  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);
  
  const response = await apiClient.get('/support-requests', { params });
  return response.data;
};

/**
 * Get support request by ID
 * @param {string} id - Support request ID
 * @returns {Promise} API response
 */
export const getSupportRequestById = async (id) => {
  const response = await apiClient.get(`/support-requests/${id}`);
  return response.data;
};

/**
 * Add follow-up message to support request
 * @param {string} id - Support request ID
 * @param {string} message - Message content
 * @param {Array<File>} files - Array of file objects
 * @returns {Promise} API response
 */
export const addFollowUpMessage = async (id, message, files = []) => {
  const formData = new FormData();
  
  formData.append('content', message);
  
  // Append files
  if (files && files.length > 0) {
    files.forEach((file) => {
      formData.append('attachments', file);
    });
  }
  
  const response = await apiClient.post(`/support-requests/${id}/messages`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

/**
 * Mark admin response as read
 * @param {string} id - Support request ID
 * @returns {Promise} API response
 */
export const markAsRead = async (id) => {
  const response = await apiClient.patch(`/support-requests/${id}/read`);
  return response.data;
};
