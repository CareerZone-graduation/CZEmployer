import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCandidateSuggestions, retrySuggestionEmbeddings } from '@/services/recommendationService';
import CandidateCard from './CandidateCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Users } from 'lucide-react';
import { toast } from 'sonner';

const CandidateSuggestions = ({ jobId, embeddingStatus, embeddingError }) => {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['suggestions', jobId, page],
    queryFn: () => getCandidateSuggestions(jobId, { page, limit }),
    staleTime: 0, // Disable caching to ensure fresh data
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
    return (
      <ErrorState
        error={error}
        jobId={jobId}
        embeddingStatus={embeddingStatus}
        embeddingError={embeddingError}
        onRetrySuccess={refetch}
        isRefetching={isFetching}
      />
    );
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
            jobId={jobId}
            matchScore={candidate.similarityPercentage}
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

const ErrorState = ({ error, jobId, embeddingStatus, embeddingError, onRetrySuccess, isRefetching }) => {
  const errorMessage = error?.response?.data?.message || error?.message || 'Không thể tải danh sách ứng viên gợi ý';
  const isProcessingMessage = embeddingStatus === 'PROCESSING' || embeddingStatus === 'PENDING';
  const isEmbeddingFailedMessage = embeddingStatus === 'FAILED';
  const displayMessage = isEmbeddingFailedMessage
    ? (embeddingError || 'Sinh embedding thất bại. Vui lòng bấm Retry xử lý embedding.')
    : (isProcessingMessage ? 'Tin tuyển dụng đang được xử lý dữ liệu AI. Vui lòng thử lại sau ít phút.' : errorMessage);
  const isRetryAllowed = isEmbeddingFailedMessage;
  const [retrying, setRetrying] = useState(false);

  const handleRetryEmbedding = async () => {
    try {
      setRetrying(true);
      const response = await retrySuggestionEmbeddings(jobId);
      toast.success(response?.data?.message || 'Đã bắt đầu xử lý lại embedding. Vui lòng thử lại sau ít phút.');
      await onRetrySuccess();
    } catch (retryError) {
      const msg = retryError?.response?.data?.message || 'Không thể retry embedding lúc này';
      toast.error(msg);
    } finally {
      setRetrying(false);
    }
  };

  return (
    <Card className={isProcessingMessage ? 'border-amber-200 bg-amber-50' : 'border-red-200 bg-red-50'}>
      <CardContent className="p-6">
        <div className={`flex items-center gap-3 ${isProcessingMessage ? 'text-amber-700' : 'text-red-700'}`}>
          <AlertCircle className="h-5 w-5" />
          <div>
            <p className="font-semibold">{isProcessingMessage ? 'Đang xử lý' : 'Lỗi'}</p>
            <p className="text-sm">{displayMessage}</p>
            {isRetryAllowed && (
              <Button
                className="mt-3"
                size="sm"
                variant="outline"
                onClick={handleRetryEmbedding}
                disabled={retrying || isRefetching}
              >
                {retrying ? 'Đang retry...' : 'Retry xử lý embedding'}
              </Button>
            )}
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
