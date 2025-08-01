import apiClient from './apiClient'

// Tạo job mới
export const createJob = async (jobData) => {
  return await apiClient.post('/jobs', jobData, { showToast: true })
}

// Lấy danh sách jobs của tôi với phân trang
export const getMyJobs = async (params = {}) => {
  return await apiClient.get('/jobs/my-jobs', { params })
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
