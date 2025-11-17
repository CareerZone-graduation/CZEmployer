import { useState } from 'react';
import { toast } from 'sonner';
import { createPaymentOrder } from '../services/paymentService';

export const usePayment = () => {
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePayment = async (values) => {
        console.log('🟢 usePayment.handlePayment called with:', values);
        setIsProcessing(true);
        try {
            console.log('🟢 Calling createPaymentOrder API...');
            const response = await createPaymentOrder(values);
            console.log('🟢 Payment Response:', response);
            
            // Check different response structures
            let paymentUrl = null;
            
            // VNPay direct structure (after apiClient double unwrap)
            if (response?.paymentUrl) {
                paymentUrl = response.paymentUrl;
            }
            // VNPay old structure
            else if (response?.success && response.data?.paymentUrl) {
                paymentUrl = response.data.paymentUrl;
            }
            // ZaloPay structure
            else if (response?.success && response.data?.order_url) {
                paymentUrl = response.data.order_url;
            }
            // ZaloPay direct structure
            else if (response?.order_url) {
                paymentUrl = response.order_url;
            }
            
            if (paymentUrl) {
                console.log('Redirecting to payment gateway:', paymentUrl);
                window.location.href = paymentUrl;
            } else {
                console.error('No payment URL found in response:', response);
                toast.error(response.message || 'Failed to create payment order. Please try again.');
            }
        } catch (error) {
            console.error('Payment Error:', error);
            console.error('Error details:', error.response);
            const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred during payment.';
            toast.error(errorMessage);
        } finally {
            setIsProcessing(false);
        }
    };

    return { isProcessing, handlePayment };
};