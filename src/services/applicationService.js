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

// ==========================================================
// === NEW: ALL CANDIDATES MANAGEMENT APIs ===
// ==========================================================

/**
 * Lấy TẤT CẢ ứng viên từ tất cả các jobs của công ty
 * @param {object} params - Các tham số truy vấn (page, limit, status, search, jobIds, fromDate, toDate, sort)
 * @returns {Promise<object>}
 */
export const getAllApplications = async (params = {}) => {
  return await apiClient.get('/applications/recruiter/all', { params });
};

/**
 * Lấy thống kê tổng quan về applications
 * @param {object} params - Filters (jobIds, fromDate, toDate)
 * @returns {Promise<object>}
 */
export const getApplicationsStatistics = async (params = {}) => {
  return await apiClient.get('/applications/recruiter/statistics', { params });
};

/**
 * Bulk update status cho nhiều applications
 * @param {Array<string>} applicationIds - Mảng các application IDs
 * @param {string} status - Status mới
 * @returns {Promise<object>}
 */
export const bulkUpdateStatus = async (applicationIds, status) => {
  return await apiClient.patch('/applications/recruiter/bulk/status', {
    applicationIds,
    status
  });
};

/**
 * Export applications to CSV
 * @param {Array<string>} applicationIds - Mảng các application IDs
 * @returns {Promise<object>}
 */
export const exportApplications = async (applicationIds) => {
  return await apiClient.post('/applications/recruiter/export', {
    applicationIds
  });
};
