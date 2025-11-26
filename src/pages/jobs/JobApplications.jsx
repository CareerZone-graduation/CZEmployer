import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import * as applicationService from '@/services/applicationService';
import * as jobService from '@/services/jobService';
import * as utils from '@/utils';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowLeft, User, Mail, Phone, Download, Search, MoreHorizontal, Eye, Users, MessageCircle, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';


import Modal from '@/components/common/Modal';
import ApplicationDetail from './ApplicationDetail';
import CandidateCompareModal from '@/components/candidates/CandidateCompareModal';

const JobApplications = ({ isEmbedded = false }) => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [meta, setMeta] = useState({});
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApplications, setSelectedApplications] = useState([]);

  const [viewingApplicationId, setViewingApplicationId] = useState(null);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: 'all',
    search: '',
    sort: '-appliedAt',
    isReapplied: 'all',
  });

  const fetchJobAndApplications = useCallback(async (isInitial = false) => {
    if (isInitial) {
      setIsInitialLoading(true);
    } else {
      setIsFetching(true);
    }
    setError(null);
    try {
      const apiFilters = { ...filters };
      if (apiFilters.status === 'all') delete apiFilters.status;
      if (apiFilters.isReapplied === 'all') delete apiFilters.isReapplied;

      const [jobResponse, appsResponse] = await Promise.all([
        jobService.getRecruiterJobById(jobId),
        applicationService.getJobApplications(jobId, apiFilters),
      ]);
      setJob(jobResponse.data);
      setApplications(appsResponse.data);
      setMeta(appsResponse.meta);
    } catch (err) {
      console.error("Error fetching data:", err);
      const errorMessage = err.response?.data?.message || 'Không thể tải dữ liệu.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsInitialLoading(false);
      setIsFetching(false);
    }
  }, [jobId, filters]);

  useEffect(() => {
    fetchJobAndApplications(true);
  }, [fetchJobAndApplications]);

  useEffect(() => {
    if (!isInitialLoading) {
      fetchJobAndApplications(false);
    }
  }, [filters, isInitialLoading, fetchJobAndApplications]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleSearch = () => {
    handleFilterChange('search', searchTerm);
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedApplications(applications.map(app => app._id));
    } else {
      setSelectedApplications([]);
    }
  };

  const handleSelectApplication = (applicationId) => {
    setSelectedApplications(prev => {
      if (prev.includes(applicationId)) {
        return prev.filter(id => id !== applicationId);
      } else {
        return [...prev, applicationId];
      }
    });
  };

  const handleCompare = () => {
    if (selectedApplications.length < 2) {
      toast.error('Vui lòng chọn ít nhất 2 ứng viên để so sánh');
      return;
    }
    if (selectedApplications.length > 5) {
      toast.error('Chỉ có thể so sánh tối đa 5 ứng viên');
      return;
    }
    setIsCompareModalOpen(true);
  };

  const handleRemoveFromCompare = (applicationId) => {
    setSelectedApplications(prev => {
      const newSelection = prev.filter(id => id !== applicationId);
      if (newSelection.length < 2) {
        setIsCompareModalOpen(false);
        toast.info('Đã đóng so sánh vì không đủ số lượng ứng viên');
      }
      return newSelection;
    });
  };

  const handleViewDetailFromCompare = (applicationId) => {
    setIsCompareModalOpen(false);
    setViewingApplicationId(applicationId);
  };

  const handleMessage = (candidateId) => {
    window.open(`/messaging?userId=${candidateId}`, '_blank');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { label: 'Chờ duyệt', className: 'bg-yellow-100 text-yellow-800' },
      SUITABLE: { label: 'Phù hợp', className: 'bg-green-100 text-green-800' },
      SCHEDULED_INTERVIEW: { label: 'Đã lên lịch PV', className: 'bg-cyan-100 text-cyan-800' },
      OFFER_SENT: { label: 'Đã gửi đề nghị', className: 'bg-purple-100 text-purple-800' },
      ACCEPTED: { label: 'Đã chấp nhận', className: 'bg-green-100 text-green-800' },
      REJECTED: { label: 'Đã từ chối', className: 'bg-red-100 text-red-800' },
    };
    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };



  if (isInitialLoading) {
    return <ApplicationListSkeleton />;
  }

  if (error) {
    return <ErrorState onRetry={() => fetchJobAndApplications(true)} message={error} />;
  }

  return (
    <div className={isEmbedded ? "" : "max-w-7xl mx-auto p-4"}>
      {!isEmbedded && (
        <div className="mb-6 flex items-center justify-between">
          <Button asChild variant="outline" size="sm">
            <Link to={`/jobs/recruiter/${jobId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại chi tiết
            </Link>
          </Button>
        </div>
      )}

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-bold text-blue-700">{job?.stats?.totalApplications || 0}</span>
            <span className="text-xs text-blue-600 font-medium mt-1">Tổng hồ sơ</span>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 border-yellow-100">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-bold text-yellow-700">{job?.stats?.byStatus?.pending || 0}</span>
            <span className="text-xs text-yellow-600 font-medium mt-1">Chờ duyệt</span>
          </CardContent>
        </Card>
        <Card className="bg-indigo-50 border-indigo-100">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-bold text-indigo-700">{job?.stats?.byStatus?.suitable || 0}</span>
            <span className="text-xs text-indigo-600 font-medium mt-1">Phù hợp</span>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-100">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-bold text-purple-700">{(job?.stats?.byStatus?.scheduledInterview || 0) + (job?.stats?.byStatus?.offerSent || 0)}</span>
            <span className="text-xs text-purple-600 font-medium mt-1">Phỏng vấn & Offer</span>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-100">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-bold text-green-700">{job?.stats?.byStatus?.accepted || 0}</span>
            <span className="text-xs text-green-600 font-medium mt-1">Chấp nhận</span>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-100">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-bold text-red-700">{job?.stats?.byStatus?.rejected || 0}</span>
            <span className="text-xs text-red-600 font-medium mt-1">Từ chối</span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Danh sách ứng viên</CardTitle>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Tìm kiếm ứng viên..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Trạng thái hồ sơ</label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Tất cả trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="PENDING">Chờ duyệt</SelectItem>
                  <SelectItem value="SUITABLE">Phù hợp</SelectItem>
                  <SelectItem value="SCHEDULED_INTERVIEW">Đã lên lịch PV</SelectItem>
                  <SelectItem value="OFFER_SENT">Đã gửi đề nghị</SelectItem>
                  <SelectItem value="ACCEPTED">Đã chấp nhận</SelectItem>
                  <SelectItem value="REJECTED">Đã từ chối</SelectItem>
                </SelectContent>
              </Select>
            </div>



            {/* Reapplied Filter - Radio Style */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Lịch sử ứng tuyển</label>
              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="isReapplied"
                    checked={filters.isReapplied === 'all'}
                    onChange={() => handleFilterChange('isReapplied', 'all')}
                    className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                  />
                  <span className="text-sm text-gray-600">Tất cả</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="isReapplied"
                    checked={filters.isReapplied === 'true'}
                    onChange={() => handleFilterChange('isReapplied', 'true')}
                    className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                  />
                  <span className="text-sm text-gray-600">Ứng tuyển lại</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="isReapplied"
                    checked={filters.isReapplied === 'false'}
                    onChange={() => handleFilterChange('isReapplied', 'false')}
                    className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                  />
                  <span className="text-sm text-gray-600">Lần đầu</span>
                </label>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className={isFetching ? "opacity-50 pointer-events-none transition-opacity duration-200" : "transition-opacity duration-200"}>
          {/* Bulk Actions Toolbar */}
          {selectedApplications.length > 0 && (
            <Card className="mb-4 bg-blue-50 border-blue-200">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    Đã chọn {selectedApplications.length} ứng viên
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      onClick={handleCompare}
                      disabled={selectedApplications.length < 2}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      So sánh ({selectedApplications.length})
                    </Button>

                    <Button variant="ghost" onClick={() => setSelectedApplications([])}>
                      Bỏ chọn
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {applications.length === 0 ? (
            <EmptyState message="Chưa có ứng viên nào cho vị trí này." />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedApplications.length === applications.length}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Ứng viên</TableHead>
                    <TableHead>Thông tin liên hệ</TableHead>
                    <TableHead>Ngày nộp</TableHead>
                    <TableHead>Trạng thái</TableHead>

                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app) => (
                    <TableRow
                      key={app._id}
                      className="hover:bg-gray-50"
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedApplications.includes(app._id)}
                          onCheckedChange={() => handleSelectApplication(app._id)}
                        />
                      </TableCell>
                      <TableCell
                        onClick={() => setViewingApplicationId(app._id)}
                        className="cursor-pointer"
                      >
                        <div className="font-medium">{app.candidateName}</div>
                      </TableCell>
                      <TableCell
                        onClick={() => setViewingApplicationId(app._id)}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-4 w-4" /> {app.candidateEmail}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <Phone className="h-4 w-4" /> {app.candidatePhone}
                        </div>
                      </TableCell>
                      <TableCell
                        onClick={() => setViewingApplicationId(app._id)}
                        className="cursor-pointer"
                      >{utils.formatDate(app.appliedAt)}</TableCell>
                      <TableCell
                        onClick={() => setViewingApplicationId(app._id)}
                        className="cursor-pointer"
                      >{getStatusBadge(app.status)}</TableCell>

                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMessage(app.candidateUserId);
                            }}
                            title="Nhắn tin"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                                <span className="sr-only">Mở menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild onClick={(e) => e.stopPropagation()}>
                                <a href={app.submittedCV.path} target="_blank" rel="noopener noreferrer">
                                  <Eye className="mr-2 h-4 w-4" />
                                  Xem CV
                                </a>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild onClick={(e) => e.stopPropagation()}>
                                <a href={app.submittedCV.path} download>
                                  <Download className="mr-2 h-4 w-4" />
                                  Tải xuống
                                </a>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {/* Pagination */}
              {meta.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-gray-600">
                    Hiển thị {((meta.currentPage - 1) * meta.limit) + 1} -{' '}
                    {Math.min(meta.currentPage * meta.limit, meta.totalItems)} trong tổng số{' '}
                    {meta.totalItems} ứng viên
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={meta.currentPage === 1}
                      onClick={() => handlePageChange(meta.currentPage - 1)}
                    >
                      Trước
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={meta.currentPage === meta.totalPages}
                      onClick={() => handlePageChange(meta.currentPage + 1)}
                    >
                      Sau
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>



      <CandidateCompareModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        applicationIds={selectedApplications}
        onRemoveCandidate={handleRemoveFromCompare}
        onViewDetail={handleViewDetailFromCompare}
      />

      {/* Application Detail Sheet */}
      {/* Application Detail Modal */}
      <Modal
        isOpen={!!viewingApplicationId}
        onClose={() => setViewingApplicationId(null)}
        title="Chi tiết đơn ứng tuyển"
        size="full"
      >
        {viewingApplicationId && (
          <ApplicationDetail
            applicationId={viewingApplicationId}
            jobId={jobId}
            isModal={true}
          />
        )}
      </Modal>
    </div>
  );
};

const ApplicationListSkeleton = () => (
  <div className="max-w-7xl mx-auto p-4">
    <div className="mb-6">
      <Skeleton className="h-9 w-48" />
    </div>
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-1/2 mb-4" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-full max-w-sm" />
          <Skeleton className="h-10 w-48" />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead><Skeleton className="h-5 w-24" /></TableHead>
              <TableHead><Skeleton className="h-5 w-40" /></TableHead>
              <TableHead><Skeleton className="h-5 w-20" /></TableHead>
              <TableHead><Skeleton className="h-5 w-28" /></TableHead>
              <TableHead className="text-right"><Skeleton className="h-5 w-20" /></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-9 w-24" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
);

export default JobApplications;
