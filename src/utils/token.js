// cách 1: luu accessToken trong ram

// let accessToken = null;

// export const getAccessToken = () => accessToken;
// export const saveAccessToken = (token) => {
//   accessToken = token;
// };
// export const clearAccessToken = () => {
//   accessToken = null;
// };

// cách 2: Tên key để lưu trong localStorage
const ACCESS_TOKEN_KEY = 'accessToken';

/**
 * Lấy accessToken từ localStorage.
 * @returns {string | null}
 */
export const getAccessToken = () => {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error("Failed to get access token from localStorage", error);
    return null;
  }
};

/**
 * Lưu accessToken vào localStorage.
 * @param {string} token
 */
export const saveAccessToken = (token) => {
  try {
    console.log("Saving access token to localStorage:", token);
    if (token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    } else {
      // Nếu token là null hoặc undefined, hãy xóa nó đi
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  } catch (error) {
    console.error("Failed to save access token to localStorage", error);
  }
};

/**
 * Xóa accessToken khỏi localStorage.
 */
export const clearAccessToken = () => {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error("Failed to clear tokens from localStorage", error);
  }
};