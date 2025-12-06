import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { requestForToken, setupOnMessageListener } from '@/services/firebase';
import { fetchRecentNotifications, fetchUnreadCount, fetchNotifications } from '@/redux/notificationSlice';
import { toast } from 'sonner';

/**
 * A hook to manage Firebase Cloud Messaging for Recruiter.
 * It requests permission, gets the token, and listens for foreground messages.
 */
const useFirebaseMessaging = () => {
  const [notification, setNotification] = useState(null);
  const dispatch = useDispatch();
  const { pagination = { page: 1, limit: 10 }, initialized } = useSelector((state) => state.notifications || {});

  const [isPushEnabled, setIsPushEnabled] = useState(false);

  // Check initial status
  useEffect(() => {
    const checkStatus = async () => {
      if (Notification.permission === 'granted') {
        const { getFCMMessaging, checkDeviceRegistration } = await import('@/services/firebase');
        const { getToken } = await import('firebase/messaging');
        try {
          const messaging = getFCMMessaging();
          const currentToken = await getToken(messaging, { vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY });
          if (currentToken) {
            const isRegistered = await checkDeviceRegistration(currentToken);
            setIsPushEnabled(isRegistered);

            // If registered in browser but not backend (e.g. data cleared), re-register
            // Actually we should respect backend source of truth.
            // If backend says false, it is disabled.
          }
        } catch (e) {
          console.error('Error checking status:', e);
          setIsPushEnabled(false);
        }
      } else {
        setIsPushEnabled(false);
      }
    };
    checkStatus();
  }, []);

  const checkPermission = () => {
    // Simplified check just for browser permission update
    if (Notification.permission !== 'granted') {
      setIsPushEnabled(false);
    }
  };

  /**
   * Manually requests notification permission and retrieves the FCM token.
   */
  const requestPermission = async () => {
    try {
      const token = await requestForToken();
      if (token) {
        toast.success('Thông báo đã được bật.');
        console.log('FCM token obtained:', token);
        setIsPushEnabled(true);
      } else {
        toast.warning('Yêu cầu quyền thông báo đã bị từ chối.');
        setIsPushEnabled(false);
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Đã xảy ra lỗi khi bật thông báo.');
      checkPermission();
    }
  };

  // === AUTO REGISTER TOKEN ON MOUNT === (REMOVED)
  // We do NOT want to auto-register. We only check status.
  // Registration happens only when user explicitly clicks "Enable".

  // === FOREGROUND MESSAGE HANDLER ===
  useEffect(() => {
    // Chỉ thiết lập listener nếu người dùng đã cho phép thông báo
    if (Notification.permission === 'granted') {
      console.log('Setting up Firebase messaging listener...');

      // onMessage trả về một hàm "unsubscribe"
      // Chúng ta sẽ lưu nó lại để gọi khi component unmount
      const unsubscribe = setupOnMessageListener((payload) => {
        setNotification(payload);

        if (payload.notification) {
          toast.info(payload.notification.title, {
            description: payload.notification.body,
            duration: 5000,
            // Thêm action để người dùng có thể click vào
            action: {
              label: 'Xem',
              onClick: () => {
                if (payload.data && payload.data.url) {
                  window.location.href = payload.data.url;
                }
              },
            },
          });

          // Gọi API để cập nhật lại notifications trong Redux
          console.log('Fetching updated notifications after push notification...');

          // Cập nhật recent notifications và unread count
          dispatch(fetchRecentNotifications());
          dispatch(fetchUnreadCount());

          // Nếu user đã load notifications (đang ở NotificationsPage), refetch lại
          if (initialized && pagination) {
            dispatch(fetchNotifications({
              page: pagination.page,
              limit: pagination.limit
            }));
          }
        }
      });

      // Đây là hàm cleanup của useEffect
      // Nó sẽ được gọi khi component bị unmount (ví dụ: chuyển trang)
      return () => {
        console.log('Unsubscribing from Firebase messaging listener...');
        unsubscribe();
      };
    }
  }, [dispatch, pagination, initialized]);

  // === VISIBILITY CHANGE HANDLER ===
  // Khi user quay lại tab sau khi ở background, refetch notifications
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && Notification.permission === 'granted') {
        console.log('Tab became visible, refreshing notifications...');

        // Refetch tất cả để đảm bảo sync
        dispatch(fetchRecentNotifications());
        dispatch(fetchUnreadCount());

        // Nếu đang ở NotificationsPage, cũng refetch
        if (initialized && pagination) {
          dispatch(fetchNotifications({
            page: pagination.page,
            limit: pagination.limit
          }));
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [dispatch, pagination, initialized]);

  /**
   * Manually disables push notifications for this device.
   */
  const disableNotifications = async () => {
    try {
      const { getFCMMessaging, unregisterDeviceToken } = await import('@/services/firebase');
      const { getToken, deleteToken } = await import('firebase/messaging');

      const messaging = getFCMMessaging();
      const currentToken = await getToken(messaging, { vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY });

      if (currentToken) {
        // 1. Unregister from backend
        // Note: unregisterDeviceToken handles unregistering from backend
        await unregisterDeviceToken(currentToken);
        // 2. Delete token from Firebase SDK
        await deleteToken(messaging);
        toast.success('Đã tắt thông báo đẩy trên thiết bị này.');
        setIsPushEnabled(false);
      } else {
        toast.info('Thiết bị chưa đăng ký thông báo.');
        setIsPushEnabled(false);
      }
    } catch (error) {
      console.error('Error disabling notifications:', error);
      toast.error('Không thể tắt thông báo.');
      checkPermission();
    }
  };

  return {
    notification,
    requestPermission,
    disableNotifications,
    isPushEnabled
  };
};

export default useFirebaseMessaging;
