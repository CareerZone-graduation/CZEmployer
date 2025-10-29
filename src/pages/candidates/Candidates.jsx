import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import { Checkbox } from '@/components/ui/checkbox';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  Filter, 
  Download, 
  MoreHorizontal, 
  Eye, 
  Star,
  Users,
  UserCheck,
  Calendar,
  TrendingUp,
  X
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Briefcase } from 'lucide-react';
import TalentPoolTab from '@/components/company/talent-pool/TalentPoolTab';

// Statistics Card Component
const StatCard = ({ title, value, icon: IconComponent, description, className = '' }) => (
  <Card className={className}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <IconComponent className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </CardContent>
  </Card>
);

const Candidates = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'talent-pool'
  const [applications, setApplications] = useState([]);
  const [meta, setMeta] = useState({});
  const [statistics, setStatistics] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: 'all',
    candidateRating: 'all',
    search: '',
    sort: '-appliedAt',
    jobIds: '',
    fromDate: '',
    toDate: ''
  });

  // Fetch jobs for filter dropdown
  const fetchJobs = useCallback(async () => {
    try {
      const response = await jobService.getMyJobs({ limit: 100 });
      setJobs(response.data || []);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    }
  }, []);

  // Fetch applications
  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const apiFilters = { ...filters };
      if (apiFilters.status === 'all') delete apiFilters.status;
      if (apiFilters.candidateRating === 'all') delete apiFilters.candidateRating;
      if (!apiFilters.jobIds) delete apiFilters.jobIds;
      if (!apiFilters.fromDate) delete apiFilters.fromDate;
      if (!apiFilters.toDate) delete apiFilters.toDate;

      const response = await applicationService.getAllApplications(apiFilters);
      setApplications(response.data);
      setMeta(response.meta);
    } catch (err) {
      console.error('Error fetching applications:', err);
      const errorMessage = err.response?.data?.message || 'Không thể tải dữ liệu.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Fetch statistics
  const fetchStatistics = useCallback(async () => {
    try {
      const statFilters = {};
      if (filters.jobIds) statFilters.jobIds = filters.jobIds;
      if (filters.fromDate) statFilters.fromDate = filters.fromDate;
      if (filters.toDate) statFilters.toDate = filters.toDate;

      const response = await applicationService.getApplicationsStatistics(statFilters);
      setStatistics(response.data);
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  }, [filters.jobIds, filters.fromDate, filters.toDate]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    if (activeTab === 'all') {
      fetchApplications();
      fetchStatistics();
    }
  }, [activeTab, fetchApplications, fetchStatistics]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleSearch = () => {
    handleFilterChange('search', searchTerm);
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const downloadCSV = (csv, filename) => {
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  const getRatingBadge = (rating) => {
    const ratingConfig = {
      NOT_RATED: { label: 'Chưa đánh giá', className: 'bg-gray-100 text-gray-800' },
      NOT_SUITABLE: { label: 'Không phù hợp', className: 'bg-red-100 text-red-800' },
      MAYBE: { label: 'Có thể', className: 'bg-yellow-100 text-yellow-800' },
      SUITABLE: { label: 'Phù hợp', className: 'bg-blue-100 text-blue-800' },
      PERFECT_MATCH: { label: 'Rất phù hợp', className: 'bg-green-100 text-green-800' },
    };
    const config = ratingConfig[rating] || { label: rating, className: 'bg-gray-100 text-gray-800' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  if (isLoading && !applications.length) {
    return <CandidatesPageSkeleton />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Quản lý Ứng viên</h1>
        <p className="text-muted-foreground">Xem và quản lý tất cả ứng viên từ các tin tuyển dụng của bạn</p>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Tổng đơn ứng tuyển"
            value={statistics.summary.totalApplications}
            icon={Users}
            description="Tất cả các đơn ứng tuyển"
          />
          <StatCard
            title="Đơn mới (7 ngày)"
            value={statistics.summary.newApplications}
            icon={TrendingUp}
            description="Ứng tuyển trong 7 ngày qua"
            className="border-blue-200"
          />
          <StatCard
            title="Chờ xem xét"
            value={statistics.summary.pendingReviews}
            icon={UserCheck}
            description="Cần được duyệt"
            className="border-yellow-200"
          />
          <StatCard
            title="Lịch phỏng vấn"
            value={statistics.summary.scheduledInterviews}
            icon={Calendar}
            description="Đã lên lịch"
            className="border-green-200"
          />
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Tất cả ứng viên</TabsTrigger>
          <TabsTrigger value="talent-pool">Talent Pool</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Bộ lọc</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Tìm theo tên, email, SĐT..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button onClick={handleSearch} size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>

                {/* Status Filter */}
                <Select value={filters.status} onValueChange={(val) => handleFilterChange('status', val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="PENDING">Chờ duyệt</SelectItem>
                    <SelectItem value="REVIEWING">Đang xem xét</SelectItem>
                    <SelectItem value="SCHEDULED_INTERVIEW">Đã lên lịch PV</SelectItem>
                    <SelectItem value="INTERVIEWED">Đã phỏng vấn</SelectItem>
                    <SelectItem value="ACCEPTED">Đã chấp nhận</SelectItem>
                    <SelectItem value="REJECTED">Đã từ chối</SelectItem>
                  </SelectContent>
                </Select>

                {/* Rating Filter */}
                <Select value={filters.candidateRating} onValueChange={(val) => handleFilterChange('candidateRating', val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Đánh giá" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả đánh giá</SelectItem>
                    <SelectItem value="NOT_RATED">Chưa đánh giá</SelectItem>
                    <SelectItem value="NOT_SUITABLE">Không phù hợp</SelectItem>
                    <SelectItem value="MAYBE">Có thể</SelectItem>
                    <SelectItem value="SUITABLE">Phù hợp</SelectItem>
                    <SelectItem value="PERFECT_MATCH">Rất phù hợp</SelectItem>
                  </SelectContent>
                </Select>

                {/* Job Filter */}
                <Select value={filters.jobIds || 'all'} onValueChange={(val) => handleFilterChange('jobIds', val === 'all' ? '' : val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tin tuyển dụng" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả tin</SelectItem>
                    {jobs.map((job) => (
                      <SelectItem key={job._id} value={job._id}>
                        {job.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Active Filters Display */}
              {(filters.status !== 'all' || filters.candidateRating !== 'all' || filters.jobIds || filters.search) && (
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Bộ lọc đang áp dụng:</span>
                  <div className="flex gap-2 flex-wrap">
                    {filters.status !== 'all' && (
                      <Badge variant="secondary" className="gap-1">
                        Trạng thái: {filters.status}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange('status', 'all')} />
                      </Badge>
                    )}
                    {filters.candidateRating !== 'all' && (
                      <Badge variant="secondary" className="gap-1">
                        Đánh giá: {filters.candidateRating}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange('candidateRating', 'all')} />
                      </Badge>
                    )}
                    {filters.search && (
                      <Badge variant="secondary" className="gap-1">
                        Tìm kiếm: {filters.search}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => { setSearchTerm(''); handleFilterChange('search', ''); }} />
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearchTerm('');
                        setFilters(prev => ({
                          ...prev,
                          status: 'all',
                          candidateRating: 'all',
                          jobIds: '',
                          search: ''
                        }));
                      }}
                    >
                      Xóa tất cả
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Applications Table */}
          <Card>
            <CardContent className="pt-6">
              {error ? (
                <ErrorState message={error} onRetry={fetchApplications} />
              ) : applications.length === 0 ? (
                <EmptyState message="Không có ứng viên nào" />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ứng viên</TableHead>
                      <TableHead>Vị trí ứng tuyển</TableHead>
                      <TableHead>Ngày ứng tuyển</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Đánh giá</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((app) => (
                      <TableRow key={app._id} className="cursor-pointer hover:bg-gray-50" onClick={() => navigate(`/jobs/${app.jobId}/applications/${app._id}`)}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{app.candidateName}</p>
                            <p className="text-sm text-muted-foreground">{app.candidateEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell>{app.jobTitle || app.jobSnapshot?.title}</TableCell>
                        <TableCell>{utils.formatDate(app.appliedAt)}</TableCell>
                        <TableCell>{getStatusBadge(app.status)}</TableCell>
                        <TableCell>{getRatingBadge(app.candidateRating)}</TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/jobs/${app.jobId}/applications`);
                            }}
                          >
                            <Briefcase className="mr-2 h-4 w-4" />
                            Xem job
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {/* Pagination */}
              {meta.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(meta.currentPage - 1)}
                    disabled={meta.currentPage === 1}
                  >
                    Trước
                  </Button>
                  <span className="flex items-center px-4">
                    Trang {meta.currentPage} / {meta.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(meta.currentPage + 1)}
                    disabled={meta.currentPage === meta.totalPages}
                  >
                    Sau
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="talent-pool">
          <TalentPoolTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Skeleton Loading Component
const CandidatesPageSkeleton = () => (
  <div className="p-6 space-y-6">
    <div>
      <Skeleton className="h-8 w-64 mb-2" />
      <Skeleton className="h-4 w-96" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-24" />
      ))}
    </div>
    <Skeleton className="h-64" />
  </div>
);

export default Candidates;
