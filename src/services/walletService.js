import apiClient from './apiClient';

/**
 * Get wallet information
 */
export const getWalletInfo = async () => {
    try {
        const response = await apiClient.get('/users/me/coins');
        return response;
    } catch (error) {
        console.error('Error fetching wallet info:', error);
        throw error;
    }
};

/**
 * Get transaction history (Credit History)
 * @param {Object} params - Query parameters (page, limit, type, category, startDate, endDate)
 */
export const getTransactionHistory = async (params = {}) => {
    try {
        const response = await apiClient.get('/credit-history', { params });
        return response;
    } catch (error) {
        console.error('Error fetching transaction history:', error);
        throw error;
    }
};

/**
 * Get transaction summary
 * @param {Object} params - Query parameters (startDate, endDate)
 */
export const getTransactionSummary = async (params = {}) => {
    try {
        const response = await apiClient.get('/credit-history/summary', { params });
        return response;
    } catch (error) {
        console.error('Error fetching transaction summary:', error);
        throw error;
    }
};

/**
 * Create payment order (ZaloPay, MoMo, VNPay)
 * @param {Object} orderData - { coins, paymentMethod }
 */
export const createPaymentOrder = async (orderData) => {
    try {
        const response = await apiClient.post('/payment/create-order', orderData);
        return response.data;
    } catch (error) {
        console.error('Error creating payment order:', error);
        throw error;
    }
};
