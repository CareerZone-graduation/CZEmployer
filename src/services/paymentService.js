import apiClient from './apiClient';

/**
 * Creates a new payment order to recharge coins.
 * @param {object} orderData - The data for the payment order.
 * @param {number} orderData.coins - The number of coins to purchase.
 * @param {string} orderData.paymentMethod - The payment method (e.g., 'ZALOPAY', 'VNPAY').
 * @returns {Promise<object>} The response from the server, containing the payment URL.
 */
export const createPaymentOrder = async (orderData) => {

  try {
    const response = await apiClient.post('/payments/create-order', orderData);
    return response; // Return response.data instead of full response
  } catch (error) {
    console.error('Error creating payment order:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Lấy lịch sử nạp xu
 * @param {Object} params - Tham số query (page, limit)
 */
export const getRechargeHistory = async (params = {}) => {
  try {
    const response = await apiClient.get('/users/me/recharge-history', { params });
    return response;
  } catch (error) {
    console.error('Error fetching recharge history:', error);
    throw error;
  }
};