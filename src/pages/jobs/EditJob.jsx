import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import JobForm from '@/components/jobs/JobForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import * as jobService from '@/services/jobService';

const EditJob = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const { data: jobData, isLoading, error } = useQuery({
    queryKey: ['recruiterJob', jobId],
    queryFn: () => jobService.getRecruiterJobById(jobId),
    enabled: !!jobId,
  });

  const handleSuccess = () => {
    navigate(`/jobs/recruiter/${jobId}`);
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <Skeleton className="h-8 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Không thể tải thông tin tin tuyển dụng</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {error.message || 'Đã có lỗi xảy ra khi tải dữ liệu'}
            </p>
            <button
              onClick={() => navigate('/jobs')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Quay lại danh sách
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Chỉnh Sửa Tin Tuyển Dụng</CardTitle>
        {jobData?.data?.moderationStatus === 'REJECTED' && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800 font-medium">
              ⚠️ Tin tuyển dụng này đã bị từ chối
            </p>
            {jobData?.data?.aiModerationResult?.summary && (
              <p className="text-sm text-red-700 mt-1">
                Lý do: {jobData.data.aiModerationResult.summary}
              </p>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <JobForm onSuccess={handleSuccess} job={jobData?.data} />
      </CardContent>
    </Card>
  );
};

export default EditJob;
