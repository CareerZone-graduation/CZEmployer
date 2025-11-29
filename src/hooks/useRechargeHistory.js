import { useState, useEffect } from 'react';
import { getRechargeHistory } from '@/services/paymentService';
import { toast } from 'sonner';

export const useRechargeHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    const fetchHistory = async (page = 1, limit = 10, append = false) => {
        setLoading(true);
        try {
            const response = await getRechargeHistory({ page, limit });

            if (response.success) {
                if (append) {
                    setHistory(prev => {
                        const existingIds = new Set(prev.map(item => item._id));
                        const newItems = response.data.filter(item => !existingIds.has(item._id));
                        return [...prev, ...newItems];
                    });
                } else {
                    setHistory(response.data);
                }
                setPagination({
                    page: response.meta.page,
                    limit: response.meta.limit,
                    total: response.meta.total,
                    totalPages: response.meta.totalPages
                });
            } else {
                toast.error(response.message || 'Không thể tải lịch sử nạp xu');
            }
        } catch (error) {
            console.error('Error fetching recharge history:', error);
            toast.error('Có lỗi xảy ra khi tải lịch sử nạp xu');
        } finally {
            setLoading(false);
        }
    };

    const loadMore = () => {
        if (pagination.page < pagination.totalPages) {
            fetchHistory(pagination.page + 1, pagination.limit, true);
        }
    };

    const refresh = () => {
        fetchHistory(1, pagination.limit, false);
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    return {
        history,
        loading,
        pagination,
        loadMore,
        refresh,
        fetchHistory
    };
};
