import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronRight, TrendingUp, TrendingDown, Coins } from 'lucide-react';
import { TRANSACTION_TYPES, CATEGORY_LABELS } from '@/constants/creditTransaction';

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const formatAmount = (amount, type) => {
    const sign = type === TRANSACTION_TYPES.DEPOSIT ? '+' : '';
    return `${sign}${amount.toLocaleString('vi-VN')}`;
};

const TransactionItem = ({ transaction }) => {
    const isDeposit = transaction.type === TRANSACTION_TYPES.DEPOSIT;

    return (
        <div className="flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-muted/50 transition-colors">
            <div className="flex items-start gap-3 flex-1">
                <div className={`p-2 rounded-full ${isDeposit ? 'bg-green-100' : 'bg-red-100'}`}>
                    {isDeposit ? (
                        <TrendingUp className="h-5 w-5 text-green-600" />
                    ) : (
                        <TrendingDown className="h-5 w-5 text-red-600" />
                    )}
                </div>

                <div className="flex-1">
                    <div className="font-medium">
                        {CATEGORY_LABELS[transaction.category] || transaction.category}
                    </div>
                    {transaction.description && (
                        <div className="text-sm text-muted-foreground mt-1">
                            {transaction.description}
                        </div>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                        {formatDate(transaction.createdAt)}
                    </div>
                </div>
            </div>

            <div className="text-right ml-4">
                <div className={`text-lg font-semibold ${isDeposit ? 'text-green-600' : 'text-red-600'}`}>
                    {formatAmount(transaction.amount, transaction.type)}
                </div>
                <div className="text-sm text-muted-foreground flex items-center justify-end gap-1 mt-1">
                    <Coins className="h-3 w-3" />
                    <span>{transaction.balanceAfter?.toLocaleString('vi-VN')}</span>
                </div>
            </div>
        </div>
    );
};

const LoadingSkeleton = () => (
    <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 border-b">
                <div className="flex items-start gap-3 flex-1">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                </div>
                <div className="text-right space-y-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-4 w-16" />
                </div>
            </div>
        ))}
    </div>
);

const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-4 bg-muted rounded-full mb-4">
            <Coins className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Chưa có giao dịch</h3>
        <p className="text-muted-foreground">
            Lịch sử giao dịch của bạn sẽ hiển thị ở đây
        </p>
    </div>
);

const CreditHistoryList = ({ transactions, pagination, isLoading, isLoadingMore, onLoadMore }) => {
    if (isLoading) {
        return (
            <Card>
                <CardContent className="p-0">
                    <LoadingSkeleton />
                </CardContent>
            </Card>
        );
    }

    if (!transactions || transactions.length === 0) {
        return (
            <Card>
                <CardContent className="p-0">
                    <EmptyState />
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <Card>
                <CardContent className="p-0">
                    {transactions.map((transaction) => (
                        <TransactionItem key={transaction._id} transaction={transaction} />
                    ))}
                </CardContent>
            </Card>

            {/* Load More Button */}
            {pagination && pagination.hasNextPage && (
                <div className="flex flex-col items-center gap-3">
                    <div className="text-sm text-muted-foreground">
                        Đang hiển thị {transactions.length} / {pagination.totalRecords} giao dịch
                    </div>

                    <Button
                        variant="outline"
                        onClick={onLoadMore}
                        disabled={isLoadingMore}
                        className="w-full md:w-auto"
                    >
                        {isLoadingMore ? (
                            <>
                                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                Đang tải...
                            </>
                        ) : (
                            <>
                                <ChevronRight className="h-4 w-4 mr-2 rotate-90" />
                                Xem thêm
                            </>
                        )}
                    </Button>
                </div>
            )}

            {/* Show total when all loaded */}
            {pagination && !pagination.hasNextPage && transactions.length > 0 && (
                <div className="text-center text-sm text-muted-foreground py-4">
                    Đã hiển thị tất cả {pagination.totalRecords} giao dịch
                </div>
            )}
        </div>
    );
};

export default CreditHistoryList;
