import apiClient from './apiClient';

/**
 * Thêm candidate vào talent pool
 * @param {string} applicationId - ID của đơn ứng tuyển
 * @param {Array<string>} tags - Tags cho candidate
 * @param {string} notes - Ghi chú
 * @returns {Promise<object>}
 */
export const addToTalentPool = async (applicationId, tags = [], notes = '') => {
  const payload = { applicationId };
  
  // Only include tags if it's a non-empty array
  if (Array.isArray(tags) && tags.length > 0) {
    payload.tags = tags;
  }
  
  // Only include notes if not empty
  if (notes && notes.trim()) {
    payload.notes = notes;
  }
  
  return await apiClient.post('/talent-pool', payload);
};

/**
 * Xóa candidate khỏi talent pool
 * @param {string} talentPoolId - ID của talent pool entry
 * @returns {Promise<object>}
 */
export const removeFromTalentPool = async (talentPoolId) => {
  return await apiClient.delete(`/talent-pool/${talentPoolId}`);
};

/**
 * Lấy danh sách talent pool
 * @param {object} params - Query params (page, limit, search, sort, tags)
 * @returns {Promise<object>}
 */
export const getTalentPool = async (params = {}) => {
  // Convert tags array to comma-separated string
  const queryParams = { ...params };
  if (Array.isArray(queryParams.tags) && queryParams.tags.length > 0) {
    queryParams.tags = queryParams.tags.join(',');
  } else if (Array.isArray(queryParams.tags)) {
    delete queryParams.tags; // Remove empty array
  }
  return await apiClient.get('/talent-pool', { params: queryParams });
};

/**
 * Cập nhật talent pool entry
 * @param {string} talentPoolId - ID của talent pool entry
 * @param {Array<string>} tags - Tags mới
 * @param {string} notes - Notes mới
 * @returns {Promise<object>}
 */
export const updateTalentPoolEntry = async (talentPoolId, tags, notes) => {
  return await apiClient.patch(`/talent-pool/${talentPoolId}`, {
    tags,
    notes
  });
};
