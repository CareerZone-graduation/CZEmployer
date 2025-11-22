import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import CreditHistoryList from './CreditHistoryList';
import CreditHistoryFilters from './CreditHistoryFilters';
import CreditSummary from './CreditSummary';
import { useCreditHistory, useCreditSummary } from '@/hooks/useCreditHistory';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';

const CreditHistory = () => {
    // Initialize filters
    const [filters, setFilters] = useState({
        page: 1,
        limit: 20,
        type: '',
        category: '',
        startDate: '',
        endDate: '',
    });

    // Store accumulated transactions for "Load More" functionality
    const [accumulatedTransactions, setAccumulatedTransactions] = useState([]);

    // Fetch credit history
    const {
        data: historyData,
        isLoading: isLoadingHistory,
        error: historyError,
        isFetching,
        refetch: refetchHistory
    } = useCreditHistory(filters);

    // Accumulate transactions when new data arrives
    useEffect(() => {
        if (historyData?.data?.transactions) {
            if (filters.page === 1) {
                // Reset accumulated data when filters change or going back to page 1
                setAccumulatedTransactions(historyData.data.transactions);
            } else {
                // Append new transactions for subsequent pages
                setAccumulatedTransactions(prev => {
                    const existingIds = new Set(prev.map(t => t._id));
                    const newTransactions = historyData.data.transactions.filter(
                        t => !existingIds.has(t._id)
                    );
                    return [...prev, ...newTransactions];
                });
            }
        }
    }, [historyData, filters.page]);

    // Fetch summary
    const {
        data: summaryData,
        isLoading: isLoadingSummary,
        refetch: refetchSummary
    } = useCreditSummary({
        startDate: filters.startDate,
        endDate: filters.endDate
    });

    // Show error toast
    useEffect(() => {
        if (historyError) {
            toast.error('Không thể tải lịch sử giao dịch', {
                description: historyError.response?.data?.message || 'Vui lòng thử lại sau',
            });
        }
    }, [historyError]);

    const handleFilterChange = (newFilters) => {
        setFilters((prev) => ({
            ...prev,
            ...newFilters,
            page: 1, // Reset to first page when filters change
        }));
        // Reset accumulated transactions when filters change
        setAccumulatedTransactions([]);
    };

    const handleClearFilters = () => {
        setFilters({
            page: 1,
            limit: 20,
            type: '',
            category: '',
            startDate: '',
            endDate: '',
        });
        // Reset accumulated transactions
        setAccumulatedTransactions([]);
    };

    const handleLoadMore = () => {
        setFilters((prev) => ({
            ...prev,
            page: prev.page + 1,
        }));
    };

    const handleRefresh = () => {
        refetchHistory();
        refetchSummary();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    className="gap-2"
                >
                    <RefreshCw className="h-4 w-4" />
                    Làm mới
                </Button>
            </div>

            {/* Summary Statistics */}
            <CreditSummary
                summary={summaryData?.data}
                isLoading={isLoadingSummary}
            />

            {/* Filters */}
            <CreditHistoryFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
            />

            {/* Transaction List */}
            <CreditHistoryList
                transactions={accumulatedTransactions}
                pagination={historyData?.data?.pagination}
                isLoading={isLoadingHistory && filters.page === 1}
                isLoadingMore={isFetching && filters.page > 1}
                onLoadMore={handleLoadMore}
            />
        </div>
    );
};

export default CreditHistory;
