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