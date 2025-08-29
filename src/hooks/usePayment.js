import { useState } from 'react';
import { toast } from 'sonner';
import { createPaymentOrder } from '../services/paymentService';

export const usePayment = () => {
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePayment = async (values) => {
        setIsProcessing(true);
        try {
            const response = await createPaymentOrder(values);
            console.log('Payment Response:', response);
            if (response.success && response.data.order_url) {
                // Redirect to ZaloPay payment gateway
                window.location.href = response.data.order_url;
            } else {
                toast.error(response.message || 'Failed to create payment order. Please try again.');
            }
        } catch (error) {
            console.error('Payment Error:', error);
            const errorMessage = error.response?.data?.message || 'An unexpected error occurred during payment.';
            toast.error(errorMessage);
        } finally {
            setIsProcessing(false);
        }
    };

    return { isProcessing, handlePayment };
};