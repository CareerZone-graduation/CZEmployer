import apiClient from './apiClient';

/**
 * Retry configuration for failed requests
 */
const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  retryableStatuses: [408, 429, 500, 502, 503, 504]
};

/**
 * Helper function to handle API requests with retry logic
 * @param {Function} requestFn - The API request function to execute
 * @param {number} retries - Number of retries remaining
 * @returns {Promise} The API response
 */
const withRetry = async (requestFn, retries = RETRY_CONFIG.maxRetries) => {
  try {
    return await requestFn();
  } catch (error) {
    const shouldRetry =
      retries > 0 &&
      error.response &&
      RETRY_CONFIG.retryableStatuses.includes(error.response.status);

    if (shouldRetry) {
      console.warn(`Request failed, retrying... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, RETRY_CONFIG.retryDelay));
      return withRetry(requestFn, retries - 1);
    }

    throw error;
  }
};

/**
 * Check if recruiter can message a candidate
 * @param {string} candidateId - Candidate user ID
 * @returns {Promise<{canMessage: boolean, reason: string}>}
 */
export const checkMessagingAccess = async (candidateId) => {
  try {
    const response = await withRetry(() =>
      apiClient.get(`/chat/access-check/${candidateId}`)
    );
    return response.data;
  } catch (error) {
    console.error('Error checking messaging access:', error);

    // Handle specific error cases
    if (error.response?.status === 403) {
      return {
        canMessage: false,
        reason: 'NO_ACCESS',
        error: 'Access denied'
      };
    }

    throw error;
  }
};

/**
 * Create or get conversation with a candidate
 * @param {string} candidateId - Candidate user ID
 * @returns {Promise<Object>} Conversation object
 */
export const createOrGetConversation = async (candidateId) => {
  try {
    const response = await withRetry(() =>
      apiClient.post('/chat/conversations', { candidateId })
    );
    // Backend returns { success, message, data: conversation }
    return response.data.data || response.data;
  } catch (error) {
    // Handle specific error cases
    if (error.response?.status === 403) {
      throw new Error('Bạn không có quyền nhắn tin cho ứng viên này');
    }

    if (error.response?.status === 404) {
      throw new Error('Không tìm thấy ứng viên');
    }

    throw error;
  }
};

/**
 * Get all conversations for current user with pagination and search
 * @param {Object} params - { search, page, limit }
 * @returns {Promise<{data: Array, meta: Object}>} List of conversations and metadata
 */
export const getConversations = async ({ search, page = 1, limit = 10 } = {}) => {
  try {
    const response = await withRetry(() =>
      apiClient.get('/chat/conversations', {
        params: { search, page, limit }
      })
    );
    // Backend returns { success, message, data: conversations[], meta: {} }
    return {
      data: response.data || [],
      meta: response.meta || {}
    };
  } catch (error) {
    console.error('Error fetching conversations:', error);
    if (error.response?.status >= 500) {
      console.warn('Server error, returning empty conversations list');
      return { data: [], meta: {} };
    }
    throw error;
  }
};

/**
 * Get messages in a conversation with pagination
 * @param {string} conversationId - Conversation ID
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 50)
 * @returns {Promise<{data: Array, meta: Object}>} Messages with pagination metadata
 */
export const getConversationMessages = async (conversationId, page = 1, limit = 50) => {
  try {
    const response = await withRetry(() =>
      apiClient.get(`/chat/conversations/${conversationId}/messages`, {
        params: { page, limit }
      })
    );
    // Backend returns { success, message, meta, data: messages[] }
    return {
      data: response.data.data || response.data,
      meta: response.data.meta || {}
    };
  } catch (error) {
    console.error('Error fetching conversation messages:', error);

    // Handle specific error cases
    if (error.response?.status === 404) {
      throw new Error('Không tìm thấy cuộc trò chuyện');
    }

    if (error.response?.status === 403) {
      throw new Error('Bạn không có quyền truy cập cuộc trò chuyện này');
    }

    throw error;
  }
};

/**
 * Mark all messages in a conversation as read
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<Object>} Success response
 */
export const markConversationAsRead = async (conversationId) => {
  try {
    const response = await withRetry(() =>
      apiClient.put(`/chat/conversations/${conversationId}/read`)
    );
    return response;
  } catch (error) {
    console.error('Error marking conversation as read:', error);

    // Non-critical operation, log but don't throw
    if (error.response?.status >= 500) {
      console.warn('Failed to mark conversation as read, will retry later');
      return { success: false };
    }

    throw error;
  }
};

/**
 * Get conversation details by ID
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<Object>} Conversation details
 */
export const getConversationDetails = async (conversationId) => {
  try {
    const response = await withRetry(() =>
      apiClient.get(`/chat/conversations/${conversationId}`)
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching conversation details:', error);

    // Handle specific error cases
    if (error.response?.status === 404) {
      throw new Error('Không tìm thấy cuộc trò chuyện');
    }

    if (error.response?.status === 403) {
      throw new Error('Bạn không có quyền truy cập cuộc trò chuyện này');
    }

    throw error;
  }
};

/**
 * Mark specific messages as read
 * @param {Array<string>} messageIds - Array of message IDs
 * @returns {Promise<Object>} Success response
 */
export const markMessagesAsRead = async (messageIds) => {
  try {
    const response = await withRetry(() =>
      apiClient.patch('/chat/messages/read', { messageIds })
    );
    return response;
  } catch (error) {
    console.error('Error marking messages as read:', error);

    // Non-critical operation, log but don't throw
    if (error.response?.status >= 500) {
      console.warn('Failed to mark messages as read, will retry later');
      return { success: false };
    }

    throw error;
  }
};

/**
 * Unlock candidate profile for messaging
 * @param {string} candidateId - Candidate user ID
 * @returns {Promise<Object>} Transaction details and updated credit balance
 */
export const unlockProfile = async (candidateId) => {
  try {
    const response = await apiClient.post('/recruiters/unlock-profile', {
      candidateId
    });
    return response.data;
  } catch (error) {
    console.error('Error unlocking profile:', error);

    // Handle specific error cases
    if (error.response?.status === 400) {
      const errorMessage = error.response?.data?.message || 'Không đủ credits để mở khóa hồ sơ';
      throw new Error(errorMessage);
    }

    if (error.response?.status === 404) {
      throw new Error('Không tìm thấy ứng viên');
    }

    throw error;
  }
};


