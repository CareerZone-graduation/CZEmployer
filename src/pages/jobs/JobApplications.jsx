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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
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
import { ArrowLeft, User, Mail, Phone, Download, Search, MoreHorizontal, Eye, Users, MessageCircle, X, LayoutGrid, List, RefreshCcw, History } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';


import Modal from '@/components/common/Modal';
import ApplicationDetail from './ApplicationDetail';
import CandidateCompareModal from '@/components/candidates/CandidateCompareModal';
import KanbanBoard from './kanban/KanbanBoard';
import ScheduleInterview from '@/components/interviews/ScheduleInterview';

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
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'kanban'

  const [viewingApplicationId, setViewingApplicationId] = useState(null);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Schedule Interview State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [schedulingApplication, setSchedulingApplication] = useState(null);

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: 'all',
    search: '',
    sort: '-appliedAt',
    isReapplied: 'all',
  });

  // Adjust limit when switching to Kanban to load more items
  useEffect(() => {
    if (viewMode === 'kanban') {
      setFilters(prev => ({ ...prev, limit: 100, page: 1, status: 'all' }));
    } else {
      setFilters(prev => ({ ...prev, limit: 10, page: 1 }));
    }
  }, [viewMode]);

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

  const handleOpenScheduleModal = (application) => {
    setSchedulingApplication(application);
    setIsScheduleModalOpen(true);
  };

  const handleScheduleSuccess = () => {
    if (schedulingApplication) {
      handleStatusChange(schedulingApplication._id, 'SCHEDULED_INTERVIEW');
    }
    fetchJobAndApplications(false);
  };

  const handleCardAction = (action, application) => {
    switch (action) {
      case 'message':
        handleMessage(application.candidateUserId);
        break;
      case 'schedule':
        handleOpenScheduleModal(application);
        break;
      case 'view_cv':
        window.open(application.submittedCV.path, '_blank');
        break;
      case 'download_cv': {
        const link = document.createElement('a');
        link.href = application.submittedCV.path;
        link.download = `CV_${application.candidateName}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        break;
      }
      case 'toggle_priority':
        toast.info('Tính năng đang phát triển');
        break;
      default:
        break;
    }
  };

  const handleStatusChange = (applicationId, newStatus) => {
    setApplications(prev => prev.map(app =>
      app._id === applicationId ? { ...app, status: newStatus } : app
    ));
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { label: 'Chờ xem xét', className: 'bg-yellow-100 text-yellow-800' },
      SUITABLE: { label: 'Phù hợp', className: 'bg-green-100 text-green-800' },
      SCHEDULED_INTERVIEW: { label: 'Đã lên lịch PV', className: 'bg-cyan-100 text-cyan-800' },
      OFFER_SENT: { label: 'Đã gửi đề nghị', className: 'bg-purple-100 text-purple-800' },
      OFFER_DECLINED: { label: 'Đã từ chối đề nghị', className: 'bg-red-100 text-red-800' },
      ACCEPTED: { label: 'Đã chấp nhận', className: 'bg-green-100 text-green-800' },
      REJECTED: { label: 'Đã từ chối', className: 'bg-red-100 text-red-800' },
    };
    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  return (
    <div className={isEmbedded ? "" : `mx-auto p-4 ${viewMode === 'kanban' ? 'max-w-[1600px]' : 'max-w-7xl'}`}>
      <div className="mb-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        {!isEmbedded ? (
          <Button asChild variant="outline" size="sm">
            <Link to={`/jobs/recruiter/${jobId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại chi tiết
            </Link>
          </Button>
        ) : (
          <div></div>
        )}

        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md text-sm font-medium transition-all ${viewMode === 'list'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            <List className="h-4 w-4 inline-block mr-1" /> Danh sách
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            className={`p-2 rounded-md text-sm font-medium transition-all ${viewMode === 'kanban'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            <LayoutGrid className="h-4 w-4 inline-block mr-1" /> Kanban
          </button>
        </div>
      </div>

      {error ? (
        <ErrorState onRetry={() => fetchJobAndApplications(true)} message={error} />
      ) : (
        <>
          {/* Stats Summary Bar */}
          {isInitialLoading ? <StatsSkeleton /> : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6 max-w-7xl mx-auto w-full">
              <Card className="bg-blue-50 border-blue-100">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-bold text-blue-700">{job?.stats?.totalApplications || 0}</span>
                  <span className="text-xs text-blue-600 font-medium mt-1">Tổng hồ sơ</span>
                </CardContent>
              </Card>
              <Card className="bg-yellow-50 border-yellow-100">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-bold text-yellow-700">{job?.stats?.byStatus?.pending || 0}</span>
                  <span className="text-xs text-yellow-600 font-medium mt-1">Chờ xem xét</span>
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
          )}

          <Card className="border-none shadow-none bg-transparent min-w-0">
            <CardHeader className="pb-3 px-0 max-w-7xl mx-auto w-full">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle>Danh sách ứng viên</CardTitle>
                <div className="flex w-full md:w-auto items-center gap-2">
                  <div className="relative flex-1 md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Tìm kiếm ứng viên..."
                      className="pl-9 bg-white"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                  <Button onClick={handleSearch} variant="secondary">Tìm kiếm</Button>
                </div>
              </div>

              {/* Advanced Filters */}
              <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Status Filter */}
                {viewMode === 'list' && (
                  <div className="space-y-3 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Trạng thái hồ sơ</label>
                    <RadioGroup
                      value={filters.status}
                      onValueChange={(value) => handleFilterChange('status', value)}
                      className="flex flex-wrap gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="all" id="status-all" />
                        <Label htmlFor="status-all" className="cursor-pointer font-normal">Tất cả</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="PENDING" id="status-pending" />
                        <Label htmlFor="status-pending" className="cursor-pointer font-normal">Chờ xem xét</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="SUITABLE" id="status-suitable" />
                        <Label htmlFor="status-suitable" className="cursor-pointer font-normal">Phù hợp</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="SCHEDULED_INTERVIEW" id="status-scheduled" />
                        <Label htmlFor="status-scheduled" className="cursor-pointer font-normal">Đã lên lịch PV</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="OFFER_SENT" id="status-offer" />
                        <Label htmlFor="status-offer" className="cursor-pointer font-normal">Đã gửi đề nghị</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="OFFER_DECLINED" id="status-offer-declined" />
                        <Label htmlFor="status-offer-declined" className="cursor-pointer font-normal">Đã từ chối đề nghị</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="ACCEPTED" id="status-accepted" />
                        <Label htmlFor="status-accepted" className="cursor-pointer font-normal">Đã chấp nhận</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="REJECTED" id="status-rejected" />
                        <Label htmlFor="status-rejected" className="cursor-pointer font-normal">Đã từ chối</Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}

                {/* Reapplied Filter */}
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

            <CardContent className="px-0 min-w-0">
              {(isInitialLoading || (isFetching && viewMode === 'list')) ? (
                <ListSkeleton />
              ) : viewMode === 'kanban' ? (
                <KanbanBoard
                  applications={applications}
                  onStatusChange={handleStatusChange}
                  onCardClick={(app) => setViewingApplicationId(app._id)}
                  onCardAction={handleCardAction}
                  onScheduleInterview={handleOpenScheduleModal}
                  isLoading={isFetching}
                />
              ) : (
                <Card>
                  <CardContent className="p-0">
                    {/* Bulk Actions Toolbar */}
                    {selectedApplications.length > 0 && (
                      <div className="bg-blue-50 border-b border-blue-200 p-4">
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
                      </div>
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
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{app.candidateName}</span>
                                    {app.isReapplied && (
                                      <Badge variant="outline" className="text-orange-600 border-orange-300 bg-orange-50 text-xs">
                                        <RefreshCcw className="h-3 w-3 mr-1" />
                                        Ứng tuyển lại
                                      </Badge>
                                    )}
                                  </div>
                                  {app.isReapplied && app.previousApplicationId && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setViewingApplicationId(app.previousApplicationId);
                                      }}
                                      className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 hover:underline mt-1"
                                    >
                                      <History className="h-3 w-3" />
                                      Xem đơn trước
                                    </button>
                                  )}
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
                          <div className="flex items-center justify-between p-4 border-t">
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
                onViewPreviousApplication={(prevAppId) => setViewingApplicationId(prevAppId)}
              />
            )}
          </Modal>

          <ScheduleInterview
            open={isScheduleModalOpen}
            onOpenChange={setIsScheduleModalOpen}
            application={schedulingApplication}
            onSuccess={handleScheduleSuccess}
          />
        </>
      )}
    </div>
  );
};

const StatsSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6 max-w-7xl mx-auto w-full">
    {[...Array(6)].map((_, i) => (
      <Card key={i} className="bg-gray-50 border-gray-100">
        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
          <Skeleton className="h-8 w-8 mb-2" />
          <Skeleton className="h-3 w-16" />
        </CardContent>
      </Card>
    ))}
  </div>
);

const ListSkeleton = () => (
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
);

export default JobApplications;
