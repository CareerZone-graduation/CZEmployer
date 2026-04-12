import { generateCodeVerifier, generateCodeChallenge, generateState, storePKCEState, retrievePKCEState, clearPKCEState } from '@/utils/pkce';
import apiClient from './apiClient';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

/**
 * Initiate Google OAuth flow with PKCE
 * @param {string} role - User role (candidate/recruiter)
 */
export const initiateGoogleLogin = async (role = 'recruiter') => {
  console.log('=== STEP 1: Initiating Google Login ===');

  // Generate PKCE parameters
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const state = generateState();

  console.log('Generated PKCE:', {
    role,
    codeVerifier: codeVerifier.substring(0, 20) + '...',
    codeChallenge: codeChallenge.substring(0, 20) + '...',
    state: state.substring(0, 20) + '...'
  });

  // Store for later verification
  storePKCEState(codeVerifier, state);
  localStorage.setItem('google_auth_role', role);

  // CRITICAL: Verify storage immediately
  const verifyStorage = {
    codeVerifier: localStorage.getItem('pkce_code_verifier'),
    state: localStorage.getItem('pkce_state'),
    role: localStorage.getItem('google_auth_role')
  };

  console.log('=== Verification: localStorage after save ===', {
    hasCodeVerifier: !!verifyStorage.codeVerifier,
    hasState: !!verifyStorage.state,
    hasRole: !!verifyStorage.role,
    codeVerifierLength: verifyStorage.codeVerifier?.length,
    stateLength: verifyStorage.state?.length
  });

  if (!verifyStorage.codeVerifier || !verifyStorage.state) {
    console.error('❌ CRITICAL: localStorage save failed!');
    alert('Lỗi: Không thể lưu trạng thái. Vui lòng kiểm tra cài đặt trình duyệt.');
    return;
  }

  // Build redirect URI based on role
  const redirectUri = `${window.location.origin}/auth/login`;

  // Store redirectUri for later use in callback
  localStorage.setItem('google_redirect_uri', redirectUri);

  // Build authorization URL
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    state: state,
    access_type: 'online',
    prompt: 'select_account',
  });

  console.log('=== Redirecting to Google ===', { redirectUri });

  // Redirect to Google
  window.location.href = `${GOOGLE_AUTH_URL}?${params.toString()}`;
};

/**
 * Handle OAuth callback and exchange code for tokens (SERVER-SIDE PKCE)
 * Frontend gửi code + code_verifier lên Backend, Backend đổi với Google
 * @param {string} code - Authorization code from Google
 * @param {string} state - State parameter for CSRF verification
 * @returns {Promise<Object>} Login response with tokens
 */
export const handleGoogleCallback = async (code, state) => {
  console.log('=== STEP 2: Handling Google Callback ===');
  console.log('Received from Google:', {
    code: code?.substring(0, 20) + '...',
    state: state?.substring(0, 20) + '...'
  });

  // Check localStorage BEFORE retrieving
  console.log('=== localStorage contents BEFORE retrieve ===', {
    codeVerifier: localStorage.getItem('pkce_code_verifier')?.substring(0, 20) + '...',
    state: localStorage.getItem('pkce_state')?.substring(0, 20) + '...',
    role: localStorage.getItem('google_auth_role')
  });

  // Retrieve stored PKCE state (không xóa ngay)
  const { codeVerifier, state: storedState } = retrievePKCEState();
  const role = localStorage.getItem('google_auth_role') || 'recruiter';
  const redirectUri = localStorage.getItem('google_redirect_uri');

  console.log('=== PKCE Debug ===', {
    receivedState: state?.substring(0, 20) + '...',
    storedState: storedState?.substring(0, 20) + '...',
    statesMatch: state === storedState,
    codeVerifier: codeVerifier ? 'exists (' + codeVerifier.length + ' chars)' : 'MISSING',
    role,
    redirectUri
  });

  // Verify state to prevent CSRF
  if (!storedState) {
    console.error('No stored state found in localStorage');
    throw new Error('Session expired - please try logging in again');
  }

  if (state !== storedState) {
    console.error('State mismatch:', { received: state, stored: storedState });
    throw new Error('State mismatch - possible CSRF attack');
  }

  if (!codeVerifier) {
    console.error('No code verifier found in localStorage');
    throw new Error('Code verifier not found - session may have expired');
  }

  if (!redirectUri) {
    console.error('No redirect URI found in localStorage');
    throw new Error('Redirect URI not found - session may have expired');
  }

  try {
    // BƯỚC 5: Gửi code + code_verifier + redirect_uri lên Backend
    // Backend sẽ đổi code với Google (dùng client_secret an toàn)
    const response = await apiClient.post('/auth/google/callback', {
      code,
      code_verifier: codeVerifier,
      role,
      redirect_uri: redirectUri, // ← GỬI REDIRECT_URI LÊN BACKEND
    }, {
      withCredentials: true
    });

    // Xóa state sau khi thành công
    clearPKCEState();
    localStorage.removeItem('google_auth_role');
    localStorage.removeItem('google_redirect_uri');

    return response.data;
  } catch (error) {
    // Xóa state nếu lỗi
    clearPKCEState();
    localStorage.removeItem('google_auth_role');
    localStorage.removeItem('google_redirect_uri');
    throw error;
  }
};
