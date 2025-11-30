import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import * as applicationService from '@/services/applicationService';
import * as talentPoolService from '@/services/talentPoolService';
import { getAccessToken } from '@/utils/token';
import * as utils from '@/utils';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import ErrorState from '@/components/common/ErrorState';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Mail, Phone, FileText, Calendar as CalendarIcon, Edit2, Star, Clock, MessageCircle, ChevronDown, CheckCircle, XCircle, Gift, ChevronLeft, ChevronRight, Download, RefreshCw, History } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ActivityHistory from '@/components/jobs/ActivityHistory';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import ScheduleInterview from '@/components/interviews/ScheduleInterview';
import Modal from '@/components/common/Modal';
import ConfirmationDialog from '@/components/common/ConfirmationDialog';

const ApplicationDetail = ({ applicationId: propAppId, jobId: propJobId, isModal = false, onViewPreviousApplication }) => {
  const { applicationId: paramAppId, jobId: paramJobId } = useParams();
  const applicationId = propAppId || paramAppId;
  const jobId = propJobId || paramJobId;
  const navigate = useNavigate();

  const queryClient = useQueryClient();
  const [application, setApplication] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for inline editing
  const [currentNotes, setCurrentNotes] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  // State for modals
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);

  // Add to talent pool mutation
  // Add to talent pool mutation
  const addToTalentPoolMutation = useMutation({
    mutationFn: (applicationId) => talentPoolService.addToTalentPool(applicationId, [], ''),
    onSuccess: () => {
      queryClient.invalidateQueries(['talentPool']);
      toast.success('Đã thêm ứng viên vào Talent Pool');
      fetchApplication();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Lỗi khi thêm vào Talent Pool');
    },
  });

  // Remove from talent pool mutation
  const removeFromTalentPoolMutation = useMutation({
    mutationFn: (talentPoolId) => talentPoolService.removeFromTalentPool(talentPoolId),
    onSuccess: () => {
      queryClient.invalidateQueries(['talentPool']);
      toast.success('Đã xóa ứng viên khỏi Talent Pool');
      fetchApplication();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Lỗi khi xóa khỏi Talent Pool');
    },
  });

  const handleTalentPoolToggle = () => {
    if (application.isInTalentPool && application.talentPoolId) {
      removeFromTalentPoolMutation.mutate(application.talentPoolId);
    } else {
      addToTalentPoolMutation.mutate(applicationId);
    }
  };

  const updateStatus = async (status) => {
    setIsSubmitting(true);
    try {
      const response = await applicationService.updateApplicationStatus(applicationId, status);
      setApplication(response.data);
      toast.success('Cập nhật trạng thái thành công');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi cập nhật trạng thái');
    } finally {
      setIsSubmitting(false);
      setConfirmOpen(false);
      setPendingStatus(null);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (newStatus === application.status) return;

    if (['REJECTED', 'OFFER_SENT'].includes(newStatus)) {
      setPendingStatus(newStatus);
      setConfirmOpen(true);
    } else {
      updateStatus(newStatus);
    }
  };

  // ... (fetchApplication and other methods remain same)

  // ...



  const fetchApplication = useCallback(async () => {
    if (!applicationId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await applicationService.getApplicationById(applicationId);
      setApplication(response.data);
      setCurrentNotes(response.data.notes || '');
    } catch (err) {
      console.error("Error fetching application:", err);
      const errorMessage = err.response?.data?.message || 'Không thể tải chi tiết đơn ứng tuyển.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);



  const handleNotesSave = async () => {
    if (currentNotes === (application.notes || '')) return;
    setIsSubmitting(true);
    try {
      const response = await applicationService.updateApplicationNotes(applicationId, currentNotes);
      setApplication((prev) => ({ ...prev, notes: response.data.notes }));
      toast.success('Cập nhật ghi chú thành công!');
      setIsEditingNotes(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi cập nhật ghi chú.');
    } finally {
      setIsSubmitting(false);
    }
  };



  const handleScheduleSuccess = () => {
    fetchApplication(); // Refetch to update status
  };



  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { label: 'Chờ xem xét', className: 'bg-yellow-100 text-yellow-800' },
      SUITABLE: { label: 'Phù hợp', className: 'bg-green-100 text-green-800' },
      SCHEDULED_INTERVIEW: { label: 'Đã lên lịch PV', className: 'bg-cyan-100 text-cyan-800' },
      OFFER_SENT: { label: 'Đã gửi đề nghị', className: 'bg-purple-100 text-purple-800' },
      ACCEPTED: { label: 'Đã chấp nhận', className: 'bg-green-100 text-green-800' },
      REJECTED: { label: 'Đã từ chối', className: 'bg-red-100 text-red-800' },
      OFFER_DECLINED: { label: 'Đã từ chối Offer', className: 'bg-red-100 text-red-800' },
    };


    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };



  if (isLoading) {
    return <ApplicationDetailSkeleton />;
  }

  if (error) {
    return <ErrorState onRetry={fetchApplication} message={error} />;
  }

  if (!application) {
    return null;
  }

  return (
    <div className={isModal ? "h-full p-4 space-y-4" : "container mx-auto max-w-6xl p-4 lg:p-6 space-y-6"}>
      <div className="flex justify-between items-center">
        {!isModal && jobId && (
          <Button asChild variant="outline" size="sm">
            <Link to={`/jobs/recruiter/${jobId}`} state={{ defaultTab: 'candidates' }}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại danh sách
            </Link>
          </Button>
        )}


      </div>

      {/* Compact Header */}
      <Card className="overflow-hidden">
        <div className="p-4 md:p-6 flex flex-col md:flex-row gap-6 justify-between items-start">
          <div className="flex gap-4 w-full">
            <Avatar className="w-16 h-16 border-2 border-white shadow-sm">
              <AvatarImage src={application.candidateAvatar} alt={application.candidateName} />
              <AvatarFallback className="text-lg">{application.candidateName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="space-y-1 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-gray-900">{application.candidateName}</h2>
                  {application.isReapplied && (
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs px-2 py-0.5">
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Ứng tuyển lại
                    </Badge>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Ứng tuyển: <span className="font-medium text-gray-700">{application.jobSnapshot.title}</span>
                  </p>
                </div>
                {/* Mobile Status Badge */}
                <div className="md:hidden">
                  {getStatusBadge(application.status)}
                </div>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500 mt-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5" />
                  <a href={`mailto:${application.candidateEmail}`} className="hover:text-primary hover:underline">
                    {application.candidateEmail}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5" />
                  <span>{application.candidatePhone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{utils.formatDate(application.appliedAt)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3 min-w-max w-full md:w-auto">
            <div className="hidden md:block">
              {getStatusBadge(application.status)}
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-1 md:flex-none"
                    disabled={isSubmitting || ['OFFER_SENT', 'ACCEPTED', 'OFFER_DECLINED', 'REJECTED'].includes(application.status)}
                  >
                    Cập nhật <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => handleStatusUpdate('SUITABLE')}
                    disabled={application.status !== 'PENDING'}
                    className={application.status !== 'PENDING' ? "opacity-50 cursor-not-allowed" : ""}
                  >
                    <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                    Đánh giá phù hợp
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleStatusUpdate('OFFER_SENT')}
                    disabled={!['SUITABLE', 'SCHEDULED_INTERVIEW'].includes(application.status)}
                    className={!['SUITABLE', 'SCHEDULED_INTERVIEW'].includes(application.status) ? "opacity-50 cursor-not-allowed" : ""}
                  >
                    <Gift className="mr-2 h-4 w-4 text-purple-600" />
                    Gửi đề nghị (Offer)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleStatusUpdate('REJECTED')}
                    className="text-red-600 focus:text-red-600"
                    disabled={application.status !== 'PENDING'}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Từ chối ứng viên
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                size="sm"
                variant="outline"
                className="flex-1 md:flex-none"
                onClick={() => window.open(`/messaging?userId=${application.candidateUserId}`, '_blank')}
              >
                <MessageCircle className="mr-2 h-3.5 w-3.5" />
                Nhắn tin
              </Button>
              <Button
                size="sm"
                variant={application.isInTalentPool ? "secondary" : "outline"}
                className={`flex-1 md:flex-none ${application.isInTalentPool ? "bg-yellow-50 hover:bg-yellow-100 border-yellow-200 text-yellow-700" : ""}`}
                onClick={handleTalentPoolToggle}
                disabled={addToTalentPoolMutation.isLoading || removeFromTalentPoolMutation.isLoading}
              >
                <Star className={`mr-2 h-3.5 w-3.5 ${application.isInTalentPool ? "fill-yellow-500 text-yellow-500" : ""}`} />
                {application.isInTalentPool ? "Đã lưu Talent Pool" : "Talent Pool"}
              </Button>
              <Button
                size="sm"
                className="flex-1 md:flex-none"
                disabled={!!application.interviewInfo || application.status !== 'SUITABLE'}
                onClick={() => setIsInterviewModalOpen(true)}
              >
                <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                {application.interviewInfo ? 'Đã lên lịch' : 'Phỏng vấn'}
              </Button>
            </div>
          </div>
        </div>
      </Card >

      {/* Previous Application History - chỉ hiển thị nếu đây là đơn ứng tuyển lại */}
      {application.previousApplicationId && (
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <History className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-orange-900">Đây là đơn ứng tuyển lại</p>
                  <p className="text-sm text-orange-700">Ứng viên đã từng ứng tuyển vào vị trí này trước đó</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-orange-300 text-orange-700 hover:bg-orange-100"
                onClick={() => {
                  if (isModal && onViewPreviousApplication) {
                    // Trong modal: gọi callback để thay đổi applicationId
                    onViewPreviousApplication(application.previousApplicationId);
                  } else {
                    // Ngoài modal: navigate sang trang mới
                    navigate(`/applications/${application.previousApplicationId}`);
                  }
                }}
              >
                <History className="h-4 w-4 mr-2" />
                Xem đơn trước
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-full">
        {/* Left Column: CV Viewer & Notes (8 cols) */}
        <div className="md:col-span-8 space-y-4 flex flex-col h-full">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-medium text-gray-700 uppercase tracking-wider">Ghi chú nội bộ</CardTitle>
                {!isEditingNotes && (
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsEditingNotes(true)}>
                    <Edit2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isEditingNotes ? (
                <div className="space-y-2">
                  <Textarea
                    value={currentNotes}
                    onChange={(e) => setCurrentNotes(e.target.value)}
                    rows={3}
                    className="text-sm resize-none"
                    placeholder="Thêm ghi chú..."
                    disabled={isSubmitting}
                    autoFocus
                  />
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setIsEditingNotes(false);
                        setCurrentNotes(application.notes || '');
                      }}
                      disabled={isSubmitting}
                    >
                      Hủy
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleNotesSave}
                      disabled={isSubmitting || currentNotes === (application.notes || '')}
                    >
                      Lưu
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md min-h-[60px] cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => setIsEditingNotes(true)}
                >
                  {application.notes || <span className="italic text-gray-400">Chưa có ghi chú. Nhấn để thêm...</span>}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="flex-1 flex flex-col">
            <CardHeader className="pb-3 border-b">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  CV: {application.submittedCV.name}
                  {application.submittedCV.source === 'TEMPLATE' && (
                    <Badge variant="secondary" className="ml-2 text-xs">CV Template</Badge>
                  )}
                </CardTitle>
                {/* Chỉ hiển thị nút tải xuống cho CV uploaded (có path) */}
                {application.submittedCV.path && (
                  <Button variant="ghost" size="sm" asChild>
                    <a href={application.submittedCV.path} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-2" />
                      Tải xuống
                    </a>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 min-h-[500px] bg-gray-100">
              {application.submittedCV.source === 'TEMPLATE' ? (
                // CV Template: Render qua iframe trỏ về Candidate FE
                <iframe
                  src={`${import.meta.env.VITE_CANDIDATE_FE_URL || 'http://localhost:3000'}/render-application.html?applicationId=${application._id}&token=${getAccessToken()}`}
                  title="CV Template Viewer"
                  className="w-full h-full min-h-[600px] border-0"
                />
              ) : (
                // CV Uploaded: Hiển thị PDF trực tiếp
                <iframe
                  src={application.submittedCV.path}
                  title="CV Viewer"
                  className="w-full h-full min-h-[600px]"
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Tabs (4 cols) */}
        <div className="md:col-span-4 space-y-4 flex flex-col h-full">
          <Card className="h-full flex flex-col">
            <Tabs defaultValue="cover-letter" className="flex-1 flex flex-col">
              <CardHeader className="pb-0 border-b">
                <TabsList className="w-full justify-start bg-transparent p-0 h-auto gap-4">
                  <TabsTrigger
                    value="cover-letter"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-2 text-xs uppercase font-semibold"
                  >
                    Thư giới thiệu
                  </TabsTrigger>
                  <TabsTrigger
                    value="history"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-2 text-xs uppercase font-semibold"
                  >
                    Lịch sử hoạt động
                  </TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent className="flex-1 pt-4 overflow-y-auto max-h-[600px]">
                <TabsContent value="cover-letter" className="mt-0 h-full">
                  <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">
                    {application.coverLetter || (
                      <div className="flex flex-col items-center justify-center h-32 text-gray-400 italic">
                        <FileText className="h-8 w-8 mb-2 opacity-20" />
                        Không có thư giới thiệu
                      </div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="history" className="mt-0 h-full">
                  <ActivityHistory history={application.activityHistory} compact={true} />
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>

      <ScheduleInterview
        open={isInterviewModalOpen}
        onOpenChange={setIsInterviewModalOpen}
        application={application}
        onSuccess={handleScheduleSuccess}
      />

      <ConfirmationDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={pendingStatus === 'REJECTED' ? 'Từ chối ứng viên?' : 'Gửi đề nghị (Offer)?'}
        description={pendingStatus === 'REJECTED'
          ? 'Bạn có chắc chắn muốn từ chối ứng viên này? Hành động này sẽ gửi email thông báo cho ứng viên và không thể hoàn tác.'
          : 'Bạn có chắc chắn muốn gửi đề nghị làm việc cho ứng viên này?'}
        onConfirm={() => updateStatus(pendingStatus)}
        confirmText={pendingStatus === 'REJECTED' ? 'Từ chối' : 'Gửi Offer'}
        cancelText="Hủy bỏ"
        variant={pendingStatus === 'REJECTED' ? 'destructive' : 'default'}
        isLoading={isSubmitting}
      />
    </div >
  );
};

const ApplicationDetailSkeleton = () => (
  <div className="p-4 space-y-4">
    <Card className="p-4">
      <div className="flex gap-4">
        <Skeleton className="w-16 h-16 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      </div>
    </Card>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Skeleton className="h-64 w-full rounded-xl" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  </div>
);

export default ApplicationDetail;
