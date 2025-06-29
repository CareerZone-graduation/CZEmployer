import { clearAccessToken } from './token';
import { logoutServer } from '../services/authService';
import { toast } from 'react-toastify';

/**
 * Forced logout - clears token, calls logout API, shows message and redirects
 */
export const forcedLogout = async () => {
  try {
    await logoutServer(); // clear refresh token cookie
  } catch (_) {
    
    /* ignore */
  }
  
  clearAccessToken();
  toast.error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.');
  window.location.replace('/');
};
