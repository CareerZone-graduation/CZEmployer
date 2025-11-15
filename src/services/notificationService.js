// src/services/notificationService.js
import apiClient from './apiClient';

/**
 * Lấy danh sách thông báo có phân trang.
 * @param {object} params
 * @param {number} params.page - Số trang (bắt đầu từ 1)
 * @param {number} params.limit - Số lượng mục trên mỗi trang
 * @param {string} params.type - Lọc theo loại thông báo
 * @param {string} params.read - Lọc theo trạng thái đọc (true/false/all)
 * @returns {Promise<{data: Notification[], meta: object}>}
 */
export const getNotifications = async ({ page = 1, limit = 10, type, read }) => {
  const params = new URLSearchParams();
  params.append('page', page);
  params.append('limit', limit);
  if (type) params.append('type', type);
  if (read !== undefined) params.append('read', read);

  const response = await apiClient.get(`/notifications?${params.toString()}`);
  // API returns: { success, message, data: [...], meta: {...} }
  return {
    data: response.data,
    meta: response.meta
  };
};

/**
 * Lấy số lượng thông báo chưa đọc.
 * @returns {Promise<number>}
 */
export const getUnreadCount = async () => {
  const response = await apiClient.get('/notifications/unread-count');
  return response.data.unreadCount;
};

/**
 * Đánh dấu một thông báo là đã đọc.
 * @param {string} notificationId - ID của thông báo
 * @returns {Promise<object>}
 */
export const markNotificationAsRead = async (notificationId) => {
  const response = await apiClient.patch(`/notifications/${notificationId}/read`);
  return response.data;
};

/**
 * Đánh dấu tất cả thông báo là đã đọc.
 * @returns {Promise<{success: boolean}>}
 */
export const markAllAsRead = async () => {
  const response = await apiClient.patch('/notifications/read-all');
  return { success: response.success };
};

/**
 * Lấy thông báo gần nhất chưa đọc (dùng cho dropdown).
 * @returns {Promise<Notification[]>}
 */
export const getRecentNotifications = async () => {
  const response = await apiClient.get('/notifications?page=1&limit=5&read=false');
  // API returns: { success, message, data: [...], meta: {...} }
  return response.data;
};
