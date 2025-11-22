import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Coins, TrendingUp, TrendingDown, PieChart } from 'lucide-react';
import { CATEGORY_LABELS } from '@/constants/creditTransaction';

const formatNumber = (value) => {
    return value?.toLocaleString('vi-VN') || '0';
};

const StatCard = ({ title, value, icon: Icon, color, isLoading }) => {
    if (isLoading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-8 w-32" />
                        </div>
                        <Skeleton className="h-12 w-12 rounded-full" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground mb-1">{title}</p>
                        <p className={`text-2xl font-bold ${color}`}>
                            {formatNumber(value)}
                        </p>
                    </div>
                    <div className={`p-3 rounded-full ${color.replace('text-', 'bg-')}/10`}>
                        <Icon className={`h-6 w-6 ${color}`} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

const CategoryBreakdownItem = ({ category, count, totalAmount }) => {
    const isPositive = totalAmount >= 0;

    return (
        <div className="flex items-center justify-between py-3 border-b last:border-b-0">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${isPositive ? 'bg-green-100' : 'bg-red-100'}`}>
                    <PieChart className={`h-4 w-4 ${isPositive ? 'text-green-600' : 'text-red-600'}`} />
                </div>
                <div>
                    <div className="font-medium">{CATEGORY_LABELS[category] || category}</div>
                    <div className="text-sm text-muted-foreground">{count} giao dịch</div>
                </div>
            </div>
            <div className={`text-lg font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? '+' : ''}{formatNumber(totalAmount)}
            </div>
        </div>
    );
};

const CreditSummary = ({ summary, isLoading }) => {
    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard isLoading={true} />
                    <StatCard isLoading={true} />
                    <StatCard isLoading={true} />
                </div>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-48" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between py-3">
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-8 w-8 rounded-full" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-24" />
                                            <Skeleton className="h-3 w-16" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-6 w-20" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const {
        currentBalance = 0,
        totalDeposits = 0,
        totalUsage = 0,
        categoryBreakdown = []
    } = summary || {};

    return (
        <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    title="Số dư hiện tại"
                    value={currentBalance}
                    icon={Coins}
                    color="text-blue-600"
                />
                <StatCard
                    title="Tổng nạp"
                    value={totalDeposits}
                    icon={TrendingUp}
                    color="text-green-600"
                />
                <StatCard
                    title="Tổng sử dụng"
                    value={Math.abs(totalUsage)}
                    icon={TrendingDown}
                    color="text-red-600"
                />
            </div>

            {/* Category Breakdown */}
            {categoryBreakdown && categoryBreakdown.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Phân loại theo danh mục</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-0">
                            {categoryBreakdown.map((item) => (
                                <CategoryBreakdownItem
                                    key={item.category}
                                    category={item.category}
                                    count={item.count}
                                    totalAmount={item.totalAmount}
                                />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default CreditSummary;
