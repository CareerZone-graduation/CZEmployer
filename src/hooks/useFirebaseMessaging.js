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

  /**
   * Manually requests notification permission and retrieves the FCM token.
   */
  const requestPermission = async () => {
    try {
      const token = await requestForToken();
      if (token) {
        toast.success('Thông báo đã được bật.');
        console.log('FCM token obtained:', token);
      } else {
        toast.warning('Yêu cầu quyền thông báo đã bị từ chối.');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Đã xảy ra lỗi khi bật thông báo.');
    }
  };

  // === AUTO REGISTER TOKEN ON MOUNT ===
  // Tự động đăng ký token nếu permission đã được granted trước đó
  useEffect(() => {
    if (Notification.permission === 'granted') {
      console.log('Permission already granted, registering token...');
      requestForToken();
    }
  }, []); // Chỉ chạy 1 lần khi component mount

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

  return { notification, requestPermission };
};

export default useFirebaseMessaging;
