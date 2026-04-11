import apiClient from './apiClient'

// Tạo job mới
export const createJob = async (jobData) => {
  return await apiClient.post('/jobs', jobData, { showToast: true })
}

// Lấy danh sách jobs của tôi với phân trang
export const getMyJobs = async (params = {}) => {
  return await apiClient.get('/jobs/my-jobs', { params })
}

// Lấy thống kê mini dashboard cho trang quản lý tin
export const getJobsMiniDashboard = async () => {
  return await apiClient.get('/jobs/my-jobs/mini-dashboard')
}

// Lấy danh sách jobs (public)
export const getJobs = async (params = {}) => {
  return await apiClient.get('/jobs', { params })
}

// Lấy job theo ID
export const getJobById = async (jobId) => {
  return await apiClient.get(`/jobs/${jobId}`)
}

// Cập nhật job
export const updateJob = async (jobId, jobData) => {
  return await apiClient.put(`/jobs/${jobId}`, jobData, { showToast: true })
}

// Xóa job
export const deleteJob = async (jobId) => {
  return await apiClient.delete(`/jobs/${jobId}`, { showToast: true })
}

// Lấy chi tiết tin tuyển dụng cho nhà tuyển dụng
export const getRecruiterJobById = async (jobId) => {
  return await apiClient.get(`/jobs/recruiter/${jobId}`);
};


/**
 * Search job titles for autocomplete
 * @param {string} query - Search query
 * @param {number} limit - Maximum results
 * @returns {Promise<string[]>} Array of job titles
 */
export const searchJobTitles = async (query, limit = 10) => {
  console.log('Calling API with query:', query);
  const response = await apiClient.get('/jobs/suggestions/titles', {
    params: { q: query, limit }
  });
  console.log('API response:', response);
  // apiClient already unwraps to response.data, so response = { success, data }
  return response.data || [];
};

/**
 * Get popular job titles
 * @param {number} limit - Maximum results
 * @returns {Promise<string[]>} Array of popular job titles
 */
export const getPopularJobTitles = async (limit = 20) => {
  const response = await apiClient.get('/jobs/suggestions/popular', {
    params: { limit }
  });
  return response.data || [];
};
