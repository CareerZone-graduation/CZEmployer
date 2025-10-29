import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as talentPoolService from '@/services/talentPoolService';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import TalentPoolTable from './TalentPoolTable';
import TalentPoolFilters from './TalentPoolFilters';

const TalentPoolTab = () => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    tags: [],
    search: ''
  });

  const {
    data: response,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['talentPool', filters],
    queryFn: () => talentPoolService.getTalentPool(filters),
    keepPreviousData: true
  });

  const talentPool = response?.data || [];
  const meta = response?.meta || {};

  const handleFilterChange = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="pt-6">
          <ErrorState
            message={error?.response?.data?.message || 'Không thể tải danh sách talent pool'}
            onRetry={refetch}
          />
        </CardContent>
      </Card>
    );
  }

  if (!talentPool || talentPool.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <EmptyState
            icon="users"
            message="Talent pool của bạn chưa có ứng viên nào"
            description="Bắt đầu thêm ứng viên tiềm năng từ danh sách ứng tuyển để sử dụng cho các cơ hội tuyển dụng trong tương lai."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <TalentPoolFilters
            filters={filters}
            onFilterChange={handleFilterChange}
          />
          <TalentPoolTable
            data={talentPool}
            meta={meta}
            onPageChange={handlePageChange}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default TalentPoolTab;
