import apiClient from './apiClient';

const API_URL = '/interviews';

/**
 * Fetches the recruiter's interviews with pagination and filtering.
 * @param {object} params - Query parameters (page, limit, status).
 * @returns {Promise<object>} The response data containing interviews.
 */
export const getMyInterviews = (params) => {
  return apiClient.get(`${API_URL}/my-interviews`, { params });
};

/**
 * Reschedules an interview.
 * @param {string} id - The ID of the interview.
 * @param {object} data - The rescheduling data { scheduledTime, message }.
 * @returns {Promise<object>} The response data.
 */
export const rescheduleInterview = (id, data) => {
  return apiClient.patch(`${API_URL}/${id}/reschedule`, data);
};

/**
 * Cancels an interview.
 * @param {string} id - The ID of the interview.
 * @param {object} data - The cancellation data, e.g., { reason: '...' }.
 * @returns {Promise<object>} The response data.
 */
export const cancelInterview = (id, data) => {
  return apiClient.patch(`${API_URL}/${id}/cancel`, data);
};

/**
 * Starts an interview.
 * @param {string} id - The ID of the interview.
 * @returns {Promise<object>} The response data.
 */
export const startInterview = (id) => {
  return apiClient.patch(`${API_URL}/${id}/start`);
};

/**
 * Completes an interview.
 * @param {string} id - The ID of the interview.
 * @param {object} data - The completion data { notes }.
 * @returns {Promise<object>} The response data.
 */
export const completeInterview = (id, data) => {
  return apiClient.patch(`${API_URL}/${id}/complete`, data);
};

/**
 * Fetches a single interview by its ID.
 * @param {string} id - The ID of the interview.
 * @returns {Promise<object>} The response data.
 */
export const getInterviewById = (id) => {
  return apiClient.get(`${API_URL}/${id}/details`);
};

/**
 * Schedules a new interview.
 * @param {object} data - The interview data { applicationId, scheduledAt, duration }.
 * @returns {Promise<object>} The response data.
 */
export const scheduleInterview = (data) => {
  return apiClient.post(API_URL, data);
};

/**
 * Upload interview recording to backend.
 * @param {string} interviewId - The ID of the interview.
 * @param {Blob} recordingBlob - The recorded video blob.
 * @param {object} metadata - Recording metadata { duration, size }.
 * @param {function} onProgress - Progress callback function.
 * @returns {Promise<object>} The response data with recording URL.
 */
export const uploadRecording = async (interviewId, recordingBlob, metadata = {}, onProgress) => {
  try {
    const formData = new FormData();
    
    // Add the video file
    const filename = `interview-${interviewId}-${Date.now()}.webm`;
    formData.append('recording', recordingBlob, filename);
    
    // Add metadata
    if (metadata.duration) {
      formData.append('duration', metadata.duration);
    }
    if (metadata.size) {
      formData.append('size', metadata.size);
    }

    // Upload with progress tracking
    const response = await apiClient.post(
      `${API_URL}/${interviewId}/recording`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted, progressEvent.loaded, progressEvent.total);
          }
        },
      }
    );

    return response;
  } catch (error) {
    console.error('[Interview Service] Failed to upload recording:', error);
    throw error;
  }
};

/**
 * Get recording URL for an interview.
 * @param {string} interviewId - The ID of the interview.
 * @returns {Promise<object>} The response data with recording URL.
 */
export const getRecording = (interviewId) => {
  return apiClient.get(`${API_URL}/${interviewId}/recording`);
};