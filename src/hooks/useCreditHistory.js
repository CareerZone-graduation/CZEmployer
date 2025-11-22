import { useQuery } from '@tanstack/react-query';
import { getTransactionHistory, getTransactionSummary } from '../services/walletService';

export const useCreditHistory = (filters) => {
    return useQuery({
        queryKey: ['creditHistory', filters],
        queryFn: () => getTransactionHistory(filters),
        keepPreviousData: true,
    });
};

export const useCreditSummary = (dateRange) => {
    return useQuery({
        queryKey: ['creditSummary', dateRange],
        queryFn: () => getTransactionSummary(dateRange),
    });
};
