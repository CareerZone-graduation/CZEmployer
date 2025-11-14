// src/hooks/useNotifications.js
import { useState, useEffect, useCallback } from 'react';
import * as notificationService from '@/services/notificationService';
import { toast } from 'react-toastify';

/**
 * Custom hook để quản lý notifications
 * @param {object} options
 * @param {boolean} options.autoFetch - Tự động fetch khi mount
 * @param {number} options.refreshInterval - Thời gian refresh tự động (ms)
 */
export const useNotifications = ({ 
  autoFetch = true, 
  refreshInterval = null 
} = {}) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // Fetch notifications
  const fetchNotifications = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await notificationService.getNotifications({
        page: pagination.page,
        limit: pagination.limit,
        ...params
      });
      
      setNotifications(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.meta.total,
        pages: response.meta.pages,
        page: response.meta.page
      }));
    } catch (err) {
      setError(err.message || 'Không thể tải thông báo');
      toast.error('Không thể tải thông báo');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await notificationService.markNotificationAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n._id === notificationId ? { ...n, read: true } : n
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      toast.error('Không thể đánh dấu đã đọc');
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
      
      setUnreadCount(0);
      toast.success('Đã đánh dấu tất cả là đã đọc');
    } catch {
      toast.error('Không thể đánh dấu tất cả đã đọc');
    }
  }, []);

  // Change page
  const changePage = useCallback((newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  }, []);

  // Refresh
  const refresh = useCallback(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  // Auto fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [autoFetch, fetchNotifications, fetchUnreadCount]);

  // Auto refresh
  useEffect(() => {
    if (refreshInterval) {
      const interval = setInterval(() => {
        fetchUnreadCount();
      }, refreshInterval);
      
      return () => clearInterval(interval);
    }
  }, [refreshInterval, fetchUnreadCount]);

  // Refetch when page changes
  useEffect(() => {
    if (autoFetch && pagination.page > 1) {
      fetchNotifications();
    }
  }, [pagination.page, autoFetch, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    pagination,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    changePage,
    refresh
  };
};

export default useNotifications;
