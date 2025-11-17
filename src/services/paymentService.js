import apiClient from './apiClient';

/**
 * Creates a new payment order to recharge coins.
 * @param {object} orderData - The data for the payment order.
 * @param {number} orderData.coins - The number of coins to purchase.
 * @param {string} orderData.paymentMethod - The payment method (e.g., 'ZALOPAY', 'VNPAY').
 * @returns {Promise<object>} The response from the server, containing the payment URL.
 */
export const createPaymentOrder = async (orderData) => {
  console.log('🔴 paymentService.createPaymentOrder called');
  console.log('🔴 Order data:', orderData);
  console.log('🔴 Sending POST to /payments/create-order');
  try {
    const response = await apiClient.post('/payments/create-order', orderData);
    console.log('🔴 API Response:', response); // Debug log
    return response.data; // Return response.data instead of full response
  } catch (error) {
    console.error('Error creating payment order:', error.response?.data || error.message);
    throw error;
  }
};