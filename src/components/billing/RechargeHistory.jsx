import { useState } from 'react';
import { useRechargeHistory } from '@/hooks/useRechargeHistory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/formatCurrency';

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const getStatusConfig = (status) => {
    switch (status) {
        case 'SUCCESS':
            return {
                label: 'Thành công',
                variant: 'default',
                icon: CheckCircle,
                className: 'bg-green-100 text-green-800 border-green-200'
            };
        case 'PENDING':
            return {
                label: 'Đang xử lý',
                variant: 'secondary',
                icon: Clock,
                className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
            };
        case 'FAILED':
            return {
                label: 'Thất bại',
                variant: 'destructive',
                icon: XCircle,
                className: 'bg-red-100 text-red-800 border-red-200'
            };
        default:
            return {
                label: 'Không xác định',
                variant: 'outline',
                icon: AlertCircle,
                className: 'bg-gray-100 text-gray-800 border-gray-200'
            };
    }
};

const getPaymentMethodLabel = (method) => {
    switch (method) {
        case 'ZALOPAY':
            return 'ZaloPay';
        case 'VNPAY':
            return 'VNPAY';
        case 'MOMO':
            return 'MoMo';
        default:
            return method;
    }
};

const RechargeHistoryItem = ({ transaction }) => {
    const statusConfig = getStatusConfig(transaction.status);
    const StatusIcon = statusConfig.icon;

    return (
        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-4">
                <div className={cn("p-2 rounded-full", statusConfig.className)}>
                    <StatusIcon className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="font-medium">{transaction.coinAmount} xu</span>
                        <Badge variant="outline" className="text-xs">
                            {getPaymentMethodLabel(transaction.paymentMethod)}
                        </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        {formatDate(transaction.createdAt)}
                    </div>
                    {transaction.transactionCode && (
                        <div className="text-xs text-muted-foreground">
                            Mã GD: {transaction.transactionCode}
                        </div>
                    )}
                </div>
            </div>
            <div className="text-right space-y-1">
                <div className="font-semibold">
                    {formatCurrency(transaction.amountPaid)}
                </div>
                <Badge className={cn("text-xs", statusConfig.className)}>
                    {statusConfig.label}
                </Badge>
            </div>
        </div>
    );
};

const RechargeHistorySkeleton = () => (
    <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-3 w-20" />
                    </div>
                </div>
                <div className="text-right space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-5 w-16" />
                </div>
            </div>
        ))}
    </div>
);

const RechargeHistory = () => {
    const { history, loading, pagination, loadMore, refresh } = useRechargeHistory();
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await refresh();
        setIsRefreshing(false);
    };

    return (
        <Card className="mt-8">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Lịch sử nạp xu
                    </CardTitle>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="gap-2"
                    >
                        <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
                        Làm mới
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {loading && history.length === 0 ? (
                    <RechargeHistorySkeleton />
                ) : history.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Chưa có lịch sử nạp xu nào</p>
                        <p className="text-sm">Hãy thực hiện giao dịch nạp xu đầu tiên của bạn</p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-3">
                            {history.map((transaction) => (
                                <RechargeHistoryItem key={transaction._id} transaction={transaction} />
                            ))}
                        </div>

                        {pagination.page < pagination.totalPages && (
                            <div className="text-center pt-4">
                                <Button
                                    variant="outline"
                                    onClick={loadMore}
                                    disabled={loading}
                                    className="gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <RefreshCw className="h-4 w-4 animate-spin" />
                                            Đang tải...
                                        </>
                                    ) : (
                                        `Xem thêm (${pagination.total - history.length} còn lại)`
                                    )}
                                </Button>
                            </div>
                        )}

                        <div className="text-center text-sm text-muted-foreground pt-2">
                            Hiển thị {history.length} / {pagination.total} giao dịch
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default RechargeHistory;
