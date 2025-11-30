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
  Users,
  UserCheck,
  Calendar,
  TrendingUp,
  X,
  Check,
  ChevronsUpDown,
  Briefcase,
  Filter,
  RefreshCw
} from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from 'cmdk';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import TalentPoolTab from '@/components/company/talent-pool/TalentPoolTab';

// Statistics Card Component
const StatCard = ({ title, value, icon: Icon, description, className = '' }) => (
  <Card className={className}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
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
  const [openJobFilter, setOpenJobFilter] = useState(false);

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: 'all',
    jobStatus: 'ACTIVE',
    search: '',
    sort: '-appliedAt',
    jobIds: '',
    fromDate: '',
    toDate: ''
  });

  // Fetch jobs for filter dropdown
  // Fetch jobs for filter dropdown
  const fetchJobs = useCallback(async () => {
    try {
      const params = { limit: 100 };
      if (filters.jobStatus && filters.jobStatus !== 'all') {
        params.status = filters.jobStatus;
      }
      const response = await jobService.getMyJobs(params);
      setJobs(response.data || []);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    }
  }, [filters.jobStatus]);

  // Fetch applications
  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const apiFilters = { ...filters };
      if (apiFilters.status === 'all') delete apiFilters.status;
      if (apiFilters.jobStatus === 'all') delete apiFilters.jobStatus;
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
      if (filters.jobStatus && filters.jobStatus !== 'all') statFilters.jobStatus = filters.jobStatus;
      if (filters.fromDate) statFilters.fromDate = filters.fromDate;
      if (filters.toDate) statFilters.toDate = filters.toDate;

      const response = await applicationService.getApplicationsStatistics(statFilters);
      setStatistics(response.data);
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  }, [filters.jobIds, filters.jobStatus, filters.fromDate, filters.toDate]);

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
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: value, page: 1 };
      if (key === 'jobStatus') {
        newFilters.jobIds = ''; // Reset selected job when status changes
      }
      return newFilters;
    });
  };

  const handleSearch = () => {
    handleFilterChange('search', searchTerm);
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };



  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { label: 'Chờ xem xét', className: 'bg-yellow-100 text-yellow-800' },
      SUITABLE: { label: 'Phù hợp', className: 'bg-green-100 text-green-800' },
      SCHEDULED_INTERVIEW: { label: 'Đã lên lịch PV', className: 'bg-cyan-100 text-cyan-800' },
      OFFER_SENT: { label: 'Đã gửi đề nghị', className: 'bg-purple-100 text-purple-800' },
      ACCEPTED: { label: 'Đã chấp nhận', className: 'bg-green-100 text-green-800' },
      REJECTED: { label: 'Đã từ chối', className: 'bg-red-100 text-red-800' },
    };
    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getJobStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[10px] ml-2">Đang tuyển</Badge>;
      case 'CLOSED':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-[10px] ml-2">Đã đóng</Badge>;
      case 'EXPIRED':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-[10px] ml-2">Hết hạn</Badge>;

      default:
        return null;
    }
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
            <CardContent className="p-4">
              <div className="flex flex-col gap-4">
                {/* Top Row: Search and Primary Filters */}
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                  <div className="flex-1 w-full md:w-auto flex gap-2">
                    <div className="relative flex-1 md:max-w-sm">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Tìm ứng viên..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      />
                    </div>
                    <Button onClick={handleSearch} variant="secondary">
                      Tìm kiếm
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    {/* Job Status Filter */}
                    <Select value={filters.jobStatus} onValueChange={(val) => handleFilterChange('jobStatus', val)}>
                      <SelectTrigger className="w-[160px]">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <SelectValue placeholder="Trạng thái Job" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả Job</SelectItem>
                        <SelectItem value="ACTIVE">Đang tuyển</SelectItem>
                        <SelectItem value="CLOSED">Đã đóng</SelectItem>
                        <SelectItem value="EXPIRED">Hết hạn</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Job Filter (Searchable) */}
                    <Popover open={openJobFilter} onOpenChange={setOpenJobFilter}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openJobFilter}
                          className={cn(
                            "w-[250px] justify-between font-normal",
                            !filters.jobIds && "text-muted-foreground"
                          )}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="truncate">
                              {filters.jobIds
                                ? jobs.find((job) => job._id === filters.jobIds)?.title || "Tin tuyển dụng"
                                : "Chọn tin tuyển dụng..."}
                            </span>
                          </div>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0" align="start">
                        <Command className="rounded-lg border shadow-md">
                          <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
                            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                            <CommandInput
                              placeholder="Tìm tin tuyển dụng..."
                              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                            />
                          </div>
                          <CommandList className="max-h-[300px] overflow-y-auto overflow-x-hidden">
                            <CommandEmpty className="py-6 text-center text-sm">Không tìm thấy tin nào.</CommandEmpty>
                            <CommandGroup>
                              <CommandItem
                                value="all_jobs_option"
                                onSelect={() => {
                                  handleFilterChange('jobIds', '');
                                  setOpenJobFilter(false);
                                }}
                                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground cursor-pointer"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    !filters.jobIds ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                Tất cả tin
                              </CommandItem>
                              {jobs.map((job) => (
                                <CommandItem
                                  key={job._id}
                                  value={job._id + ' ' + job.title}
                                  onSelect={() => {
                                    handleFilterChange('jobIds', job._id);
                                    setOpenJobFilter(false);
                                  }}
                                  className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground cursor-pointer"
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      filters.jobIds === job._id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {job.title}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>

                    {/* Application Status Filter */}
                    <Select value={filters.status} onValueChange={(val) => handleFilterChange('status', val)}>
                      <SelectTrigger className="w-[180px]">
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4 text-muted-foreground" />
                          <SelectValue placeholder="Trạng thái HS" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                        <SelectItem value="PENDING">Chờ xem xét</SelectItem>
                        <SelectItem value="SUITABLE">Phù hợp</SelectItem>
                        <SelectItem value="SCHEDULED_INTERVIEW">Đã lên lịch PV</SelectItem>
                        <SelectItem value="OFFER_SENT">Đã gửi đề nghị</SelectItem>
                        <SelectItem value="ACCEPTED">Đã chấp nhận</SelectItem>
                        <SelectItem value="REJECTED">Đã từ chối</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Active Filters Display */}
                {(filters.status !== 'all' || filters.jobStatus !== 'all' || filters.jobIds || filters.search) && (
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <span className="text-xs font-medium text-muted-foreground">Đang lọc:</span>
                    <div className="flex gap-2 flex-wrap">
                      {filters.jobStatus !== 'all' && (
                        <Badge variant="secondary" className="gap-1 rounded-sm px-2 font-normal">
                          Job: {filters.jobStatus === 'ACTIVE' ? 'Đang tuyển' : filters.jobStatus === 'CLOSED' ? 'Đã đóng' : 'Hết hạn'}
                          <X className="h-3 w-3 cursor-pointer hover:text-foreground" onClick={() => handleFilterChange('jobStatus', 'all')} />
                        </Badge>
                      )}
                      {filters.jobIds && (
                        <Badge variant="secondary" className="gap-1 rounded-sm px-2 font-normal">
                          Tin: {jobs.find((j) => j._id === filters.jobIds)?.title || 'Đã chọn'}
                          <X className="h-3 w-3 cursor-pointer hover:text-foreground" onClick={() => handleFilterChange('jobIds', '')} />
                        </Badge>
                      )}
                      {filters.status !== 'all' && (
                        <Badge variant="secondary" className="gap-1 rounded-sm px-2 font-normal">
                          HS: {filters.status}
                          <X className="h-3 w-3 cursor-pointer hover:text-foreground" onClick={() => handleFilterChange('status', 'all')} />
                        </Badge>
                      )}
                      {filters.search && (
                        <Badge variant="secondary" className="gap-1 rounded-sm px-2 font-normal">
                          Tìm: {filters.search}
                          <X className="h-3 w-3 cursor-pointer hover:text-foreground" onClick={() => { setSearchTerm(''); handleFilterChange('search', ''); }} />
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          setSearchTerm('');
                          setFilters(prev => ({
                            ...prev,
                            status: 'all',
                            jobStatus: 'ACTIVE',
                            jobIds: '',
                            search: ''
                          }));
                        }}
                      >
                        Xóa bộ lọc
                      </Button>
                    </div>
                  </div>
                )}
              </div>
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

                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((app) => (
                      <TableRow key={app._id} className="cursor-pointer hover:bg-gray-50" onClick={() => navigate(`/jobs/${app.jobId}/applications/${app._id}`)}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div>
                              <p className="font-medium">{app.candidateName}</p>
                              <p className="text-sm text-muted-foreground">{app.candidateEmail}</p>
                            </div>
                            {app.isReapplied && (
                              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs px-1.5 py-0.5">
                                <RefreshCw className="h-3 w-3 mr-1" />
                                Ứng tuyển lại
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {app.jobTitle || app.jobSnapshot?.title}
                            {getJobStatusBadge(app.jobStatus)}
                          </div>
                        </TableCell>
                        <TableCell>{utils.formatDate(app.appliedAt)}</TableCell>
                        <TableCell>{getStatusBadge(app.status)}</TableCell>

                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (app.jobStatus !== 'ACTIVE') {
                                toast.warning('Tin tuyển dụng này đã đóng hoặc hết hạn.');
                              }
                              navigate(`/jobs/recruiter/${app.jobId}`);
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
