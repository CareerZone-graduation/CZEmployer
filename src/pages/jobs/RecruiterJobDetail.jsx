import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import JobForm from '@/components/jobs/JobForm';
import { Briefcase, Calendar, DollarSign, Clock, Building, Users, ArrowLeft, Edit, Trash2, MapPin, Power } from 'lucide-react';
import CandidateSuggestions from '@/components/jobs/CandidateSuggestions';
import ChatInterface from '@/components/chat/ChatInterface';
import { createOrGetConversation } from '@/services/chatService';
import JobApplications from './JobApplications';

const RecruiterJobDetail = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tabParam = searchParams.get('tab');
  const defaultTab = tabParam || location.state?.defaultTab || 'overview';

  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [conversationId, setConversationId] = useState(null);

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

  const handleToggleStatus = async () => {
    try {
      const newStatus = job.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      const response = await jobService.updateJob(job._id, { status: newStatus });
      setJob(response.data);
      toast.success(`Đã ${newStatus === 'ACTIVE' ? 'mở lại' : 'đóng'} tin tuyển dụng thành công!`);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Không thể cập nhật trạng thái tin tuyển dụng.';
      toast.error(errorMessage);
    }
  };

  const handleMessageClick = async (candidate) => {
    try {
      setSelectedCandidate(candidate);

      // Create or get conversation with the candidate
      const response = await createOrGetConversation(candidate.userId);
      const conversation = response.data;

      // Open chat interface with the conversation
      setConversationId(conversation._id);
      setIsChatOpen(true);
    } catch (err) {
      console.error('Error creating conversation:', err);
      const errorMessage = err.response?.data?.message || 'Không thể mở cuộc trò chuyện';
      toast.error(errorMessage);
    }
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
    setSelectedCandidate(null);
    setConversationId(null);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      ACTIVE: { label: 'Đang tuyển', className: 'bg-green-100 text-green-800 hover:bg-green-200' },
      INACTIVE: { label: 'Đã ẩn', className: 'bg-gray-100 text-gray-800 hover:bg-gray-200' },
      EXPIRED: { label: 'Hết hạn', className: 'bg-red-100 text-red-800 hover:bg-red-200' },
    };
    const config = statusConfig[status] || statusConfig.INACTIVE;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const renderDetailItem = (Icon, label, value) => (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50/50 hover:bg-gray-50 transition-colors">
      <div className="p-2 bg-white rounded-md shadow-sm">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="font-semibold text-gray-900">{value}</p>
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
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Button asChild variant="ghost" size="sm" className="-ml-2 text-gray-500 hover:text-gray-900">
            <Link to="/jobs">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại danh sách
            </Link>
          </Button>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{job.title}</h1>
                {getStatusBadge(job.status)}
              </div>
              <div className="flex items-center gap-4 text-gray-500 text-sm flex-wrap">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  <span>{job.location?.province || job.location?.city}, {job.location?.district}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>Đăng ngày: {utils.formatDate(job.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  <span>{job.stats?.totalApplications || 0} ứng viên</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              {job.status !== 'EXPIRED' && (
                <Button
                  variant="outline"
                  onClick={handleToggleStatus}
                  className={job.status === 'ACTIVE' ? "text-orange-600 hover:text-orange-700 hover:bg-orange-50" : "text-green-600 hover:text-green-700 hover:bg-green-50"}
                >
                  <Power className="h-4 w-4 mr-2" />
                  {job.status === 'ACTIVE' ? 'Đóng tin' : 'Mở lại'}
                </Button>
              )}
              <Button variant="outline" className="flex-1 md:flex-none" onClick={() => setIsDialogOpen(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Chỉnh sửa
              </Button>
              <Button variant="destructive" size="icon" onClick={() => setIsAlertOpen(true)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px] mb-6">
          <TabsTrigger value="overview">Thông tin chung</TabsTrigger>
          <TabsTrigger value="candidates">Danh sách ứng viên</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 animate-in fade-in-50 duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Job Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Chi tiết công việc</CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  <section>
                    <h3 className="font-semibold text-base mb-3 text-gray-900">Mô tả công việc</h3>
                    <div className="text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50/50 p-4 rounded-lg">
                      {job.description}
                    </div>
                  </section>
                  <section>
                    <h3 className="font-semibold text-base mb-3 text-gray-900">Yêu cầu ứng viên</h3>
                    <div className="text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50/50 p-4 rounded-lg">
                      {job.requirements}
                    </div>
                  </section>
                  <section>
                    <h3 className="font-semibold text-base mb-3 text-gray-900">Quyền lợi</h3>
                    <div className="text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50/50 p-4 rounded-lg">
                      {job.benefits}
                    </div>
                  </section>
                </CardContent>
              </Card>

              {/* AI Suggestions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      AI Gợi ý Ứng viên
                    </span>
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700">Beta</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CandidateSuggestions
                    jobId={jobId}
                    onMessageClick={handleMessageClick}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Stats & Info */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Briefcase className="h-5 w-5 text-primary" />
                    Thông tin cơ bản
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {renderDetailItem(DollarSign, 'Mức lương', `${utils.formatCurrency(job.minSalary)} - ${utils.formatCurrency(job.maxSalary)}`)}
                  {renderDetailItem(Building, 'Hình thức', job.workType)}
                  {renderDetailItem(Users, 'Loại hình', job.type)}
                  {renderDetailItem(Calendar, 'Hạn nộp', utils.formatDate(job.deadline))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="candidates" className="animate-in fade-in-50 duration-300">
          <JobApplications isEmbedded={true} />
        </TabsContent>
      </Tabs>

      {/* Chat Interface */}
      <ChatInterface
        isOpen={isChatOpen}
        onClose={handleCloseChat}
        conversationId={conversationId}
        recipientId={selectedCandidate?.userId}
      />

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
  <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
    {/* Header Skeleton */}
    <div className="flex flex-col gap-4">
      <Skeleton className="h-9 w-40" />
      <Card className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-3 w-full">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-6 w-24" />
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>
      </Card>
    </div>

    {/* Tabs Skeleton */}
    <div className="space-y-6">
      <Skeleton className="h-10 w-[400px] rounded-md" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-24 w-full rounded-lg" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-lg" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-transparent">
                  <Skeleton className="h-10 w-10 rounded-md" />
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </div>
);

export default RecruiterJobDetail;
