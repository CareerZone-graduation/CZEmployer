/**
 * PKCE (Proof Key for Code Exchange) utilities for OAuth 2.0
 * Implements RFC 7636 for secure authorization code flow
 */

/**
 * Generate a cryptographically secure random code verifier
 * @returns {string} Base64URL encoded random string (43-128 characters)
 */
export const generateCodeVerifier = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
};

/**
 * Generate code challenge from code verifier using SHA-256
 * @param {string} codeVerifier - The code verifier string
 * @returns {Promise<string>} Base64URL encoded SHA-256 hash
 */
export const generateCodeChallenge = async (codeVerifier) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return base64URLEncode(new Uint8Array(hash));
};

/**
 * Base64URL encode (RFC 4648 Section 5)
 * @param {Uint8Array} buffer - Buffer to encode
 * @returns {string} Base64URL encoded string
 */
const base64URLEncode = (buffer) => {
  const base64 = btoa(String.fromCharCode(...buffer));
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

/**
 * Store PKCE state in localStorage (persist across redirects)
 * @param {string} codeVerifier - Code verifier to store
 * @param {string} state - Random state parameter
 */
export const storePKCEState = (codeVerifier, state) => {
  localStorage.setItem('pkce_code_verifier', codeVerifier);
  localStorage.setItem('pkce_state', state);
  console.log('Stored PKCE state in localStorage');
};

/**
 * Retrieve PKCE state from localStorage (WITHOUT clearing)
 * @returns {{codeVerifier: string|null, state: string|null}}
 */
export const retrievePKCEState = () => {
  const codeVerifier = localStorage.getItem('pkce_code_verifier');
  const state = localStorage.getItem('pkce_state');

  console.log('Retrieved PKCE state:', {
    hasCodeVerifier: !!codeVerifier,
    hasState: !!state
  });

  return { codeVerifier, state };
};

/**
 * Clear PKCE state from localStorage
 */
export const clearPKCEState = () => {
  localStorage.removeItem('pkce_code_verifier');
  localStorage.removeItem('pkce_state');
  console.log('Cleared PKCE state from localStorage');
};

/**
 * Generate random state parameter for CSRF protection
 * @returns {string} Random state string
 */
export const generateState = () => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
};
