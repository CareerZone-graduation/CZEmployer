import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import * as applicationService from '@/services/applicationService';
import * as talentPoolService from '@/services/talentPoolService';
import * as utils from '@/utils';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import ErrorState from '@/components/common/ErrorState';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Mail, Phone, FileText, Calendar as CalendarIcon, Edit2, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import CandidateRating from '@/components/jobs/CandidateRating';
import ActivityHistory from '@/components/jobs/ActivityHistory';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import ScheduleInterview from '@/components/interviews/ScheduleInterview';

const ApplicationDetail = () => {
  const { applicationId, jobId } = useParams();
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

  // Add to talent pool mutation
  const addToTalentPoolMutation = useMutation({
    mutationFn: (applicationId) => talentPoolService.addToTalentPool(applicationId, [], ''),
    onSuccess: () => {
      queryClient.invalidateQueries(['talentPool']);
      toast.success('Đã thêm ứng viên vào Talent Pool');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Lỗi khi thêm vào Talent Pool');
    },
  });

  const fetchApplication = useCallback(async () => {
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

  const handleRatingSave = async (newRating) => {
    setIsSubmitting(true);
    try {
      const response = await applicationService.updateCandidateRating(applicationId, newRating);
      setApplication((prev) => ({ ...prev, candidateRating: response.data.candidateRating }));
      toast.success('Cập nhật đánh giá thành công!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi cập nhật đánh giá.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
      PENDING: { label: 'Chờ duyệt', className: 'bg-yellow-100 text-yellow-800' },
      REVIEWING: { label: 'Đang xem xét', className: 'bg-blue-100 text-blue-800' },
      SCHEDULED_INTERVIEW: { label: 'Đã lên lịch PV', className: 'bg-cyan-100 text-cyan-800' },
      INTERVIEWED: { label: 'Đã phỏng vấn', className: 'bg-purple-100 text-purple-800' },
      ACCEPTED: { label: 'Đã chấp nhận', className: 'bg-green-100 text-green-800' },
      REJECTED: { label: 'Đã từ chối', className: 'bg-red-100 text-red-800' },
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
    <div className="container mx-auto max-w-6xl p-4 lg:p-6">
      <div className="mb-6">
        <Button asChild variant="outline" size="sm">
          <Link to={`/jobs/recruiter/${jobId}`} state={{ defaultTab: 'candidates' }}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại danh sách ứng viên
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="text-center">
              <Avatar className="w-24 h-24 mx-auto mb-4 border-2 border-primary">
                <AvatarImage src={application.candidateAvatar} alt={application.candidateName} />
                <AvatarFallback>{application.candidateName?.charAt(0)}</AvatarFallback>
              </Avatar>
              <CardTitle>{application.candidateName}</CardTitle>
              <CardDescription>Ứng tuyển cho vị trí: {application.jobSnapshot.title}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${application.candidateEmail}`} className="text-primary hover:underline">{application.candidateEmail}</a>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{application.candidatePhone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span>Nộp ngày: {utils.formatDate(application.appliedAt)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Hành động</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => addToTalentPoolMutation.mutate(applicationId)}
                disabled={addToTalentPoolMutation.isLoading}
              >
                <Star className="mr-2 h-4 w-4" />
                {addToTalentPoolMutation.isLoading ? 'Đang thêm...' : 'Thêm vào Talent Pool'}
              </Button>

              <Button
                className="w-full justify-start"
                variant="default"
                disabled={!!application.interviewInfo}
                onClick={() => setIsInterviewModalOpen(true)}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {application.interviewInfo ? 'Đã lên lịch' : 'Lên lịch phỏng vấn'}
              </Button>

              <ScheduleInterview
                open={isInterviewModalOpen}
                onOpenChange={setIsInterviewModalOpen}
                application={application}
                onSuccess={handleScheduleSuccess}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Đánh giá & Ghi chú</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <CandidateRating
                initialRating={application.candidateRating || 'NOT_RATED'}
                onRatingSave={handleRatingSave}
                isSubmitting={isSubmitting}
              />
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="notes-textarea">Ghi chú nội bộ</Label>
                  {!isEditingNotes && (
                    <Button variant="ghost" size="icon" onClick={() => setIsEditingNotes(true)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {isEditingNotes ? (
                  <>
                    <Textarea
                      id="notes-textarea"
                      value={currentNotes}
                      onChange={(e) => setCurrentNotes(e.target.value)}
                      rows={4}
                      placeholder="Thêm ghi chú về ứng viên..."
                      disabled={isSubmitting}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleNotesSave}
                        disabled={isSubmitting || currentNotes === (application.notes || '')}
                        className="flex-1"
                      >
                        {isSubmitting ? 'Đang lưu...' : 'Lưu'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setIsEditingNotes(false);
                          setCurrentNotes(application.notes || '');
                        }}
                        disabled={isSubmitting}
                      >
                        Hủy
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-md min-h-[100px]">
                    {application.notes || <span className="italic">Chưa có ghi chú.</span>}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Thông tin ứng tuyển</CardTitle>
                <CardDescription>Trạng thái hiện tại của đơn ứng tuyển.</CardDescription>
              </div>
              {getStatusBadge(application.status)}
            </CardHeader>
            <CardContent>
              <Link
                to="/cv-viewer"
                state={{ cvUrl: application.submittedCV.path }}
                className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
              >
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-semibold text-primary">Xem CV đính kèm</p>
                  <p className="text-xs text-muted-foreground">{application.submittedCV.name}</p>
                </div>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thư giới thiệu</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground whitespace-pre-wrap">{application.coverLetter || 'Không có thư giới thiệu.'}</p>
            </CardContent>
          </Card>

          <ActivityHistory history={application.activityHistory} />
        </div>
      </div>
    </div>
  );
};

const ApplicationDetailSkeleton = () => (
  <div className="max-w-6xl mx-auto p-4 lg:p-6">
    <div className="mb-6"><Skeleton className="h-9 w-48" /></div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardHeader className="text-center">
            <Skeleton className="w-24 h-24 rounded-full mx-auto mb-4" />
            <Skeleton className="h-7 w-3/4 mx-auto" />
            <Skeleton className="h-5 w-1/2 mx-auto mt-2" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-9 w-full" />
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
          <CardContent><Skeleton className="h-16 w-full" /></CardContent>
        </Card>
        <Card>
          <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
          <CardContent><Skeleton className="h-24 w-full" /></CardContent>
        </Card>
        <Card>
          <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
          <CardContent><Skeleton className="h-48 w-full" /></CardContent>
        </Card>
      </div>
    </div>
  </div>
);

export default ApplicationDetail;
