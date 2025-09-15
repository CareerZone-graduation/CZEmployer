import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as jobService from '@/services/jobService';
import * as utils from '@/utils';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import ErrorState from '@/components/common/ErrorState';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import JobForm from '@/components/jobs/JobForm';
import { Briefcase, MapPin, Calendar, DollarSign, Clock, Building, Users, ArrowLeft, BarChart2, Edit, Trash2 } from 'lucide-react';

const RecruiterJobDetail = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const fetchJobDetail = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await jobService.getRecruiterJobById(jobId);
      setJob(response.data);
    } catch (err) {
      console.error("Error fetching job detail:", err);
      const errorMessage = err.response?.data?.message || 'Không thể tải chi tiết công việc.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchJobDetail();
  }, [fetchJobDetail]);

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    fetchJobDetail();
  };

  const handleDeleteJob = async () => {
    try {
      await jobService.deleteJob(jobId);
      toast.success('Xóa tin tuyển dụng thành công!');
      navigate('/jobs');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Không thể xóa tin tuyển dụng.';
      toast.error(errorMessage);
    } finally {
      setIsAlertOpen(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      ACTIVE: { label: 'Đang tuyển', className: 'bg-green-100 text-green-800' },
      INACTIVE: { label: 'Đã ẩn', className: 'bg-gray-100 text-gray-800' },
      EXPIRED: { label: 'Hết hạn', className: 'bg-red-100 text-red-800' },
    };
    const config = statusConfig[status] || statusConfig.INACTIVE;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const renderDetailItem = (Icon, label, value) => (
    <div className="flex items-start gap-3">
      <Icon className="h-5 w-5 text-gray-500 mt-1" />
      <div>
        <p className="font-medium text-gray-600">{label}</p>
        <p className="text-gray-800">{value}</p>
      </div>
    </div>
  );

  if (isLoading) {
    return <JobDetailSkeleton />;
  }

  if (error) {
    return <ErrorState onRetry={fetchJobDetail} message={error} />;
  }

  if (!job) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="mb-6">
        <Button asChild variant="outline" size="sm">
          <Link to="/jobs">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại danh sách
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900">{job.title}</CardTitle>
                  <p className="text-md text-gray-600 mt-1">
                    {`${job.location?.commune}, ${job.location?.district}, ${job.location?.province}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(job.status)}
                  <Button variant="outline" size="icon" onClick={() => setIsDialogOpen(true)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => setIsAlertOpen(true)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <section>
                <h3 className="font-semibold text-lg mb-3 border-b pb-2">Mô tả công việc</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
              </section>
              <section>
                <h3 className="font-semibold text-lg mb-3 border-b pb-2">Yêu cầu ứng viên</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{job.requirements}</p>
              </section>
              <section>
                <h3 className="font-semibold text-lg mb-3 border-b pb-2">Quyền lợi</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{job.benefits}</p>
              </section>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Briefcase className="h-5 w-5" />
                Thông tin chung
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderDetailItem(DollarSign, 'Mức lương', `${utils.formatCurrency(job.minSalary)} - ${utils.formatCurrency(job.maxSalary)}`)}
              {renderDetailItem(Building, 'Hình thức làm việc', job.workType)}
              {renderDetailItem(Users, 'Loại hình công việc', job.type)}
              {renderDetailItem(Calendar, 'Hạn nộp hồ sơ', utils.formatDate(job.deadline))}
              {renderDetailItem(Clock, 'Ngày đăng', utils.formatDate(job.createdAt))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg">
                <div className="flex items-center gap-2">
                  <BarChart2 className="h-5 w-5" />
                  Thống kê
                </div>
                <Button asChild variant="link" className="p-0 h-auto">
                  <Link to={`/jobs/${job._id}/applications`}>Xem tất cả ứng viên</Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tổng số hồ sơ:</span>
                <span className="font-bold text-lg">{job.stats?.totalApplications || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Đang chờ duyệt:</span>
                <span className="font-semibold">{job.stats?.byStatus?.pending || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Đang phỏng vấn:</span>
                <span className="font-semibold">{job.stats?.byStatus?.interviewed || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Đã chấp nhận:</span>
                <span className="font-semibold text-green-600">{job.stats?.byStatus?.accepted || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Đã từ chối:</span>
                <span className="font-semibold text-red-600">{job.stats?.byStatus?.rejected || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cập nhật Tin Tuyển Dụng</DialogTitle>
            <DialogDescription>
              Chỉnh sửa thông tin chi tiết của tin tuyển dụng
            </DialogDescription>
          </DialogHeader>
          <JobForm onClose={handleCloseDialog} job={job} />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Tin tuyển dụng sẽ bị xóa vĩnh viễn khỏi hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteJob} className="bg-red-600 hover:bg-red-700">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const JobDetailSkeleton = () => (
  <div className="max-w-5xl mx-auto p-4">
    <div className="mb-6">
      <Skeleton className="h-9 w-40" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-5 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-3/5" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-3/5" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);

export default RecruiterJobDetail;
