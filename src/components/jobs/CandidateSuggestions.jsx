import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCandidateSuggestions } from '@/services/recommendationService';
import CandidateCard from './CandidateCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Users } from 'lucide-react';

const CandidateSuggestions = ({ jobId, onMessageClick }) => {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ['suggestions', jobId, page],
    queryFn: () => getCandidateSuggestions(jobId, { page, limit }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!jobId,
  });

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  const candidates = data?.data?.candidates || [];
  const pagination = data?.data?.pagination || {};

  if (candidates.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6">
      {/* Candidates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {candidates.map((candidate) => (
          <CandidateCard 
            key={candidate.userId} 
            candidate={candidate}
            onMessageClick={onMessageClick}
          />
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-gray-600">
            Hiển thị {((pagination.currentPage - 1) * pagination.limit) + 1} -{' '}
            {Math.min(pagination.currentPage * pagination.limit, pagination.totalItems)} trong tổng số{' '}
            {pagination.totalItems} ứng viên
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasPrevPage}
              onClick={() => handlePageChange(pagination.currentPage - 1)}
            >
              Trước
            </Button>

            {/* Page numbers */}
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const pageNum = Math.max(1, pagination.currentPage - 2) + i;
              if (pageNum > pagination.totalPages) return null;

              return (
                <Button
                  key={pageNum}
                  variant={pageNum === pagination.currentPage ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}

            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasNextPage}
              onClick={() => handlePageChange(pagination.currentPage + 1)}
            >
              Sau
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="flex-1 space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-6 w-12" />
                </div>
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-32" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

const ErrorState = ({ error }) => {
  const errorMessage = error?.response?.data?.message || error?.message || 'Không thể tải danh sách ứng viên gợi ý';
  
  return (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 text-red-700">
          <AlertCircle className="h-5 w-5" />
          <div>
            <p className="font-semibold">Lỗi</p>
            <p className="text-sm">{errorMessage}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const EmptyState = () => (
  <Card className="border-gray-200">
    <CardContent className="p-12">
      <div className="flex flex-col items-center justify-center text-center">
        <Users className="h-16 w-16 text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Không tìm thấy ứng viên phù hợp
        </h3>
        <p className="text-sm text-gray-500 max-w-md">
          Hiện tại chưa có ứng viên nào phù hợp với tin tuyển dụng này. 
          Hệ thống sẽ tự động cập nhật khi có ứng viên mới.
        </p>
      </div>
    </CardContent>
  </Card>
);

export default CandidateSuggestions;
