import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { X, Filter } from 'lucide-react';
import { TRANSACTION_TYPES, TRANSACTION_CATEGORIES, CATEGORY_LABELS, TRANSACTION_TYPE_LABELS } from '@/constants/creditTransaction';

const CreditHistoryFilters = ({ filters, onFilterChange, onClearFilters }) => {
    const user = useSelector((state) => state.auth.user?.user);
    const userRole = user?.role;

    // Filter categories based on user role
    const availableCategories = useMemo(() => {
        const allCategories = Object.values(TRANSACTION_CATEGORIES);

        // Candidate-specific filtering
        if (userRole === 'candidate') {
            return allCategories.filter(category =>
                // Exclude recruiter-only categories
                category !== TRANSACTION_CATEGORIES.JOB_POST &&
                category !== TRANSACTION_CATEGORIES.CV_UNLOCK &&
                category !== TRANSACTION_CATEGORIES.JOB_VIEW
            );
        }

        // Recruiter-specific filtering
        if (userRole === 'recruiter') {
            return allCategories.filter(category =>
                // Exclude candidate-only categories (if any in the future)
                // Currently PROFILE_BOOST might be shared or specific, let's assume shared or check constants
                // In constants: CANDIDATE_CATEGORIES has PROFILE_BOOST. RECRUITER_CATEGORIES does not.
                category !== TRANSACTION_CATEGORIES.PROFILE_BOOST
            );
        }

        // Admin sees all categories
        return allCategories;
    }, [userRole]);

    const handleTypeChange = (value) => {
        onFilterChange({ type: value === 'all' ? '' : value });
    };

    const handleCategoryChange = (value) => {
        onFilterChange({ category: value === 'all' ? '' : value });
    };

    const handleStartDateChange = (e) => {
        onFilterChange({ startDate: e.target.value });
    };

    const handleEndDateChange = (e) => {
        onFilterChange({ endDate: e.target.value });
    };

    const hasActiveFilters = filters.type || filters.category || filters.startDate || filters.endDate;

    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-semibold">Bộ lọc</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Transaction Type Filter */}
                    <div className="space-y-2">
                        <Label htmlFor="type-filter">Loại giao dịch</Label>
                        <Select
                            value={filters.type || 'all'}
                            onValueChange={handleTypeChange}
                        >
                            <SelectTrigger id="type-filter" className="w-full">
                                <SelectValue placeholder="Tất cả" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả</SelectItem>
                                <SelectItem value={TRANSACTION_TYPES.DEPOSIT}>
                                    {TRANSACTION_TYPE_LABELS[TRANSACTION_TYPES.DEPOSIT]}
                                </SelectItem>
                                <SelectItem value={TRANSACTION_TYPES.USAGE}>
                                    {TRANSACTION_TYPE_LABELS[TRANSACTION_TYPES.USAGE]}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Category Filter */}
                    <div className="space-y-2">
                        <Label htmlFor="category-filter">Danh mục</Label>
                        <Select
                            value={filters.category || 'all'}
                            onValueChange={handleCategoryChange}
                        >
                            <SelectTrigger id="category-filter" className="w-full">
                                <SelectValue placeholder="Tất cả" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả</SelectItem>
                                {availableCategories.map((category) => (
                                    <SelectItem key={category} value={category}>
                                        {CATEGORY_LABELS[category]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Start Date Filter */}
                    <div className="space-y-2">
                        <Label htmlFor="start-date">Từ ngày</Label>
                        <Input
                            id="start-date"
                            type="date"
                            value={filters.startDate || ''}
                            onChange={handleStartDateChange}
                            max={filters.endDate || undefined}
                        />
                    </div>

                    {/* End Date Filter */}
                    <div className="space-y-2">
                        <Label htmlFor="end-date">Đến ngày</Label>
                        <Input
                            id="end-date"
                            type="date"
                            value={filters.endDate || ''}
                            onChange={handleEndDateChange}
                            min={filters.startDate || undefined}
                        />
                    </div>
                </div>

                {/* Clear Filters Button */}
                {hasActiveFilters && (
                    <div className="mt-4 flex justify-end">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onClearFilters}
                            className="gap-2"
                        >
                            <X className="h-4 w-4" />
                            Xóa bộ lọc
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default CreditHistoryFilters;
