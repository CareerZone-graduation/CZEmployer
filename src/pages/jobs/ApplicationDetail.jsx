import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as applicationService from '@/services/applicationService';
import * as utils from '@/utils';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import ErrorState from '@/components/common/ErrorState';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Mail, Phone, FileText, Star, Calendar, Edit2 } from 'lucide-react';

const ApplicationDetail = () => {
  const { applicationId, jobId } = useParams();
  const [application, setApplication] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for modals
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [newRating, setNewRating] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const fetchApplication = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await applicationService.getApplicationById(applicationId);
      setApplication(response.data);
    } catch (err) {
      console.error("Error fetching application:", err);
      const errorMessage = err.response?.data?.message || 'Không thể tải chi tiết đơn ứng tuyển.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [applicationId]);

  const handleStatusChange = async () => {
    if (!newStatus || newStatus === application.status) {
      setIsStatusModalOpen(false);
      return;
    }
    try {
      const response = await applicationService.updateApplicationStatus(applicationId, newStatus);
      setApplication(response.data);
      toast.success('Cập nhật trạng thái thành công!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi cập nhật trạng thái.');
    } finally {
      setIsStatusModalOpen(false);
    }
  };

  const handleRatingChange = async () => {
    if (!newRating || newRating === application.candidateRating) {
      setIsRatingModalOpen(false);
      return;
    }
    try {
      const response = await applicationService.updateCandidateRating(applicationId, newRating);
      setApplication(response.data);
      toast.success('Cập nhật đánh giá thành công!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi cập nhật đánh giá.');
    } finally {
      setIsRatingModalOpen(false);
    }
  };

  const handleNotesChange = async () => {
    if (newNotes === application.notes) {
      setIsNotesModalOpen(false);
      return;
    }
    try {
      const response = await applicationService.updateApplicationNotes(applicationId, newNotes);
      setApplication(response.data);
      toast.success('Cập nhật ghi chú thành công!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi cập nhật ghi chú.');
    } finally {
      setIsNotesModalOpen(false);
    }
  };

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { label: 'Chờ duyệt', className: 'bg-yellow-100 text-yellow-800' },
      REVIEWING: { label: 'Đang xem xét', className: 'bg-blue-100 text-blue-800' },
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
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <Button asChild variant="outline" size="sm">
          <Link to={`/jobs/${jobId}/applications`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại danh sách ứng viên
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Candidate Info */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader className="text-center">
              <Avatar className="w-24 h-24 mx-auto mb-4">
                <AvatarImage src={application.candidateAvatar} alt={application.candidateName} />
                <AvatarFallback>{application.candidateName?.charAt(0)}</AvatarFallback>
              </Avatar>
              <CardTitle>{application.candidateName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-gray-500" />
                <a href={`mailto:${application.candidateEmail}`} className="text-blue-600 hover:underline">{application.candidateEmail}</a>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-gray-500" />
                <span>{application.candidatePhone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>Nộp ngày: {utils.formatDate(application.appliedAt)}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Hành động</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="w-full justify-start" variant="outline" onClick={() => setNewStatus(application.status)}>
                            Đổi trạng thái
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Cập nhật trạng thái ứng tuyển</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                            <Label htmlFor="status-select">Trạng thái mới</Label>
                            <Select value={newStatus} onValueChange={setNewStatus}>
                                <SelectTrigger id="status-select">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PENDING">Chờ duyệt</SelectItem>
                                    <SelectItem value="REVIEWING">Đang xem xét</SelectItem>
                                    <SelectItem value="INTERVIEWED">Đã phỏng vấn</SelectItem>
                                    <SelectItem value="ACCEPTED">Đã chấp nhận</SelectItem>
                                    <SelectItem value="REJECTED">Đã từ chối</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="ghost">Hủy</Button>
                            </DialogClose>
                            <Button onClick={handleStatusChange}>Lưu thay đổi</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                <Dialog open={isRatingModalOpen} onOpenChange={setIsRatingModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="w-full justify-start" variant="outline" onClick={() => setNewRating(application.candidateRating)}>
                            Đánh giá
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Đánh giá ứng viên</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                            <Label htmlFor="rating-select">Đánh giá</Label>
                            <Select value={newRating} onValueChange={setNewRating}>
                                <SelectTrigger id="rating-select">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="NOT_RATED">Chưa đánh giá</SelectItem>
                                    <SelectItem value="NOT_SUITABLE">Không phù hợp</SelectItem>
                                    <SelectItem value="MAYBE">Có thể</SelectItem>
                                    <SelectItem value="SUITABLE">Phù hợp</SelectItem>
                                    <SelectItem value="PERFECT_MATCH">Rất phù hợp</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild><Button variant="ghost">Hủy</Button></DialogClose>
                            <Button onClick={handleRatingChange}>Lưu</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                <Dialog open={isNotesModalOpen} onOpenChange={setIsNotesModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="w-full justify-start" variant="outline" onClick={() => setNewNotes(application.notes || '')}>
                            Thêm ghi chú
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Ghi chú cho ứng viên</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                            <Label htmlFor="notes-textarea">Nội dung ghi chú</Label>
                            <Textarea
                                id="notes-textarea"
                                value={newNotes}
                                onChange={(e) => setNewNotes(e.target.value)}
                                rows={5}
                                placeholder="Nhập ghi chú của bạn ở đây..."
                            />
                        </div>
                        <DialogFooter>
                            <DialogClose asChild><Button variant="ghost">Hủy</Button></DialogClose>
                            <Button onClick={handleNotesChange}>Lưu</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Application Details */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Thông tin ứng tuyển</CardTitle>
              {getStatusBadge(application.status)}
            </CardHeader>
            <CardContent>
              <a href={application.submittedCV.path} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                <FileText className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="font-semibold text-blue-700">Xem CV đính kèm</p>
                  <p className="text-xs text-gray-500">{application.submittedCV.name}</p>
                </div>
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thư giới thiệu</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{application.coverLetter || 'Không có thư giới thiệu.'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ghi chú & Đánh giá</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 italic">{application.notes || 'Chưa có ghi chú nào.'}</p>
              <div className="mt-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <span className="font-semibold">{application.candidateRating.replace('_', ' ')}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const ApplicationDetailSkeleton = () => (
    <div className="max-w-4xl mx-auto p-4">
        <div className="mb-6"><Skeleton className="h-9 w-48" /></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-6">
                <Card>
                    <CardHeader className="text-center">
                        <Skeleton className="w-24 h-24 rounded-full mx-auto mb-4" />
                        <Skeleton className="h-7 w-3/4 mx-auto" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-full" />
                    </CardContent>
                </Card>
            </div>
            <div className="md:col-span-2 space-y-6">
                <Card>
                    <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
                    <CardContent><Skeleton className="h-16 w-full" /></CardContent>
                </Card>
                <Card>
                    <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
                    <CardContent><Skeleton className="h-24 w-full" /></CardContent>
                </Card>
            </div>
        </div>
    </div>
);

export default ApplicationDetail;
