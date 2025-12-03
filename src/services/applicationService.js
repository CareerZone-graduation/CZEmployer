import apiClient from './apiClient';

/**
 * Lấy danh sách ứng viên cho một tin tuyển dụng cụ thể.
 * @param {string} jobId - ID của tin tuyển dụng.
 * @param {object} params - Các tham số truy vấn (page, limit, status, sort, search, etc.).
 * @returns {Promise<object>}
 */
export const getJobApplications = async (jobId, params = {}) => {
  return await apiClient.get(`/applications/jobs/${jobId}/applications`, { params });
};

/**
 * Lấy chi tiết một đơn ứng tuyển bằng ID.
 * @param {string} applicationId - ID của đơn ứng tuyển.
 * @returns {Promise<object>}
 */
export const getApplicationById = async (applicationId) => {
  return await apiClient.get(`/applications/${applicationId}`);
};

/**
 * Cập nhật trạng thái của một đơn ứng tuyển.
 * @param {string} applicationId - ID của đơn ứng tuyển.
 * @param {string} status - Trạng thái mới.
 * @returns {Promise<object>}
 */
export const updateApplicationStatus = async (applicationId, status) => {
  return await apiClient.patch(`/applications/${applicationId}/status`, { status });
};



/**
 * Cập nhật ghi chú cho đơn ứng tuyển.
 * @param {string} applicationId - ID của đơn ứng tuyển.
 * @param {string} notes - Ghi chú mới.
 * @returns {Promise<object>}
 */
export const updateApplicationNotes = async (applicationId, notes) => {
  return await apiClient.patch(`/applications/${applicationId}/notes`, { notes });
};

/**
 * Lên lịch phỏng vấn cho một đơn ứng tuyển.
 * @param {string} applicationId - ID của đơn ứng tuyển.
 * @param {string} scheduledTime - Thời gian phỏng vấn (ISO string).
 * @returns {Promise<object>}
 */
export const scheduleInterview = async (applicationId, scheduledTime) => {
  return await apiClient.post(`/applications/${applicationId}/interviews`, { scheduledTime });
};


