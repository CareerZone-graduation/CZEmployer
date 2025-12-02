import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/**
 * Submit contact form from landing page
 * @param {Object} contactData - Contact form data
 * @returns {Promise} API response
 */
export const submitContactForm = async (contactData) => {
  const response = await axios.post(`${API_URL}/api/contact`, contactData);
  return response.data;
};
